// Progression Path Routes for Authoring API

import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { query, queryOne, execute } from "../db/client.js";
import { randomUUID } from "crypto";

const paths = new Hono();

// ============================================================================
// Validation Schemas
// ============================================================================

const CreatePathSchema = z.object({
  name: z.string().min(1),
  targetRole: z.string().optional(),
  description: z.string(),
  minimumViableCompetencyIds: z.array(z.string()).default([]),
});

const UpdatePathSchema = z.object({
  name: z.string().min(1).optional(),
  targetRole: z.string().nullable().optional(),
  description: z.string().optional(),
  minimumViableCompetencyIds: z.array(z.string()).optional(),
});

const CreateStepSchema = z.object({
  competencyId: z.string(),
  order: z.number().optional(),
  estimatedHours: z.number().positive().optional(),
  notes: z.string().optional(),
});

const UpdateStepSchema = z.object({
  competencyId: z.string().optional(),
  order: z.number().optional(),
  estimatedHours: z.number().positive().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const ReorderStepsSchema = z.object({
  stepIds: z.array(z.string()),
});

const EvidenceTypeEnum = z.enum([
  "scenario_response",
  "artifact",
  "observation",
  "self_assessment",
  "certification",
  "portfolio",
  "interview",
]);

const CreateSkipLogicSchema = z.object({
  condition: z.string().min(1),
  evidenceType: EvidenceTypeEnum,
  skippableCompetencyIds: z.array(z.string()).min(1),
});

const UpdateSkipLogicSchema = z.object({
  condition: z.string().min(1).optional(),
  evidenceType: EvidenceTypeEnum.optional(),
  skippableCompetencyIds: z.array(z.string()).min(1).optional(),
});

// ============================================================================
// Database Row Types
// ============================================================================

interface ProgressionPathRow {
  id: string;
  course_id: string;
  name: string;
  target_role: string | null;
  description: string;
  minimum_viable_competency_ids: string;
  created_at: string;
  updated_at: string;
}

interface ProgressionStepRow {
  id: string;
  path_id: string;
  competency_id: string;
  order: number;
  estimated_hours: number | null;
  notes: string | null;
}

interface SkipLogicRuleRow {
  id: string;
  course_id: string;
  condition: string;
  evidence_type: string;
  skippable_competency_ids: string;
  created_at: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapPathRow(row: ProgressionPathRow) {
  return {
    id: row.id,
    courseId: row.course_id,
    name: row.name,
    targetRole: row.target_role,
    description: row.description,
    minimumViableCompetencyIds: JSON.parse(row.minimum_viable_competency_ids),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapStepRow(row: ProgressionStepRow) {
  return {
    id: row.id,
    pathId: row.path_id,
    competencyId: row.competency_id,
    order: row.order,
    estimatedHours: row.estimated_hours,
    notes: row.notes,
  };
}

function mapSkipLogicRow(row: SkipLogicRuleRow) {
  return {
    id: row.id,
    courseId: row.course_id,
    condition: row.condition,
    evidenceType: row.evidence_type,
    skippableCompetencyIds: JSON.parse(row.skippable_competency_ids),
    createdAt: row.created_at,
  };
}

// ============================================================================
// Progression Path Routes
// ============================================================================

// GET /api/courses/:courseId/paths - List paths for a course
paths.get("/", async (c) => {
  const courseId = c.req.param("courseId");

  const course = await queryOne("SELECT id FROM courses WHERE id = ?", [courseId]);
  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  const rows = await query<ProgressionPathRow>(
    "SELECT * FROM progression_paths WHERE course_id = ? ORDER BY created_at",
    [courseId]
  );

  return c.json(rows.map(mapPathRow));
});

// POST /api/courses/:courseId/paths - Create a path
paths.post("/", zValidator("json", CreatePathSchema), async (c) => {
  const courseId = c.req.param("courseId");
  const body = c.req.valid("json");

  const course = await queryOne("SELECT id FROM courses WHERE id = ?", [courseId]);
  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  // Validate minimum viable competency IDs
  for (const compId of body.minimumViableCompetencyIds) {
    const comp = await queryOne(
      "SELECT id FROM competencies WHERE id = ? AND course_id = ?",
      [compId, courseId]
    );
    if (!comp) {
      return c.json({ error: `Competency ${compId} not found in this course` }, 400);
    }
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await execute(
    `INSERT INTO progression_paths (id, course_id, name, target_role, description, minimum_viable_competency_ids, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      courseId,
      body.name,
      body.targetRole || null,
      body.description,
      JSON.stringify(body.minimumViableCompetencyIds),
      now,
      now,
    ]
  );

  const row = await queryOne<ProgressionPathRow>("SELECT * FROM progression_paths WHERE id = ?", [id]);
  return c.json(mapPathRow(row!), 201);
});

// GET /api/paths/:id - Get a single path with steps
paths.get("/:id", async (c) => {
  const id = c.req.param("id");

  const row = await queryOne<ProgressionPathRow>("SELECT * FROM progression_paths WHERE id = ?", [id]);
  if (!row) {
    return c.json({ error: "Path not found" }, 404);
  }

  // Get steps for this path
  const steps = await query<ProgressionStepRow>(
    'SELECT * FROM progression_steps WHERE path_id = ? ORDER BY "order"',
    [id]
  );

  return c.json({
    ...mapPathRow(row),
    steps: steps.map(mapStepRow),
  });
});

// PUT /api/paths/:id - Update a path
paths.put("/:id", zValidator("json", UpdatePathSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<ProgressionPathRow>("SELECT * FROM progression_paths WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Path not found" }, 404);
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.name !== undefined) {
    updates.push("name = ?");
    values.push(body.name);
  }
  if (body.targetRole !== undefined) {
    updates.push("target_role = ?");
    values.push(body.targetRole);
  }
  if (body.description !== undefined) {
    updates.push("description = ?");
    values.push(body.description);
  }
  if (body.minimumViableCompetencyIds !== undefined) {
    updates.push("minimum_viable_competency_ids = ?");
    values.push(JSON.stringify(body.minimumViableCompetencyIds));
  }

  if (updates.length > 0) {
    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    await execute(
      `UPDATE progression_paths SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  const row = await queryOne<ProgressionPathRow>("SELECT * FROM progression_paths WHERE id = ?", [id]);
  return c.json(mapPathRow(row!));
});

// DELETE /api/paths/:id - Delete a path
paths.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const existing = await queryOne<ProgressionPathRow>("SELECT * FROM progression_paths WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Path not found" }, 404);
  }

  await execute("DELETE FROM progression_paths WHERE id = ?", [id]);

  return c.json({ success: true, deletedId: id });
});

// ============================================================================
// Progression Step Routes
// ============================================================================

// GET /api/paths/:pathId/steps - List steps for a path
paths.get("/:pathId/steps", async (c) => {
  const pathId = c.req.param("pathId");

  const path = await queryOne("SELECT id FROM progression_paths WHERE id = ?", [pathId]);
  if (!path) {
    return c.json({ error: "Path not found" }, 404);
  }

  const rows = await query<ProgressionStepRow>(
    'SELECT * FROM progression_steps WHERE path_id = ? ORDER BY "order"',
    [pathId]
  );

  return c.json(rows.map(mapStepRow));
});

// POST /api/paths/:pathId/steps - Add a step to a path
paths.post("/:pathId/steps", zValidator("json", CreateStepSchema), async (c) => {
  const pathId = c.req.param("pathId");
  const body = c.req.valid("json");

  const path = await queryOne("SELECT id FROM progression_paths WHERE id = ?", [pathId]);
  if (!path) {
    return c.json({ error: "Path not found" }, 404);
  }

  const competency = await queryOne("SELECT id FROM competencies WHERE id = ?", [body.competencyId]);
  if (!competency) {
    return c.json({ error: "Competency not found" }, 404);
  }

  let order = body.order;
  if (order === undefined) {
    const maxOrder = await queryOne<{ max_order: number | null }>(
      'SELECT MAX("order") as max_order FROM progression_steps WHERE path_id = ?',
      [pathId]
    );
    order = (maxOrder?.max_order ?? -1) + 1;
  }

  const id = randomUUID();

  await execute(
    `INSERT INTO progression_steps (id, path_id, competency_id, "order", estimated_hours, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, pathId, body.competencyId, order, body.estimatedHours || null, body.notes || null]
  );

  const row = await queryOne<ProgressionStepRow>("SELECT * FROM progression_steps WHERE id = ?", [id]);
  return c.json(mapStepRow(row!), 201);
});

// GET /api/steps/:id - Get a single step
paths.get("/steps/:id", async (c) => {
  const id = c.req.param("id");

  const row = await queryOne<ProgressionStepRow>("SELECT * FROM progression_steps WHERE id = ?", [id]);
  if (!row) {
    return c.json({ error: "Step not found" }, 404);
  }

  return c.json(mapStepRow(row));
});

// PUT /api/steps/:id - Update a step
paths.put("/steps/:id", zValidator("json", UpdateStepSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<ProgressionStepRow>("SELECT * FROM progression_steps WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Step not found" }, 404);
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.competencyId !== undefined) {
    const competency = await queryOne("SELECT id FROM competencies WHERE id = ?", [body.competencyId]);
    if (!competency) {
      return c.json({ error: "Competency not found" }, 404);
    }
    updates.push("competency_id = ?");
    values.push(body.competencyId);
  }
  if (body.order !== undefined) {
    updates.push('"order" = ?');
    values.push(body.order);
  }
  if (body.estimatedHours !== undefined) {
    updates.push("estimated_hours = ?");
    values.push(body.estimatedHours);
  }
  if (body.notes !== undefined) {
    updates.push("notes = ?");
    values.push(body.notes);
  }

  if (updates.length > 0) {
    values.push(id);
    await execute(
      `UPDATE progression_steps SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  const row = await queryOne<ProgressionStepRow>("SELECT * FROM progression_steps WHERE id = ?", [id]);
  return c.json(mapStepRow(row!));
});

// DELETE /api/steps/:id - Delete a step
paths.delete("/steps/:id", async (c) => {
  const id = c.req.param("id");

  const existing = await queryOne<ProgressionStepRow>("SELECT * FROM progression_steps WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Step not found" }, 404);
  }

  await execute("DELETE FROM progression_steps WHERE id = ?", [id]);

  return c.json({ success: true, deletedId: id });
});

// PATCH /api/paths/:pathId/steps/reorder - Reorder steps in a path
paths.patch("/:pathId/steps/reorder", zValidator("json", ReorderStepsSchema), async (c) => {
  const pathId = c.req.param("pathId");
  const body = c.req.valid("json");

  const path = await queryOne("SELECT id FROM progression_paths WHERE id = ?", [pathId]);
  if (!path) {
    return c.json({ error: "Path not found" }, 404);
  }

  // Update order for each step
  for (let i = 0; i < body.stepIds.length; i++) {
    await execute(
      `UPDATE progression_steps SET "order" = ? WHERE id = ? AND path_id = ?`,
      [i, body.stepIds[i], pathId]
    );
  }

  // Return updated list
  const rows = await query<ProgressionStepRow>(
    'SELECT * FROM progression_steps WHERE path_id = ? ORDER BY "order"',
    [pathId]
  );

  return c.json(rows.map(mapStepRow));
});

// ============================================================================
// Skip Logic Rule Routes (Separate Router)
// ============================================================================

const skipLogic = new Hono();

// GET /api/courses/:courseId/skip-logic - List skip logic rules
skipLogic.get("/", async (c) => {
  const courseId = c.req.param("courseId");

  const course = await queryOne("SELECT id FROM courses WHERE id = ?", [courseId]);
  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  const rows = await query<SkipLogicRuleRow>(
    "SELECT * FROM skip_logic_rules WHERE course_id = ? ORDER BY created_at",
    [courseId]
  );

  return c.json(rows.map(mapSkipLogicRow));
});

// POST /api/courses/:courseId/skip-logic - Create a skip logic rule
skipLogic.post("/", zValidator("json", CreateSkipLogicSchema), async (c) => {
  const courseId = c.req.param("courseId");
  const body = c.req.valid("json");

  const course = await queryOne("SELECT id FROM courses WHERE id = ?", [courseId]);
  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  // Validate skippable competency IDs
  for (const compId of body.skippableCompetencyIds) {
    const comp = await queryOne(
      "SELECT id FROM competencies WHERE id = ? AND course_id = ?",
      [compId, courseId]
    );
    if (!comp) {
      return c.json({ error: `Competency ${compId} not found in this course` }, 400);
    }
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await execute(
    `INSERT INTO skip_logic_rules (id, course_id, condition, evidence_type, skippable_competency_ids, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, courseId, body.condition, body.evidenceType, JSON.stringify(body.skippableCompetencyIds), now]
  );

  const row = await queryOne<SkipLogicRuleRow>("SELECT * FROM skip_logic_rules WHERE id = ?", [id]);
  return c.json(mapSkipLogicRow(row!), 201);
});

// GET /api/skip-logic/:id - Get a single skip logic rule
skipLogic.get("/:id", async (c) => {
  const id = c.req.param("id");

  const row = await queryOne<SkipLogicRuleRow>("SELECT * FROM skip_logic_rules WHERE id = ?", [id]);
  if (!row) {
    return c.json({ error: "Skip logic rule not found" }, 404);
  }

  return c.json(mapSkipLogicRow(row));
});

// PUT /api/skip-logic/:id - Update a skip logic rule
skipLogic.put("/:id", zValidator("json", UpdateSkipLogicSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<SkipLogicRuleRow>("SELECT * FROM skip_logic_rules WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Skip logic rule not found" }, 404);
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.condition !== undefined) {
    updates.push("condition = ?");
    values.push(body.condition);
  }
  if (body.evidenceType !== undefined) {
    updates.push("evidence_type = ?");
    values.push(body.evidenceType);
  }
  if (body.skippableCompetencyIds !== undefined) {
    updates.push("skippable_competency_ids = ?");
    values.push(JSON.stringify(body.skippableCompetencyIds));
  }

  if (updates.length > 0) {
    values.push(id);
    await execute(
      `UPDATE skip_logic_rules SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  const row = await queryOne<SkipLogicRuleRow>("SELECT * FROM skip_logic_rules WHERE id = ?", [id]);
  return c.json(mapSkipLogicRow(row!));
});

// DELETE /api/skip-logic/:id - Delete a skip logic rule
skipLogic.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const existing = await queryOne<SkipLogicRuleRow>("SELECT * FROM skip_logic_rules WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Skip logic rule not found" }, 404);
  }

  await execute("DELETE FROM skip_logic_rules WHERE id = ?", [id]);

  return c.json({ success: true, deletedId: id });
});

export { paths, skipLogic };
