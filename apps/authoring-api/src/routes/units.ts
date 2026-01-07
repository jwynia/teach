// Unit CRUD Routes for Authoring API

import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { query, queryOne, execute } from "../db/client.js";
import { randomUUID } from "crypto";

const units = new Hono();

// ============================================================================
// Validation Schemas
// ============================================================================

const CreateUnitSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  order: z.number().optional(),
});

const UpdateUnitSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().optional(),
});

const ReorderUnitsSchema = z.object({
  unitIds: z.array(z.string()),
});

// ============================================================================
// Database Row Types
// ============================================================================

interface UnitRow {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapUnitRow(row: UnitRow) {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// Routes
// ============================================================================

// GET /api/courses/:courseId/units - List units for a course
units.get("/", async (c) => {
  const courseId = c.req.param("courseId");

  // Verify course exists
  const course = await queryOne("SELECT id FROM courses WHERE id = ?", [courseId]);
  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  const rows = await query<UnitRow>(
    'SELECT * FROM units WHERE course_id = ? ORDER BY "order"',
    [courseId]
  );

  return c.json(rows.map(mapUnitRow));
});

// POST /api/courses/:courseId/units - Create a unit
units.post("/", zValidator("json", CreateUnitSchema), async (c) => {
  const courseId = c.req.param("courseId");
  const body = c.req.valid("json");

  // Verify course exists
  const course = await queryOne("SELECT id FROM courses WHERE id = ?", [courseId]);
  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  // Determine order if not provided
  let order = body.order;
  if (order === undefined) {
    const maxOrder = await queryOne<{ max_order: number | null }>(
      'SELECT MAX("order") as max_order FROM units WHERE course_id = ?',
      [courseId]
    );
    order = (maxOrder?.max_order ?? -1) + 1;
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await execute(
    `INSERT INTO units (id, course_id, title, description, "order", created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, courseId, body.title, body.description, order, now, now]
  );

  const row = await queryOne<UnitRow>("SELECT * FROM units WHERE id = ?", [id]);
  return c.json(mapUnitRow(row!), 201);
});

// GET /api/units/:id - Get a single unit
units.get("/:id", async (c) => {
  const id = c.req.param("id");

  const row = await queryOne<UnitRow>("SELECT * FROM units WHERE id = ?", [id]);
  if (!row) {
    return c.json({ error: "Unit not found" }, 404);
  }

  return c.json(mapUnitRow(row));
});

// PUT /api/units/:id - Update a unit
units.put("/:id", zValidator("json", UpdateUnitSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<UnitRow>("SELECT * FROM units WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Unit not found" }, 404);
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

  if (updates.length > 0) {
    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    await execute(
      `UPDATE units SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  const row = await queryOne<UnitRow>("SELECT * FROM units WHERE id = ?", [id]);
  return c.json(mapUnitRow(row!));
});

// DELETE /api/units/:id - Delete a unit
units.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const existing = await queryOne<UnitRow>("SELECT * FROM units WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Unit not found" }, 404);
  }

  await execute("DELETE FROM units WHERE id = ?", [id]);

  return c.json({ success: true, deletedId: id });
});

// PATCH /api/courses/:courseId/units/reorder - Reorder units
units.patch("/reorder", zValidator("json", ReorderUnitsSchema), async (c) => {
  const courseId = c.req.param("courseId");
  const body = c.req.valid("json");

  // Verify course exists
  const course = await queryOne("SELECT id FROM courses WHERE id = ?", [courseId]);
  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  // Update order for each unit
  const now = new Date().toISOString();
  for (let i = 0; i < body.unitIds.length; i++) {
    await execute(
      `UPDATE units SET "order" = ?, updated_at = ? WHERE id = ? AND course_id = ?`,
      [i, now, body.unitIds[i], courseId]
    );
  }

  // Return updated list
  const rows = await query<UnitRow>(
    'SELECT * FROM units WHERE course_id = ? ORDER BY "order"',
    [courseId]
  );

  return c.json(rows.map(mapUnitRow));
});

export { units };
