// @teach/types - Shared TypeScript definitions for Teach

// ============================================================================
// Course & Curriculum Types
// ============================================================================

export interface Course {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  units: Unit[];
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  content: LessonContent;
  activities: Activity[];
}

export interface LessonContent {
  type: "markdown" | "html";
  body: string;
}

export interface Activity {
  id: string;
  type: "practice" | "quiz" | "discussion";
  title: string;
  instructions: string;
  data: Record<string, unknown>;
}

// ============================================================================
// Agent Configuration Types
// ============================================================================

export interface AgentConfig {
  name: string;
  role: "teaching" | "coaching" | "assessment";
  instructions: string;
  model: string;
  temperature?: number;
  tools?: string[];
}

// ============================================================================
// Learner Progress Types
// ============================================================================

export interface LearnerProgress {
  learnerId: string;
  courseId: string;
  completedLessons: string[];
  currentLesson?: string;
  assessmentResults: AssessmentResult[];
  lastAccessedAt: Date;
}

export interface AssessmentResult {
  assessmentId: string;
  score: number;
  maxScore: number;
  completedAt: Date;
  responses: Record<string, unknown>;
}
