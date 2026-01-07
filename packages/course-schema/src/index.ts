// @teach/course-schema - Course export format and validation

import { z } from "zod";

// ============================================================================
// Core Type Schemas
// ============================================================================

export const RubricLevelSchema = z.enum([
  "not_demonstrated",
  "partial",
  "competent",
  "strong",
]);

export const AudienceLayerSchema = z.enum([
  "general",
  "practitioner",
  "specialist",
]);

export const ScenarioVariantTypeSchema = z.enum([
  "interview",
  "assessment",
  "ongoing",
]);

export const EvidenceTypeSchema = z.enum([
  "scenario_response",
  "artifact",
  "observation",
  "self_assessment",
]);

// ============================================================================
// Content Schemas
// ============================================================================

export const LessonContentSchema = z.object({
  type: z.enum(["markdown", "html"]),
  body: z.string(),
});

export const ActivitySchema = z.object({
  id: z.string(),
  type: z.enum(["practice", "quiz", "discussion", "scenario_assessment"]),
  title: z.string(),
  instructions: z.string(),
  audienceLayer: AudienceLayerSchema.optional(),
  competencyIds: z.array(z.string()).optional(),
  scenarioId: z.string().optional(),
  data: z.record(z.unknown()),
});

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  audienceLayer: AudienceLayerSchema.optional(),
  competencyIds: z.array(z.string()).optional(),
  prerequisiteLessonIds: z.array(z.string()).optional(),
  content: LessonContentSchema,
  activities: z.array(ActivitySchema),
});

export const UnitSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  competencyIds: z.array(z.string()).optional(),
  lessons: z.array(LessonSchema),
});

// ============================================================================
// Agent Configuration Schema
// ============================================================================

export const AgentConfigSchema = z.object({
  name: z.string(),
  role: z.enum(["teaching", "coaching", "assessment", "curriculum"]),
  instructions: z.string(),
  model: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  tools: z.array(z.string()).optional(),
});

// ============================================================================
// Competency Framework Schemas
// ============================================================================

export const RubricCriterionSchema = z.object({
  level: RubricLevelSchema,
  description: z.string(),
  indicators: z.array(z.string()),
});

export const CompetencySchema = z.object({
  id: z.string(),
  code: z.string(), // e.g., "DP-1"
  title: z.string(),
  description: z.string().refine(
    (val) => val.startsWith("Can "),
    { message: "Competency description must start with 'Can '" }
  ),
  audienceLayer: AudienceLayerSchema,
  order: z.number(),
  dependencyIds: z.array(z.string()).optional(),
  rubric: z.object({
    not_demonstrated: RubricCriterionSchema,
    partial: RubricCriterionSchema,
    competent: RubricCriterionSchema,
    strong: RubricCriterionSchema,
  }),
});

export const CompetencyClusterSchema = z.object({
  id: z.string(),
  name: z.string(),
  prefix: z.string().regex(/^[A-Z]{2,4}$/, {
    message: "Prefix must be 2-4 uppercase letters",
  }),
  description: z.string(),
  order: z.number(),
  competencies: z.array(CompetencySchema),
});

// ============================================================================
// Scenario Assessment Schemas
// ============================================================================

export const ScenarioVariantSchema = z.object({
  id: z.string(),
  variant: ScenarioVariantTypeSchema,
  content: z.string(),
  contextNotes: z.string().optional(),
  expectedDuration: z.number().optional(), // Minutes
  followUpQuestions: z.array(z.string()).optional(),
});

export const ScenarioRubricSchema = z.object({
  goodResponseIndicators: z.array(z.string()),
  redFlags: z.array(z.string()),
  partialIndicators: z.array(z.string()).optional(),
  strongIndicators: z.array(z.string()).optional(),
});

export const ScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  coreDecision: z.string(), // What judgment is being tested
  competencyIds: z.array(z.string()),
  variants: z.object({
    interview: ScenarioVariantSchema.optional(),
    assessment: ScenarioVariantSchema.optional(),
    ongoing: ScenarioVariantSchema.optional(),
  }).refine(
    (variants) => variants.interview || variants.assessment || variants.ongoing,
    { message: "At least one scenario variant is required" }
  ),
  rubric: ScenarioRubricSchema,
});

// ============================================================================
// Progression Model Schemas
// ============================================================================

export const ProgressionStepSchema = z.object({
  competencyId: z.string(),
  order: z.number(),
  estimatedHours: z.number().optional(),
  notes: z.string().optional(),
});

export const ProgressionPathSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetRole: z.string().optional(),
  description: z.string(),
  minimumViableCompetencyIds: z.array(z.string()),
  steps: z.array(ProgressionStepSchema),
});

export const SkipLogicRuleSchema = z.object({
  id: z.string(),
  condition: z.string(),
  evidenceType: z.enum([
    "scenario_response",
    "artifact",
    "observation",
    "self_assessment",
    "certification",
    "portfolio",
    "interview",
  ]),
  skippableCompetencyIds: z.array(z.string()),
});

// ============================================================================
// Competency Framework Schema (Complete)
// ============================================================================

export const CompetencyFrameworkSchema = z.object({
  clusters: z.array(CompetencyClusterSchema),
  scenarios: z.array(ScenarioSchema),
  progressionPaths: z.array(ProgressionPathSchema),
  skipLogicRules: z.array(SkipLogicRuleSchema).optional(),
});

// ============================================================================
// Assessment Result Schemas
// ============================================================================

export const RubricEvaluationSchema = z.object({
  competencyId: z.string(),
  level: RubricLevelSchema,
  feedback: z.string(),
});

export const CompetencyResultSchema = z.object({
  competencyId: z.string(),
  level: RubricLevelSchema,
  evidence: z.array(z.string()),
  rationale: z.string(),
});

export const FeedbackItemSchema = z.object({
  type: z.enum(["strength", "improvement", "clarification"]),
  content: z.string(),
  competencyId: z.string().optional(),
});

export const SessionEvaluationSchema = z.object({
  overallAssessment: z.string(),
  competencyResults: z.array(CompetencyResultSchema),
  feedback: z.array(FeedbackItemSchema),
  recommendedNextSteps: z.array(z.string()).optional(),
});

// ============================================================================
// Course Export Schema
// ============================================================================

export const CourseExportSchema = z.object({
  version: z.literal("1.0"),
  meta: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    targetAudiences: z.array(AudienceLayerSchema),
    exportedAt: z.string().datetime(),
    exportedBy: z.string().optional(),
  }),
  content: z.object({
    units: z.array(UnitSchema),
  }),
  competencyFramework: CompetencyFrameworkSchema.optional(),
  agents: z.object({
    teaching: AgentConfigSchema,
    coaching: AgentConfigSchema,
    assessment: AgentConfigSchema.optional(),
  }),
  assets: z.record(z.string()).optional(), // Asset ID -> URL or base64
});

// ============================================================================
// Type Exports
// ============================================================================

export type RubricLevel = z.infer<typeof RubricLevelSchema>;
export type AudienceLayer = z.infer<typeof AudienceLayerSchema>;
export type ScenarioVariantType = z.infer<typeof ScenarioVariantTypeSchema>;
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

export type LessonContent = z.infer<typeof LessonContentSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;

export type RubricCriterion = z.infer<typeof RubricCriterionSchema>;
export type Competency = z.infer<typeof CompetencySchema>;
export type CompetencyCluster = z.infer<typeof CompetencyClusterSchema>;

export type ScenarioVariant = z.infer<typeof ScenarioVariantSchema>;
export type ScenarioRubric = z.infer<typeof ScenarioRubricSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;

export type ProgressionStep = z.infer<typeof ProgressionStepSchema>;
export type ProgressionPath = z.infer<typeof ProgressionPathSchema>;
export type SkipLogicRule = z.infer<typeof SkipLogicRuleSchema>;
export type CompetencyFramework = z.infer<typeof CompetencyFrameworkSchema>;

export type RubricEvaluation = z.infer<typeof RubricEvaluationSchema>;
export type CompetencyResult = z.infer<typeof CompetencyResultSchema>;
export type FeedbackItem = z.infer<typeof FeedbackItemSchema>;
export type SessionEvaluation = z.infer<typeof SessionEvaluationSchema>;

export type CourseExport = z.infer<typeof CourseExportSchema>;

// ============================================================================
// Validation Utilities
// ============================================================================

export function validateCourseExport(data: unknown): CourseExport {
  return CourseExportSchema.parse(data);
}

export function safeParseCourseExport(data: unknown) {
  return CourseExportSchema.safeParse(data);
}

export function validateCompetencyFramework(data: unknown): CompetencyFramework {
  return CompetencyFrameworkSchema.parse(data);
}

export function safeParseCompetencyFramework(data: unknown) {
  return CompetencyFrameworkSchema.safeParse(data);
}

export function validateCompetency(data: unknown): Competency {
  return CompetencySchema.parse(data);
}

export function validateScenario(data: unknown): Scenario {
  return ScenarioSchema.parse(data);
}
