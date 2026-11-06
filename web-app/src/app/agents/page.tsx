import type { Metadata } from "next";
import AgentWorkbench from "@/components/AgentWorkbench";
export const metadata:Metadata={title:"Agent workspace",description:"Use your own model API key with 15 specialist roles and an evidence-based quality gate."};
export default function AgentsPage(){return <AgentWorkbench/>;}
