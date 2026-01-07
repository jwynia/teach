// Scenario Management Routes for Authoring API

import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { query, queryOne, execute } from "../db/client.js";
import { randomUUID } from "crypto";

const scenarios = new Hono();

// ============================================================================
// Validation Schemas
// ============================================================================

const CreateScenarioSchema = z.object({
  name: z.string().min(1),
  coreDecision: z.string().min(1),
  competencyIds: z.array(z.string()).optional(),
});

const UpdateScenarioSchema = z.object({
  name: z.string().min(1).optional(),
  coreDecision: z.string().min(1).optional(),
});

const ScenarioVariantSchema = z.object({
  content: z.string().min(1),
  contextNotes: z.string().optional(),
  expectedDuration: z.number().positive().optional(),
  followUpQuestions: z.array(z.string()).optional(),
});

const ScenarioRubricSchema = z.object({
  goodResponseIndicators: z.array(z.string()).min(1),
  redFlags: z.array(z.string()).min(1),
  partialIndicators: z.array(z.string()).optional(),
  strongIndicators: z.array(z.string()).optional(),
});

const AddCompetencyMapSchema = z.object({
  competencyId: z.string(),
});

const SetCompetencyMappingsSchema = z.object({
  competencyIds: z.array(z.string()),
});

// ============================================================================
// Database Row Types
// ============================================================================

interface ScenarioRow {
  id: string;
  course_id: string;
  name: string;
  core_decision: string;
  created_at: string;
  updated_at: string;
}

interface ScenarioVariantRow {
  id: string;
  scenario_id: string;
  variant: string;
  content: string;
  context_notes: string | null;
  expected_duration: number | null;
  follow_up_questions: string;
}

interface ScenarioRubricRow {
  id: string;
  scenario_id: string;
  good_response_indicators: string;
  red_flags: string;
  partial_indicators: string | null;
  strong_indicators: string | null;
}

interface ScenarioCompetencyMapRow {
  scenario_id: string;
  competency_id: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapScenarioRow(row: ScenarioRow) {
  return {
    id: row.id,
    courseId: row.course_id,
    name: row.name,
    coreDecision: row.core_decision,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapVariantRow(row: ScenarioVariantRow) {
  return {
    id: row.id,
    scenarioId: row.scenario_id,
    variant: row.variant,
    content: row.content,
    contextNotes: row.context_notes,
    expectedDuration: row.expected_duration,
    followUpQuestions: JSON.parse(row.follow_up_questions || "[]"),
  };
}

function mapRubricRow(row: ScenarioRubricRow) {
  return {
    id: row.id,
    scenarioId: row.scenario_id,
    goodResponseIndicators: JSON.parse(row.good_response_indicators),
    redFlags: JSON.parse(row.red_flags),
    partialIndicators: row.partial_indicators ? JSON.parse(row.partial_indicators) : [],
    strongIndicators: row.strong_indicators ? JSON.parse(row.strong_indicators) : [],
  };
}

// ============================================================================
// Scenario CRUD Routes
// ============================================================================

// GET /api/courses/:courseId/scenarios - List scenarios for a course
scenarios.get("/", async (c) => {
  const courseId = c.req.param("courseId");

  const course = await queryOne("SELECT id FROM courses WHERE id = ?", [courseId]);
  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  const rows = await query<ScenarioRow>(
    "SELECT * FROM scenarios WHERE course_id = ? ORDER BY created_at",
    [courseId]
  );

  return c.json(rows.map(mapScenarioRow));
});

// POST /api/courses/:courseId/scenarios - Create a scenario
scenarios.post("/", zValidator("json", CreateScenarioSchema), async (c) => {
  const courseId = c.req.param("courseId");
  const body = c.req.valid("json");

  const course = await queryOne("SELECT id FROM courses WHERE id = ?", [courseId]);
  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await execute(
    `INSERT INTO scenarios (id, course_id, name, core_decision, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, courseId, body.name, body.coreDecision, now, now]
  );

  // Add competency mappings if provided
  if (body.competencyIds && body.competencyIds.length > 0) {
    for (const compId of body.competencyIds) {
      const comp = await queryOne(
        "SELECT id FROM competencies WHERE id = ? AND course_id = ?",
        [compId, courseId]
      );
      if (!comp) {
        return c.json({ error: `Competency ${compId} not found in this course` }, 400);
      }
      await execute(
        "INSERT INTO scenario_competency_map (scenario_id, competency_id) VALUES (?, ?)",
        [id, compId]
      );
    }
  }

  const row = await queryOne<ScenarioRow>("SELECT * FROM scenarios WHERE id = ?", [id]);
  return c.json(mapScenarioRow(row!), 201);
});

// GET /api/scenarios/:id - Get a single scenario with variants, rubric, and competencies
scenarios.get("/:id", async (c) => {
  const id = c.req.param("id");

  const row = await queryOne<ScenarioRow>("SELECT * FROM scenarios WHERE id = ?", [id]);
  if (!row) {
    return c.json({ error: "Scenario not found" }, 404);
  }

  // Get variants
  const variantRows = await query<ScenarioVariantRow>(
    "SELECT * FROM scenario_variants WHERE scenario_id = ?",
    [id]
  );
  const variants: Record<string, ReturnType<typeof mapVariantRow>> = {};
  for (const v of variantRows) {
    variants[v.variant] = mapVariantRow(v);
  }

  // Get rubric
  const rubricRow = await queryOne<ScenarioRubricRow>(
    "SELECT * FROM scenario_rubrics WHERE scenario_id = ?",
    [id]
  );
  const rubric = rubricRow ? mapRubricRow(rubricRow) : null;

  // Get competency mappings
  const mappings = await query<ScenarioCompetencyMapRow>(
    "SELECT * FROM scenario_competency_map WHERE scenario_id = ?",
    [id]
  );
  const competencyIds = mappings.map((m) => m.competency_id);

  return c.json({
    ...mapScenarioRow(row),
    variants,
    rubric,
    competencyIds,
  });
});

// PUT /api/scenarios/:id - Update a scenario
scenarios.put("/:id", zValidator("json", UpdateScenarioSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<ScenarioRow>("SELECT * FROM scenarios WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Scenario not found" }, 404);
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.name !== undefined) {
    updates.push("name = ?");
    values.push(body.name);
  }
  if (body.coreDecision !== undefined) {
    updates.push("core_decision = ?");
    values.push(body.coreDecision);
  }

  if (updates.length > 0) {
    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    await execute(
      `UPDATE scenarios SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  const row = await queryOne<ScenarioRow>("SELECT * FROM scenarios WHERE id = ?", [id]);
  return c.json(mapScenarioRow(row!));
});

// DELETE /api/scenarios/:id - Delete a scenario
scenarios.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const existing = await queryOne<ScenarioRow>("SELECT * FROM scenarios WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Scenario not found" }, 404);
  }

  await execute("DELETE FROM scenarios WHERE id = ?", [id]);

  return c.json({ success: true, deletedId: id });
});

// ============================================================================
// Variant Routes
// ============================================================================

// GET /api/scenarios/:id/variants - Get all variants for a scenario
scenarios.get("/:id/variants", async (c) => {
  const scenarioId = c.req.param("id");

  const existing = await queryOne<ScenarioRow>("SELECT * FROM scenarios WHERE id = ?", [scenarioId]);
  if (!existing) {
    return c.json({ error: "Scenario not found" }, 404);
  }

  const rows = await query<ScenarioVariantRow>(
    "SELECT * FROM scenario_variants WHERE scenario_id = ?",
    [scenarioId]
  );

  const variants: Record<string, ReturnType<typeof mapVariantRow>> = {};
  for (const v of rows) {
    variants[v.variant] = mapVariantRow(v);
  }

  return c.json(variants);
});

// PUT /api/scenarios/:id/variants/:variant - Create or update a variant
scenarios.put("/:id/variants/:variant", zValidator("json", ScenarioVariantSchema), async (c) => {
  const scenarioId = c.req.param("id");
  const variant = c.req.param("variant");
  const body = c.req.valid("json");

  // Validate variant type
  if (!["interview", "assessment", "ongoing"].includes(variant)) {
    return c.json({ error: "Invalid variant type. Must be: interview, assessment, or ongoing" }, 400);
  }

  const existing = await queryOne<ScenarioRow>("SELECT * FROM scenarios WHERE id = ?", [scenarioId]);
  if (!existing) {
    return c.json({ error: "Scenario not found" }, 404);
  }

  // Check if variant exists
  const existingVariant = await queryOne<ScenarioVariantRow>(
    "SELECT * FROM scenario_variants WHERE scenario_id = ? AND variant = ?",
    [scenarioId, variant]
  );

  if (existingVariant) {
    // Update existing
    await execute(
      `UPDATE scenario_variants SET
       content = ?, context_notes = ?, expected_duration = ?, follow_up_questions = ?
       WHERE id = ?`,
      [
        body.content,
        body.contextNotes || null,
        body.expectedDuration || null,
        JSON.stringify(body.followUpQuestions || []),
        existingVariant.id,
      ]
    );
  } else {
    // Insert new
    const id = randomUUID();
    await execute(
      `INSERT INTO scenario_variants (id, scenario_id, variant, content, context_notes, expected_duration, follow_up_questions)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        scenarioId,
        variant,
        body.content,
        body.contextNotes || null,
        body.expectedDuration || null,
        JSON.stringify(body.followUpQuestions || []),
      ]
    );
  }

  const row = await queryOne<ScenarioVariantRow>(
    "SELECT * FROM scenario_variants WHERE scenario_id = ? AND variant = ?",
    [scenarioId, variant]
  );

  return c.json(mapVariantRow(row!));
});

// DELETE /api/scenarios/:id/variants/:variant - Delete a variant
scenarios.delete("/:id/variants/:variant", async (c) => {
  const scenarioId = c.req.param("id");
  const variant = c.req.param("variant");

  const existing = await queryOne<ScenarioRow>("SELECT * FROM scenarios WHERE id = ?", [scenarioId]);
  if (!existing) {
    return c.json({ error: "Scenario not found" }, 404);
  }

  await execute(
    "DELETE FROM scenario_variants WHERE scenario_id = ? AND variant = ?",
    [scenarioId, variant]
  );

  return c.json({ success: true });
});

// ============================================================================
// Rubric Routes
// ============================================================================

// GET /api/scenarios/:id/rubric - Get rubric for a scenario
scenarios.get("/:id/rubric", async (c) => {
  const scenarioId = c.req.param("id");

  const existing = await queryOne<ScenarioRow>("SELECT * FROM scenarios WHERE id = ?", [scenarioId]);
  if (!existing) {
    return c.json({ error: "Scenario not found" }, 404);
  }

  const row = await queryOne<ScenarioRubricRow>(
    "SELECT * FROM scenario_rubrics WHERE scenario_id = ?",
    [scenarioId]
  );

  if (!row) {
    return c.json(null);
  }

  return c.json(mapRubricRow(row));
});

// PUT /api/scenarios/:id/rubric - Create or update rubric
scenarios.put("/:id/rubric", zValidator("json", ScenarioRubricSchema), async (c) => {
  const scenarioId = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<ScenarioRow>("SELECT * FROM scenarios WHERE id = ?", [scenarioId]);
  if (!existing) {
    return c.json({ error: "Scenario not found" }, 404);
  }

  const existingRubric = await queryOne<ScenarioRubricRow>(
    "SELECT * FROM scenario_rubrics WHERE scenario_id = ?",
    [scenarioId]
  );

  if (existingRubric) {
    await execute(
      `UPDATE scenario_rubrics SET
       good_response_indicators = ?, red_flags = ?, partial_indicators = ?, strong_indicators = ?
       WHERE id = ?`,
      [
        JSON.stringify(body.goodResponseIndicators),
        JSON.stringify(body.redFlags),
        JSON.stringify(body.partialIndicators || []),
        JSON.stringify(body.strongIndicators || []),
        existingRubric.id,
      ]
    );
  } else {
    await execute(
      `INSERT INTO scenario_rubrics (id, scenario_id, good_response_indicators, red_flags, partial_indicators, strong_indicators)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        scenarioId,
        JSON.stringify(body.goodResponseIndicators),
        JSON.stringify(body.redFlags),
        JSON.stringify(body.partialIndicators || []),
        JSON.stringify(body.strongIndicators || []),
      ]
    );
  }

  return c.json({ success: true });
});

// ============================================================================
// Competency Mapping Routes
// ============================================================================

// GET /api/scenarios/:id/competencies - Get competency mappings
scenarios.get("/:id/competencies", async (c) => {
  const scenarioId = c.req.param("id");

  const existing = await queryOne<ScenarioRow>("SELECT * FROM scenarios WHERE id = ?", [scenarioId]);
  if (!existing) {
    return c.json({ error: "Scenario not found" }, 404);
  }

  const rows = await query<ScenarioCompetencyMapRow>(
    "SELECT * FROM scenario_competency_map WHERE scenario_id = ?",
    [scenarioId]
  );

  return c.json(rows.map((r) => r.competency_id));
});

// POST /api/scenarios/:id/competencies - Add a competency mapping
scenarios.post("/:id/competencies", zValidator("json", AddCompetencyMapSchema), async (c) => {
  const scenarioId = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<ScenarioRow>("SELECT * FROM scenarios WHERE id = ?", [scenarioId]);
  if (!existing) {
    return c.json({ error: "Scenario not found" }, 404);
  }

  const competency = await queryOne("SELECT id FROM competencies WHERE id = ?", [body.competencyId]);
  if (!competency) {
    return c.json({ error: "Competency not found" }, 404);
  }

  try {
    await execute(
      "INSERT INTO scenario_competency_map (scenario_id, competency_id) VALUES (?, ?)",
      [scenarioId, body.competencyId]
    );
  } catch {
    // Ignore duplicate key errors
  }

  return c.json({ success: true });
});

// PUT /api/scenarios/:id/competencies - Replace all competency mappings
scenarios.put("/:id/competencies", zValidator("json", SetCompetencyMappingsSchema), async (c) => {
  const scenarioId = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<ScenarioRow>("SELECT * FROM scenarios WHERE id = ?", [scenarioId]);
  if (!existing) {
    return c.json({ error: "Scenario not found" }, 404);
  }

  // Delete existing mappings
  await execute("DELETE FROM scenario_competency_map WHERE scenario_id = ?", [scenarioId]);

  // Validate and insert new mappings
  for (const compId of body.competencyIds) {
    const comp = await queryOne("SELECT id FROM competencies WHERE id = ?", [compId]);
    if (!comp) {
      return c.json({ error: `Competency ${compId} not found` }, 400);
    }
    await execute(
      "INSERT INTO scenario_competency_map (scenario_id, competency_id) VALUES (?, ?)",
      [scenarioId, compId]
    );
  }

  return c.json({ success: true, count: body.competencyIds.length });
});

// DELETE /api/scenarios/:id/competencies/:competencyId - Remove a competency mapping
scenarios.delete("/:id/competencies/:competencyId", async (c) => {
  const scenarioId = c.req.param("id");
  const competencyId = c.req.param("competencyId");

  await execute(
    "DELETE FROM scenario_competency_map WHERE scenario_id = ? AND competency_id = ?",
    [scenarioId, competencyId]
  );

  return c.json({ success: true });
});

export { scenarios };
