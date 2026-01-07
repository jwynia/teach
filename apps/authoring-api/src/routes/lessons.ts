// Lesson CRUD Routes for Authoring API

import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { query, queryOne, execute } from "../db/client.js";
import { randomUUID } from "crypto";

const lessons = new Hono();

// ============================================================================
// Validation Schemas
// ============================================================================

const CreateLessonSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  order: z.number().optional(),
  contentType: z.enum(["markdown", "html"]).default("markdown"),
  contentBody: z.string().default(""),
  audienceLayer: z.enum(["general", "practitioner", "specialist"]).optional(),
});

const UpdateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().optional(),
  contentType: z.enum(["markdown", "html"]).optional(),
  contentBody: z.string().optional(),
  audienceLayer: z.enum(["general", "practitioner", "specialist"]).nullable().optional(),
});

const ReorderLessonsSchema = z.object({
  lessonIds: z.array(z.string()),
});

// ============================================================================
// Database Row Types
// ============================================================================

interface LessonRow {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  order: number;
  content_type: string;
  content_body: string;
  audience_layer: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapLessonRow(row: LessonRow) {
  return {
    id: row.id,
    unitId: row.unit_id,
    title: row.title,
    description: row.description,
    order: row.order,
    content: {
      type: row.content_type,
      body: row.content_body,
    },
    audienceLayer: row.audience_layer,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// Routes
// ============================================================================

// GET /api/units/:unitId/lessons - List lessons for a unit
lessons.get("/", async (c) => {
  const unitId = c.req.param("unitId");

  // Verify unit exists
  const unit = await queryOne("SELECT id FROM units WHERE id = ?", [unitId]);
  if (!unit) {
    return c.json({ error: "Unit not found" }, 404);
  }

  const rows = await query<LessonRow>(
    'SELECT * FROM lessons WHERE unit_id = ? ORDER BY "order"',
    [unitId]
  );

  return c.json(rows.map(mapLessonRow));
});

// POST /api/units/:unitId/lessons - Create a lesson
lessons.post("/", zValidator("json", CreateLessonSchema), async (c) => {
  const unitId = c.req.param("unitId");
  const body = c.req.valid("json");

  // Verify unit exists
  const unit = await queryOne("SELECT id FROM units WHERE id = ?", [unitId]);
  if (!unit) {
    return c.json({ error: "Unit not found" }, 404);
  }

  // Determine order if not provided
  let order = body.order;
  if (order === undefined) {
    const maxOrder = await queryOne<{ max_order: number | null }>(
      'SELECT MAX("order") as max_order FROM lessons WHERE unit_id = ?',
      [unitId]
    );
    order = (maxOrder?.max_order ?? -1) + 1;
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await execute(
    `INSERT INTO lessons (id, unit_id, title, description, "order", content_type, content_body, audience_layer, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, unitId, body.title, body.description, order, body.contentType, body.contentBody, body.audienceLayer || null, now, now]
  );

  const row = await queryOne<LessonRow>("SELECT * FROM lessons WHERE id = ?", [id]);
  return c.json(mapLessonRow(row!), 201);
});

// GET /api/lessons/:id - Get a single lesson
lessons.get("/:id", async (c) => {
  const id = c.req.param("id");

  const row = await queryOne<LessonRow>("SELECT * FROM lessons WHERE id = ?", [id]);
  if (!row) {
    return c.json({ error: "Lesson not found" }, 404);
  }

  // Get competency IDs
  const competencies = await query<{ competency_id: string }>(
    "SELECT competency_id FROM lesson_competencies WHERE lesson_id = ?",
    [id]
  );

  // Get prerequisite lesson IDs
  const prerequisites = await query<{ prerequisite_lesson_id: string }>(
    "SELECT prerequisite_lesson_id FROM lesson_prerequisites WHERE lesson_id = ?",
    [id]
  );

  return c.json({
    ...mapLessonRow(row),
    competencyIds: competencies.map((r) => r.competency_id),
    prerequisiteLessonIds: prerequisites.map((r) => r.prerequisite_lesson_id),
  });
});

// PUT /api/lessons/:id - Update a lesson
lessons.put("/:id", zValidator("json", UpdateLessonSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<LessonRow>("SELECT * FROM lessons WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Lesson not found" }, 404);
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.title !== undefined) {
    updates.push("title = ?");
    values.push(body.title);
  }
  if (body.description !== undefined) {
    updates.push("description = ?");
    values.push(body.description);
  }
  if (body.order !== undefined) {
    updates.push('"order" = ?');
    values.push(body.order);
  }
  if (body.contentType !== undefined) {
    updates.push("content_type = ?");
    values.push(body.contentType);
  }
  if (body.contentBody !== undefined) {
    updates.push("content_body = ?");
    values.push(body.contentBody);
  }
  if (body.audienceLayer !== undefined) {
    updates.push("audience_layer = ?");
    values.push(body.audienceLayer);
  }

  if (updates.length > 0) {
    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    await execute(
      `UPDATE lessons SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  const row = await queryOne<LessonRow>("SELECT * FROM lessons WHERE id = ?", [id]);
  return c.json(mapLessonRow(row!));
});

// DELETE /api/lessons/:id - Delete a lesson
lessons.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const existing = await queryOne<LessonRow>("SELECT * FROM lessons WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Lesson not found" }, 404);
  }

  await execute("DELETE FROM lessons WHERE id = ?", [id]);

  return c.json({ success: true, deletedId: id });
});

// PATCH /api/units/:unitId/lessons/reorder - Reorder lessons
lessons.patch("/reorder", zValidator("json", ReorderLessonsSchema), async (c) => {
  const unitId = c.req.param("unitId");
  const body = c.req.valid("json");

  // Verify unit exists
  const unit = await queryOne("SELECT id FROM units WHERE id = ?", [unitId]);
  if (!unit) {
    return c.json({ error: "Unit not found" }, 404);
  }

  // Update order for each lesson
  const now = new Date().toISOString();
  for (let i = 0; i < body.lessonIds.length; i++) {
    await execute(
      `UPDATE lessons SET "order" = ?, updated_at = ? WHERE id = ? AND unit_id = ?`,
      [i, now, body.lessonIds[i], unitId]
    );
  }

  // Return updated list
  const rows = await query<LessonRow>(
    'SELECT * FROM lessons WHERE unit_id = ? ORDER BY "order"',
    [unitId]
  );

  return c.json(rows.map(mapLessonRow));
});

// POST /api/lessons/:id/competencies - Add competency mapping
lessons.post("/:id/competencies", zValidator("json", z.object({
  competencyId: z.string(),
})), async (c) => {
  const id = c.req.param("id");
  const { competencyId } = c.req.valid("json");

  // Verify lesson exists
  const lesson = await queryOne("SELECT id FROM lessons WHERE id = ?", [id]);
  if (!lesson) {
    return c.json({ error: "Lesson not found" }, 404);
  }

  try {
    await execute(
      "INSERT INTO lesson_competencies (lesson_id, competency_id) VALUES (?, ?)",
      [id, competencyId]
    );
  } catch {
    // Ignore duplicate key errors
  }

  return c.json({ success: true });
});

// DELETE /api/lessons/:id/competencies/:competencyId - Remove competency mapping
lessons.delete("/:id/competencies/:competencyId", async (c) => {
  const id = c.req.param("id");
  const competencyId = c.req.param("competencyId");

  await execute(
    "DELETE FROM lesson_competencies WHERE lesson_id = ? AND competency_id = ?",
    [id, competencyId]
  );

  return c.json({ success: true });
});

export { lessons };
