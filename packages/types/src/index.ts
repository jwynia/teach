// @teach/types - Shared TypeScript definitions for Teach

// ============================================================================
// Core Type Aliases
// ============================================================================

export type RubricLevel = "not_demonstrated" | "partial" | "competent" | "strong";
export type AudienceLayer = "general" | "practitioner" | "specialist";
export type ScenarioVariantType = "interview" | "assessment" | "ongoing";
export type EvidenceType = "scenario_response" | "artifact" | "observation" | "self_assessment";

// ============================================================================
// Course & Curriculum Types
// ============================================================================

export interface Course {
  id: string;
  title: string;
  description: string;
  targetAudiences: AudienceLayer[];
  defaultProgressionPathId?: string;
  createdAt: Date;
  updatedAt: Date;
  units: Unit[];
}

export interface Unit {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  competencyIds?: string[];
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  order: number;
  audienceLayer?: AudienceLayer;
  competencyIds?: string[];
  prerequisiteLessonIds?: string[];
  content: LessonContent;
  activities: Activity[];
}

export interface LessonContent {
  type: "markdown" | "html";
  body: string;
}

export interface Activity {
  id: string;
  lessonId: string;
  type: "practice" | "quiz" | "discussion" | "scenario_assessment";
  title: string;
  instructions: string;
  audienceLayer?: AudienceLayer;
  competencyIds?: string[];
  scenarioId?: string;
  data: Record<string, unknown>;
}

// ============================================================================
// Competency Framework Types
// ============================================================================

export interface CompetencyCluster {
  id: string;
  courseId: string;
  name: string;
  prefix: string; // 2-4 letter code (e.g., "DP" for Data Privacy)
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Competency {
  id: string;
  courseId: string;
  clusterId?: string;
  code: string; // e.g., "DP-1"
  title: string; // Action verb phrase
  description: string; // Must start with "Can..."
  audienceLayer: AudienceLayer;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetencyDependency {
  id: string;
  competencyId: string;
  requiredCompetencyId: string;
  rationale?: string;
}

export interface RubricCriterion {
  id: string;
  competencyId: string;
  level: RubricLevel;
  description: string;
  indicators: string[];
}

// ============================================================================
// Scenario Assessment Types
// ============================================================================

export interface Scenario {
  id: string;
  courseId: string;
  name: string;
  coreDecision: string; // What judgment is being tested
  createdAt: Date;
  updatedAt: Date;
}

export interface ScenarioVariant {
  id: string;
  scenarioId: string;
  variant: ScenarioVariantType;
  content: string; // The scenario prompt
  contextNotes?: string;
  expectedDuration?: number; // Minutes
  followUpQuestions?: string[];
}

export interface ScenarioCompetencyMap {
  scenarioId: string;
  competencyId: string;
}

export interface ScenarioRubric {
  id: string;
  scenarioId: string;
  goodResponseIndicators: string[];
  redFlags: string[];
  partialIndicators?: string[];
  strongIndicators?: string[];
}

// ============================================================================
// Progression Model Types
// ============================================================================

export interface ProgressionPath {
  id: string;
  courseId: string;
  name: string;
  targetRole?: string;
  description: string;
  minimumViableCompetencyIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressionStep {
  id: string;
  pathId: string;
  competencyId: string;
  order: number;
  estimatedHours?: number;
  notes?: string;
}

export interface SkipLogicRule {
  id: string;
  courseId: string;
  condition: string;
  evidenceType: EvidenceType | "certification" | "portfolio" | "interview";
  skippableCompetencyIds: string[];
  createdAt: Date;
}

// ============================================================================
// Agent Configuration Types
// ============================================================================

export interface AgentConfig {
  id: string;
  courseId: string;
  name: string;
  role: "teaching" | "coaching" | "assessment" | "curriculum";
  instructions: string;
  model: string;
  temperature?: number;
  tools?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Learner & Progress Types
// ============================================================================

export interface Learner {
  id: string;
  externalId?: string;
  displayName?: string;
  createdAt: Date;
  lastSeenAt: Date;
}

export interface LearnerEnrollment {
  id: string;
  learnerId: string;
  courseId: string;
  progressionPathId?: string;
  enrolledAt: Date;
  completedAt?: Date;
}

export interface LearnerProgress {
  learnerId: string;
  courseId: string;
  progressionPathId?: string;
  completedLessons: string[];
  currentLesson?: string;
  assessmentResults: AssessmentResult[];
  competencyDemonstrations: CompetencyDemonstration[];
  lastAccessedAt: Date;
}

export interface LessonProgress {
  id: string;
  learnerId: string;
  courseId: string;
  lessonId: string;
  startedAt: Date;
  completedAt?: Date;
  timeSpentSeconds: number;
}

export interface ActivityProgress {
  id: string;
  learnerId: string;
  activityId: string;
  startedAt: Date;
  completedAt?: Date;
  responses: Record<string, unknown>;
}

// ============================================================================
// Competency Demonstration & Evidence Types
// ============================================================================

export interface CompetencyDemonstration {
  id: string;
  learnerId: string;
  competencyId: string;
  level: RubricLevel;
  demonstratedAt: Date;
  evidenceType: EvidenceType;
  evidenceId?: string; // Reference to assessment session or activity
  evaluatorNotes?: string;
  evaluatedBy?: string; // Agent ID or human evaluator
}

export interface CompetencyStatus {
  competencyId: string;
  currentLevel: RubricLevel;
  evidenceCount: number;
  lastDemonstrated?: Date;
  trend: "improving" | "stable" | "declining" | "unknown";
  gateStatus: "locked" | "available" | "completed";
}

// ============================================================================
// Assessment Types
// ============================================================================

export interface AssessmentSession {
  id: string;
  learnerId: string;
  courseId: string;
  scenarioId: string;
  variantType: ScenarioVariantType;
  mode: "realtime" | "async";
  status: "in_progress" | "completed" | "abandoned";
  startedAt: Date;
  completedAt?: Date;
  conversationHistory?: ConversationTurn[];
  submittedResponse?: string;
  evaluation?: SessionEvaluation;
}

export interface ConversationTurn {
  role: "agent" | "learner";
  content: string;
  timestamp: Date;
  metadata?: {
    followUpTriggered?: boolean;
    competencySignals?: CompetencySignal[];
  };
}

export interface CompetencySignal {
  competencyId: string;
  signalType: "positive" | "negative" | "partial";
  indicator: string;
}

export interface SessionEvaluation {
  overallAssessment: string;
  competencyResults: CompetencyResult[];
  feedback: FeedbackItem[];
  recommendedNextSteps?: string[];
}

export interface CompetencyResult {
  competencyId: string;
  level: RubricLevel;
  evidence: string[];
  rationale: string;
}

export interface FeedbackItem {
  type: "strength" | "improvement" | "clarification";
  content: string;
  competencyId?: string;
}

export interface AssessmentResult {
  id: string;
  learnerId: string;
  courseId: string;
  assessmentId?: string;
  scenarioId?: string;
  activityId?: string;
  score?: number;
  maxScore?: number;
  completedAt: Date;
  responses: Record<string, unknown>;
  rubricEvaluations: RubricEvaluation[];
}

export interface RubricEvaluation {
  competencyId: string;
  level: RubricLevel;
  feedback: string;
}

// ============================================================================
// Async Submission Types
// ============================================================================

export interface AsyncSubmission {
  id: string;
  learnerId: string;
  scenarioId: string;
  variantType: ScenarioVariantType;
  response: string;
  submittedAt: Date;
  status: "pending" | "evaluating" | "evaluated";
  evaluation?: AsyncEvaluation;
}

export interface AsyncEvaluation {
  evaluatedAt: Date;
  evaluatorAgentId: string;
  competencyResults: CompetencyResult[];
  detailedFeedback: DetailedFeedback;
  overallNarrative: string;
}

export interface DetailedFeedback {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  specificSuggestions: string[];
  rubricAlignment: {
    goodIndicatorsMet: string[];
    redFlagsObserved: string[];
  };
}

// ============================================================================
// Learning Session Types
// ============================================================================

export interface LearningSession {
  id: string;
  learnerId: string;
  courseId: string;
  lessonId?: string;
  agentType: "teaching" | "coaching" | "assessment";
  mastraThreadId?: string;
  startedAt: Date;
  endedAt?: Date;
}

// ============================================================================
// Feedback Loop Types
// ============================================================================

export interface LearnerQuestion {
  id: string;
  learnerId: string;
  courseId: string;
  lessonId?: string;
  competencyId?: string;
  questionText: string;
  questionCategory?: "training_gap" | "framework_gap" | "process_gap" | "unmapped";
  askedAt: Date;
  resolved: boolean;
}

// ============================================================================
// Document Generation Types
// ============================================================================

export type DocumentMaterialType =
  | "lecture-slides"
  | "student-handout"
  | "instructor-guide"
  | "assessment-worksheet";

export interface DocumentTemplate {
  id: string;
  name: string;
  type: "pptx" | "pdf" | "docx";
  materialType: DocumentMaterialType;
  filePath: string;
  organizationId?: string;
  placeholders: PlaceholderDefinition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaceholderDefinition {
  tag: string;
  description: string;
  dataPath?: string;
  required: boolean;
  defaultValue?: string;
}

export interface GeneratedDocument {
  id: string;
  courseId: string;
  unitId?: string;
  lessonId?: string;
  documentType: DocumentMaterialType;
  templateId?: string;
  filename: string;
  storagePath: string;
  fileSize: number;
  checksum: string;
  metadata: DocumentMetadata;
  generatedAt: Date;
  generatedBy?: string;
}

export interface DocumentMetadata {
  pageCount?: number;
  slideCount?: number;
  wordCount?: number;
  generatorVersion: string;
  templateVersion?: string;
}

export interface DocumentGenerationJob {
  id: string;
  courseId: string;
  lessonIds: string[];
  documentTypes: DocumentMaterialType[];
  status: "queued" | "processing" | "complete" | "failed";
  progress: { current: number; total: number };
  startedAt?: Date;
  completedAt?: Date;
  results?: GeneratedDocument[];
  errors?: string[];
}
