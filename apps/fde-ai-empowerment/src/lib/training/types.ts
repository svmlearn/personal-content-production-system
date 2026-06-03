export type EmployeeRole = "new_hire" | "sales" | "support" | "manager";

export interface Skill {
  id: string;
  name: string;
  score: number;
  maxScore: number;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: EmployeeRole;
  level: string;
  goal: string;
  completedCourses: string[];
  weakSkills: string[];
  skills: Skill[];
}

export interface Course {
  id: string;
  title: string;
  durationMin: number;
  type: "video" | "doc" | "workshop";
}

export interface PathStage {
  id: string;
  name: string;
  courses: Course[];
  practice: string;
  quiz: string;
  estimatedHours: number;
  status: "done" | "active" | "locked";
}

export interface LearningPath {
  id: string;
  role: EmployeeRole;
  title: string;
  stages: PathStage[];
  totalHours: number;
  progressPercent: number;
}

export type QuizType = "single" | "multi" | "scenario" | "short";

export interface QuizQuestion {
  id: string;
  type: QuizType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: string;
  value: string | string[];
}

export interface QuizGradeResult {
  score: number;
  total: number;
  details: { questionId: string; correct: boolean; explanation: string }[];
}

export type RoleplayRole =
  | "objection"
  | "complaint"
  | "interview"
  | "management";

export interface RoleplayMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export interface RoleplaySession {
  id: string;
  role: RoleplayRole;
  messages: RoleplayMessage[];
}

export interface RoleplayScore {
  overall: number;
  dimensions: { name: string; score: number }[];
  highlights: string[];
  improvements: string[];
}

export interface ScoreReport {
  progressPercent: number;
  quizAvg: number;
  roleplayAvg: number;
  skills: Skill[];
  weakPoints: string[];
  nextSteps: string[];
}

export interface DepartmentStats {
  department: string;
  completionRate: number;
  avgScore: number;
  weakTopics: string[];
  topLearners: { name: string; score: number }[];
  followUp: { name: string; reason: string }[];
}

export interface TrainingAnswer {
  answer: string;
  citations: string[];
  relatedCourses: string[];
}

export type TrainingView =
  | "home"
  | "path"
  | "qa"
  | "roleplay"
  | "quiz"
  | "report"
  | "admin";
