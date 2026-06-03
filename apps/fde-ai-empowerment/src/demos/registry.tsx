import type { ComponentType } from "react";
import EnterpriseKnowledgeDemo from "./enterprise-knowledge";
import SmartCustomerServiceDemo from "./smart-customer-service";
import SalesCopilotDemo from "./sales-copilot";
import GrowthCopilotDemo from "./growth-copilot";
import BiCopilotDemo from "./bi-copilot";
import ProcessAgentDemo from "./process-agent";
import DocumentGenDemo from "./document-gen";
import MeetingCopilotDemo from "./meeting-copilot";
import DevCopilotDemo from "./dev-copilot";
import QcRiskCopilotDemo from "./qc-risk-copilot";
import TrainingPlatformDemo from "./training-platform";
import IndustryExpertDemo from "./industry-expert";
import TobWorkbenchDemo from "./tob-workbench";

const demoComponents: Record<string, ComponentType> = {
  "paradigm-01": EnterpriseKnowledgeDemo,
  "paradigm-02": SmartCustomerServiceDemo,
  "paradigm-03": SalesCopilotDemo,
  "paradigm-04": GrowthCopilotDemo,
  "paradigm-05": BiCopilotDemo,
  "paradigm-06": ProcessAgentDemo,
  "paradigm-07": DocumentGenDemo,
  "paradigm-08": MeetingCopilotDemo,
  "paradigm-09": DevCopilotDemo,
  "paradigm-10": QcRiskCopilotDemo,
  "paradigm-11": TrainingPlatformDemo,
  "paradigm-12": IndustryExpertDemo,
  "paradigm-13": TobWorkbenchDemo,
};

export function getParadigmDemo(slug: string): ComponentType | null {
  return demoComponents[slug] ?? null;
}

export function hasParadigmDemo(slug: string): boolean {
  return slug in demoComponents;
}
