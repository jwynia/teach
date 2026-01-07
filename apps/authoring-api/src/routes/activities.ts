// Activity CRUD Routes for Authoring API

import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { query, queryOne, execute } from "../db/client.js";
import { randomUUID } from "crypto";

const activities = new Hono();

// ============================================================================
// Validation Schemas
// ============================================================================

const CreateActivitySchema = z.object({
  type: z.enum(["practice", "quiz", "discussion", "scenario_assessment"]),
  title: z.string().min(1),
  instructions: z.string(),
  audienceLayer: z.enum(["general", "practitioner", "specialist"]).optional(),
  scenarioId: z.string().optional(),
  data: z.record(z.unknown()).default({}),
});

const UpdateActivitySchema = z.object({
  type: z.enum(["practice", "quiz", "discussion", "scenario_assessment"]).optional(),
  title: z.string().min(1).optional(),
  instructions: z.string().optional(),
  audienceLayer: z.enum(["general", "practitioner", "specialist"]).nullable().optional(),
  scenarioId: z.string().nullable().optional(),
  data: z.record(z.unknown()).optional(),
});

// ============================================================================
// Database Row Types
// ============================================================================

interface ActivityRow {
  id: string;
  lesson_id: string;
  type: string;
  title: string;
  instructions: string;
  audience_layer: string | null;
  scenario_id: string | null;
  data: string;
  created_at: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapActivityRow(row: ActivityRow) {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    type: row.type,
    title: row.title,
    instructions: row.instructions,
    audienceLayer: row.audience_layer,
    scenarioId: row.scenario_id,
    data: JSON.parse(row.data),
    createdAt: row.created_at,
  };
}

// ============================================================================
// Routes
// ============================================================================

// GET /api/lessons/:lessonId/activities - List activities for a lesson
activities.get("/", async (c) => {
  const lessonId = c.req.param("lessonId");

  // Verify lesson exists
  const lesson = await queryOne("SELECT id FROM lessons WHERE id = ?", [lessonId]);
  if (!lesson) {
    return c.json({ error: "Lesson not found" }, 404);
  }

  const rows = await query<ActivityRow>(
    "SELECT * FROM activities WHERE lesson_id = ?",
    [lessonId]
  );

  return c.json(rows.map(mapActivityRow));
});

// POST /api/lessons/:lessonId/activities - Create an activity
activities.post("/", zValidator("json", CreateActivitySchema), async (c) => {
  const lessonId = c.req.param("lessonId");
  const body = c.req.valid("json");

  // Verify lesson exists
  const lesson = await queryOne("SELECT id FROM lessons WHERE id = ?", [lessonId]);
  if (!lesson) {
    return c.json({ error: "Lesson not found" }, 404);
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await execute(
    `INSERT INTO activities (id, lesson_id, type, title, instructions, audience_layer, scenario_id, data, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      lessonId,
      body.type,
      body.title,
      body.instructions,
      body.audienceLayer || null,
      body.scenarioId || null,
      JSON.stringify(body.data),
      now,
    ]
  );

  const row = await queryOne<ActivityRow>("SELECT * FROM activities WHERE id = ?", [id]);
  return c.json(mapActivityRow(row!), 201);
});

// GET /api/activities/:id - Get a single activity
activities.get("/:id", async (c) => {
  const id = c.req.param("id");

  const row = await queryOne<ActivityRow>("SELECT * FROM activities WHERE id = ?", [id]);
  if (!row) {
    return c.json({ error: "Activity not found" }, 404);
  }

  // Get competency IDs
  const competencies = await query<{ competency_id: string }>(
    "SELECT competency_id FROM activity_competencies WHERE activity_id = ?",
    [id]
  );

  return c.json({
    ...mapActivityRow(row),
    competencyIds: competencies.map((r) => r.competency_id),
  });
});

// PUT /api/activities/:id - Update an activity
activities.put("/:id", zValidator("json", UpdateActivitySchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<ActivityRow>("SELECT * FROM activities WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Activity not found" }, 404);
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.type !== undefined) {
    updates.push("type = ?");
    values.push(body.type);
  }
  if (body.title !== undefined) {
    updates.push("title = ?");
    values.push(body.title);
  }
  if (body.instructions !== undefined) {
    updates.push("instructions = ?");
    values.push(body.instructions);
  }
  if (body.audienceLayer !== undefined) {
    updates.push("audience_layer = ?");
    values.push(body.audienceLayer);
  }
  if (body.scenarioId !== undefined) {
    updates.push("scenario_id = ?");
    values.push(body.scenarioId);
  }
  if (body.data !== undefined) {
    updates.push("data = ?");
    values.push(JSON.stringify(body.data));
  }

  if (updates.length > 0) {
    values.push(id);
    await execute(
      `UPDATE activities SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  const row = await queryOne<ActivityRow>("SELECT * FROM activities WHERE id = ?", [id]);
  return c.json(mapActivityRow(row!));
});

// DELETE /api/activities/:id - Delete an activity
activities.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const existing = await queryOne<ActivityRow>("SELECT * FROM activities WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Activity not found" }, 404);
  }

  await execute("DELETE FROM activities WHERE id = ?", [id]);

  return c.json({ success: true, deletedId: id });
});

// POST /api/activities/:id/competencies - Add competency mapping
activities.post("/:id/competencies", zValidator("json", z.object({
  competencyId: z.string(),
})), async (c) => {
  const id = c.req.param("id");
  const { competencyId } = c.req.valid("json");

  // Verify activity exists
  const activity = await queryOne("SELECT id FROM activities WHERE id = ?", [id]);
  if (!activity) {
    return c.json({ error: "Activity not found" }, 404);
  }

  try {
    await execute(
      "INSERT INTO activity_competencies (activity_id, competency_id) VALUES (?, ?)",
      [id, competencyId]
    );
  } catch {
    // Ignore duplicate key errors
  }

  return c.json({ success: true });
});

// DELETE /api/activities/:id/competencies/:competencyId - Remove competency mapping
activities.delete("/:id/competencies/:competencyId", async (c) => {
  const id = c.req.param("id");
  const competencyId = c.req.param("competencyId");

  await execute(
    "DELETE FROM activity_competencies WHERE activity_id = ? AND competency_id = ?",
    [id, competencyId]
  );

  return c.json({ success: true });
});

export { activities };
