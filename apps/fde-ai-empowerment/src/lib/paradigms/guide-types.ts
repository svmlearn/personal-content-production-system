export interface ParadigmGuide {
  slug: string;
  highlights: string[];
  introduction: string;
  logic: {
    flow: string[];
    modules: string[];
    mockFunctions?: string[];
  };
  llmRole: string[];
  suitableProjects: string[];
  suitableIndustries: string[];
}
