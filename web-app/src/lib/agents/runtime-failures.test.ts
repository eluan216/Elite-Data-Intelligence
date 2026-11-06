import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAndRunTask, readTask } from "./runtime";
import { runIntake } from "./roles/intake";
import { runResearch } from "./roles/research";
import { runValidation } from "./roles/validation";
import { persistTerminalTask } from "./persist";
import { clearTasksForTests } from "./store";
vi.mock("./roles/intake",()=>({runIntake:vi.fn()}));
vi.mock("./roles/research",()=>({runResearch:vi.fn()}));
vi.mock("./roles/validation",()=>({runValidation:vi.fn()}));
vi.mock("./persist",()=>({persistTerminalTask:vi.fn()}));
beforeEach(()=>{
 vi.resetAllMocks(); clearTasksForTests();
 vi.mocked(runIntake).mockResolvedValue({title:"T",problem:"P",missingInformation:[],acceptanceCriteria:[],proposedSubtasks:[],riskNotes:[]});
 vi.mocked(runResearch).mockResolvedValue({findings:[],facts:[],assumptions:[],limitations:[],evidence:[]});
 vi.mocked(runValidation).mockResolvedValue({outcome:"needs_human_review",checks:[],summary:"Review"});
 vi.mocked(persistTerminalTask).mockResolvedValue({kind:"memory"});
});
describe("agent runtime failure isolation",()=>{
 it.each([0,1,2])("fails stage %i and skips downstream agents",async stage=>{
  const runs=[runIntake,runResearch,runValidation];
  vi.mocked(runs[stage]).mockRejectedValue(new Error("Provider unavailable"));
  const task=await createAndRunTask({request:"Analyze ticket backlog"});
  expect(task.status).toBe("failed");
  expect(task.steps.map(s=>s.status)).toEqual(
   stage===0?["failed","skipped","skipped"]:stage===1?["passed","failed","skipped"]:["passed","passed","failed"]);
  expect(persistTerminalTask).toHaveBeenCalledTimes(1);
  expect(readTask(task.id)?.status).toBe("failed");
 });
 it("retains outcome and saves task if persistence throws",async()=>{
  vi.mocked(persistTerminalTask).mockRejectedValue(new Error("Storage down"));
  const task=await createAndRunTask({request:"Analyze ticket backlog"});
  expect(task.status).toBe("awaiting_human");
  expect(task.persistence?.kind).toBe("memory");
  expect(persistTerminalTask).toHaveBeenCalledTimes(1);
  expect(readTask(task.id)).toEqual(task);
 });
});
