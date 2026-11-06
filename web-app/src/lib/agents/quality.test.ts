import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { completeJson } from "./llm";
import { runIntake } from "./roles/intake";
import { runResearch } from "./roles/research";
import { runValidation } from "./roles/validation";
import type { AgentTask } from "./types";

vi.mock("./llm", () => ({ completeJson: vi.fn(), getOpenAiKey: () => "test-key" }));
const reply = (data: unknown) => vi.mocked(completeJson).mockResolvedValue({ data, mode: "llm" });
const task = (): AgentTask => ({
 id: "test", createdAt: "", updatedAt: "", status: "running", request: "Reduce ticket backlog", mode: "llm", steps: [],
 brief: {title:"Tickets", problem:"Reduce ticket backlog", missingInformation:[], acceptanceCriteria:[{id:"TARGET",description:"Backlog reduced by 20% on held-out data",measurable:true}],proposedSubtasks:[],riskNotes:[]},
 research:{findings:["An analysis plan exists"],facts:[],assumptions:[],limitations:["Requester evidence is not independently verified"],evidence:["Observed backlog fell 25%"]}
});
beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.unstubAllEnvs());
describe("agent output contracts and quality gate", () => {
 it.each([null, [], {title:"Brief"}])("rejects malformed intake: %j", async data => {
  reply(data); await expect(runIntake("Reduce backlog")).rejects.toThrow(/intake/i);
 });
 it("rejects duplicate criteria and coerced booleans", async () => {
  reply({title:"Brief",problem:"Problem",missingInformation:[],acceptanceCriteria:[{id:"A",description:"Measure",measurable:"false"},{id:"A",description:"Again",measurable:true}],proposedSubtasks:[],riskNotes:[]});
  await expect(runIntake("Reduce backlog")).rejects.toThrow(/intake/i);
 });
 it.each([null, {findings:[{}],facts:[],assumptions:[],limitations:[],evidence:[]}])("rejects malformed research: %j", async data => {
  reply(data); await expect(runResearch({request:"Reduce backlog"})).rejects.toThrow(/research/i);
 });
 it("rejects invented evidence quotes", async () => {
  reply({findings:["Sales increased"],facts:[],assumptions:[],limitations:["Requester supplied data only"],evidence:["Revenue doubled"]});
  await expect(runResearch({request:"Analyze sales",evidence:"Revenue was flat"})).rejects.toThrow(/evidence/i);
 });
 it("does not pass an empty set of criteria", async () => {
  reply({outcome:"pass",checks:[],summary:"All good"});
  const t=task(); t.brief!.acceptanceCriteria=[];
  expect((await runValidation(t)).outcome).toBe("needs_human_review");
 });
 it.each([
  {outcome:"pass",checks:[],summary:"All good"},
  {outcome:"pass",checks:[{criterionId:"OTHER",result:"pass",note:"Done"}],summary:"All good"},
  {outcome:"pass",checks:[{criterionId:"TARGET",result:"unknown",note:"No results"}],summary:"All good"},
  null
 ])("requires complete, valid checks: %j", async data => {
  reply(data); const out=await runValidation(task());
  expect(out.outcome).toBe("needs_human_review");
  expect(out.checks.map(c=>c.criterionId)).toEqual(["TARGET"]);
 });
 it("derives failure from checks even when the model claims pass", async () => {
  reply({outcome:"pass",checks:[{criterionId:"TARGET",result:"fail",note:"Target missed"}],summary:"All good"});
  expect((await runValidation(task())).outcome).toBe("fail");
 });
 it("cannot certify a result without supplied evidence", async () => {
  reply({outcome:"pass",checks:[{criterionId:"TARGET",result:"pass",note:"Verified"}],summary:"All good"});
  const t=task(); t.research!.evidence=[];
  expect((await runValidation(t)).outcome).toBe("needs_human_review");
 });
 it("requires unresolved intake questions to be answered", async () => {
  reply({outcome:"pass",checks:[{criterionId:"TARGET",result:"pass",note:"Verified"}],summary:"All good"});
  const t=task(); t.brief!.missingInformation=["Confirm decision owner"];
  expect((await runValidation(t)).outcome).toBe("needs_human_review");
 });
 it("rejects duplicate checks even with evidence", async () => {
  const check={criterionId:"TARGET",result:"pass",note:"Verified"};
  reply({outcome:"pass",checks:[check,check],summary:"All good"});
  expect((await runValidation(task())).outcome).toBe("needs_human_review");
 });
 it("allows a complete model check with supplied evidence", async () => {
  reply({outcome:"pass",checks:[{criterionId:"TARGET",result:"pass",note:"Observed backlog fell 25%"}],summary:"Target met"});
  const t=task(); t.research!.evidence=["Observed backlog fell 25%"];
  expect((await runValidation(t)).outcome).toBe("pass");
 });
});
