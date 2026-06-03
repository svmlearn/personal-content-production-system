export interface SemanticMetric {
  id: string;
  name: string;
  definition: string;
  formula: string;
  dimensions: string[];
  owner: string;
  refreshCycle: string;
}

export interface SqlPreview {
  question: string;
  sql: string;
  tables: string[];
  estimatedRows: number;
  explanation: string;
}

export interface FunnelStep {
  name: string;
  users: number;
  rate: number;
  dropoff: number;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: "line" | "bar" | "funnel" | "kpi";
  description: string;
}
