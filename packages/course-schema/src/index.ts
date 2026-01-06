// @teach/course-schema - Course export format and validation

import { z } from "zod";

// ============================================================================
// Content Schemas
// ============================================================================

export const LessonContentSchema = z.object({
  type: z.enum(["markdown", "html"]),
  body: z.string(),
});

export const ActivitySchema = z.object({
  id: z.string(),
  type: z.enum(["practice", "quiz", "discussion"]),
  title: z.string(),
  instructions: z.string(),
  data: z.record(z.unknown()),
});

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  content: LessonContentSchema,
  activities: z.array(ActivitySchema),
});

export const UnitSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
  lessons: z.array(LessonSchema),
});

// ============================================================================
// Agent Configuration Schema
// ============================================================================

export const AgentConfigSchema = z.object({
  name: z.string(),
  role: z.enum(["teaching", "coaching", "assessment"]),
  instructions: z.string(),
  model: z.string(),
  temperature: z.number().min(0).max(2).optional(),
  tools: z.array(z.string()).optional(),
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
    exportedAt: z.string().datetime(),
    exportedBy: z.string().optional(),
  }),
  content: z.object({
    units: z.array(UnitSchema),
  }),
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

export type LessonContent = z.infer<typeof LessonContentSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
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
