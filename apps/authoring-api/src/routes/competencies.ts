// Competency Framework Routes for Authoring API

import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { query, queryOne, execute } from "../db/client.js";
import { randomUUID } from "crypto";

const competencies = new Hono();

// ============================================================================
// Validation Schemas
// ============================================================================

const CreateClusterSchema = z.object({
  name: z.string().min(1),
  prefix: z.string().regex(/^[A-Z]{2,4}$/, "Prefix must be 2-4 uppercase letters"),
  description: z.string(),
  order: z.number().optional(),
});

const UpdateClusterSchema = z.object({
  name: z.string().min(1).optional(),
  prefix: z.string().regex(/^[A-Z]{2,4}$/).optional(),
  description: z.string().optional(),
  order: z.number().optional(),
});

const CreateCompetencySchema = z.object({
  clusterId: z.string().optional(),
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().refine(
    (val) => val.startsWith("Can "),
    { message: "Description must start with 'Can '" }
  ),
  audienceLayer: z.enum(["general", "practitioner", "specialist"]),
  order: z.number().optional(),
});

const UpdateCompetencySchema = z.object({
  clusterId: z.string().nullable().optional(),
  code: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().refine(
    (val) => val.startsWith("Can "),
    { message: "Description must start with 'Can '" }
  ).optional(),
  audienceLayer: z.enum(["general", "practitioner", "specialist"]).optional(),
  order: z.number().optional(),
});

const RubricCriteriaSchema = z.object({
  not_demonstrated: z.object({
    description: z.string(),
    indicators: z.array(z.string()),
  }),
  partial: z.object({
    description: z.string(),
    indicators: z.array(z.string()),
  }),
  competent: z.object({
    description: z.string(),
    indicators: z.array(z.string()),
  }),
  strong: z.object({
    description: z.string(),
    indicators: z.array(z.string()),
  }),
});

const AddDependencySchema = z.object({
  requiredCompetencyId: z.string(),
  rationale: z.string().optional(),
});

// ============================================================================
// Database Row Types
// ============================================================================

interface ClusterRow {
  id: string;
  course_id: string;
  name: string;
  prefix: string;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
}

interface CompetencyRow {
  id: string;
  course_id: string;
  cluster_id: string | null;
  code: string;
  title: string;
  description: string;
  audience_layer: string;
  order: number;
  created_at: string;
  updated_at: string;
}

interface RubricRow {
  id: string;
  competency_id: string;
  level: string;
  description: string;
  indicators: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapClusterRow(row: ClusterRow) {
  return {
    id: row.id,
    courseId: row.course_id,
    name: row.name,
    prefix: row.prefix,
    description: row.description,
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCompetencyRow(row: CompetencyRow) {
  return {
    id: row.id,
    courseId: row.course_id,
    clusterId: row.cluster_id,
    code: row.code,
    title: row.title,
    description: row.description,
    audienceLayer: row.audience_layer,
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// Cluster Routes
// ============================================================================

// GET /api/courses/:courseId/clusters - List clusters for a course
competencies.get("/clusters", async (c) => {
  const courseId = c.req.param("courseId");

  const course = await queryOne("SELECT id FROM courses WHERE id = ?", [courseId]);
  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  const rows = await query<ClusterRow>(
    'SELECT * FROM competency_clusters WHERE course_id = ? ORDER BY "order"',
    [courseId]
  );

  return c.json(rows.map(mapClusterRow));
});

// POST /api/courses/:courseId/clusters - Create a cluster
competencies.post("/clusters", zValidator("json", CreateClusterSchema), async (c) => {
  const courseId = c.req.param("courseId");
  const body = c.req.valid("json");

  const course = await queryOne("SELECT id FROM courses WHERE id = ?", [courseId]);
  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  let order = body.order;
  if (order === undefined) {
    const maxOrder = await queryOne<{ max_order: number | null }>(
      'SELECT MAX("order") as max_order FROM competency_clusters WHERE course_id = ?',
      [courseId]
    );
    order = (maxOrder?.max_order ?? -1) + 1;
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await execute(
    `INSERT INTO competency_clusters (id, course_id, name, prefix, description, "order", created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, courseId, body.name, body.prefix, body.description, order, now, now]
  );

  const row = await queryOne<ClusterRow>("SELECT * FROM competency_clusters WHERE id = ?", [id]);
  return c.json(mapClusterRow(row!), 201);
});

// PUT /api/clusters/:id - Update a cluster
competencies.put("/clusters/:id", zValidator("json", UpdateClusterSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<ClusterRow>("SELECT * FROM competency_clusters WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Cluster not found" }, 404);
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.name !== undefined) {
    updates.push("name = ?");
    values.push(body.name);
  }
  if (body.prefix !== undefined) {
    updates.push("prefix = ?");
    values.push(body.prefix);
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
      `UPDATE competency_clusters SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  const row = await queryOne<ClusterRow>("SELECT * FROM competency_clusters WHERE id = ?", [id]);
  return c.json(mapClusterRow(row!));
});

// DELETE /api/clusters/:id - Delete a cluster
competencies.delete("/clusters/:id", async (c) => {
  const id = c.req.param("id");

  const existing = await queryOne<ClusterRow>("SELECT * FROM competency_clusters WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Cluster not found" }, 404);
  }

  await execute("DELETE FROM competency_clusters WHERE id = ?", [id]);

  return c.json({ success: true, deletedId: id });
});

// ============================================================================
// Competency Routes
// ============================================================================

// GET /api/courses/:courseId/competencies - List competencies for a course
competencies.get("/", async (c) => {
  const courseId = c.req.param("courseId");

  const course = await queryOne("SELECT id FROM courses WHERE id = ?", [courseId]);
  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  const rows = await query<CompetencyRow>(
    'SELECT * FROM competencies WHERE course_id = ? ORDER BY "order"',
    [courseId]
  );

  return c.json(rows.map(mapCompetencyRow));
});

// POST /api/courses/:courseId/competencies - Create a competency
competencies.post("/", zValidator("json", CreateCompetencySchema), async (c) => {
  const courseId = c.req.param("courseId");
  const body = c.req.valid("json");

  const course = await queryOne("SELECT id FROM courses WHERE id = ?", [courseId]);
  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  // Check for duplicate code
  const existingCode = await queryOne(
    "SELECT id FROM competencies WHERE course_id = ? AND code = ?",
    [courseId, body.code]
  );
  if (existingCode) {
    return c.json({ error: "Competency code already exists in this course" }, 400);
  }

  let order = body.order;
  if (order === undefined) {
    const maxOrder = await queryOne<{ max_order: number | null }>(
      'SELECT MAX("order") as max_order FROM competencies WHERE course_id = ?',
      [courseId]
    );
    order = (maxOrder?.max_order ?? -1) + 1;
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  await execute(
    `INSERT INTO competencies (id, course_id, cluster_id, code, title, description, audience_layer, "order", created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, courseId, body.clusterId || null, body.code, body.title, body.description, body.audienceLayer, order, now, now]
  );

  const row = await queryOne<CompetencyRow>("SELECT * FROM competencies WHERE id = ?", [id]);
  return c.json(mapCompetencyRow(row!), 201);
});

// GET /api/competencies/:id - Get a single competency with rubric
competencies.get("/:id", async (c) => {
  const id = c.req.param("id");

  const row = await queryOne<CompetencyRow>("SELECT * FROM competencies WHERE id = ?", [id]);
  if (!row) {
    return c.json({ error: "Competency not found" }, 404);
  }

  // Get rubric criteria
  const rubricRows = await query<RubricRow>(
    "SELECT * FROM rubric_criteria WHERE competency_id = ?",
    [id]
  );

  const rubric: Record<string, { description: string; indicators: string[] }> = {};
  for (const r of rubricRows) {
    rubric[r.level] = {
      description: r.description,
      indicators: JSON.parse(r.indicators),
    };
  }

  // Get dependencies
  const dependencies = await query<{ required_competency_id: string; rationale: string | null }>(
    "SELECT required_competency_id, rationale FROM competency_dependencies WHERE competency_id = ?",
    [id]
  );

  return c.json({
    ...mapCompetencyRow(row),
    rubric: Object.keys(rubric).length > 0 ? rubric : null,
    dependencies: dependencies.map((d) => ({
      requiredCompetencyId: d.required_competency_id,
      rationale: d.rationale,
    })),
  });
});

// PUT /api/competencies/:id - Update a competency
competencies.put("/:id", zValidator("json", UpdateCompetencySchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<CompetencyRow>("SELECT * FROM competencies WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Competency not found" }, 404);
  }

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.clusterId !== undefined) {
    updates.push("cluster_id = ?");
    values.push(body.clusterId);
  }
  if (body.code !== undefined) {
    updates.push("code = ?");
    values.push(body.code);
  }
  if (body.title !== undefined) {
    updates.push("title = ?");
    values.push(body.title);
  }
  if (body.description !== undefined) {
    updates.push("description = ?");
    values.push(body.description);
  }
  if (body.audienceLayer !== undefined) {
    updates.push("audience_layer = ?");
    values.push(body.audienceLayer);
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
      `UPDATE competencies SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  const row = await queryOne<CompetencyRow>("SELECT * FROM competencies WHERE id = ?", [id]);
  return c.json(mapCompetencyRow(row!));
});

// DELETE /api/competencies/:id - Delete a competency
competencies.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const existing = await queryOne<CompetencyRow>("SELECT * FROM competencies WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Competency not found" }, 404);
  }

  await execute("DELETE FROM competencies WHERE id = ?", [id]);

  return c.json({ success: true, deletedId: id });
});

// ============================================================================
// Rubric Routes
// ============================================================================

// PUT /api/competencies/:id/rubric - Set rubric criteria for a competency
competencies.put("/:id/rubric", zValidator("json", RubricCriteriaSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<CompetencyRow>("SELECT * FROM competencies WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Competency not found" }, 404);
  }

  // Delete existing rubric criteria
  await execute("DELETE FROM rubric_criteria WHERE competency_id = ?", [id]);

  // Insert new criteria
  const levels = ["not_demonstrated", "partial", "competent", "strong"] as const;
  for (const level of levels) {
    const criteria = body[level];
    await execute(
      "INSERT INTO rubric_criteria (id, competency_id, level, description, indicators) VALUES (?, ?, ?, ?, ?)",
      [randomUUID(), id, level, criteria.description, JSON.stringify(criteria.indicators)]
    );
  }

  return c.json({ success: true });
});

// GET /api/competencies/:id/rubric - Get rubric criteria
competencies.get("/:id/rubric", async (c) => {
  const id = c.req.param("id");

  const existing = await queryOne<CompetencyRow>("SELECT * FROM competencies WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Competency not found" }, 404);
  }

  const rows = await query<RubricRow>(
    "SELECT * FROM rubric_criteria WHERE competency_id = ?",
    [id]
  );

  const rubric: Record<string, { description: string; indicators: string[] }> = {};
  for (const r of rows) {
    rubric[r.level] = {
      description: r.description,
      indicators: JSON.parse(r.indicators),
    };
  }

  return c.json(rubric);
});

// ============================================================================
// Dependency Routes
// ============================================================================

// POST /api/competencies/:id/dependencies - Add a dependency
competencies.post("/:id/dependencies", zValidator("json", AddDependencySchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<CompetencyRow>("SELECT * FROM competencies WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Competency not found" }, 404);
  }

  const required = await queryOne<CompetencyRow>("SELECT * FROM competencies WHERE id = ?", [body.requiredCompetencyId]);
  if (!required) {
    return c.json({ error: "Required competency not found" }, 404);
  }

  try {
    await execute(
      "INSERT INTO competency_dependencies (id, competency_id, required_competency_id, rationale) VALUES (?, ?, ?, ?)",
      [randomUUID(), id, body.requiredCompetencyId, body.rationale || null]
    );
  } catch {
    return c.json({ error: "Dependency already exists" }, 400);
  }

  return c.json({ success: true });
});

// GET /api/competencies/:id/dependencies - Get dependencies
competencies.get("/:id/dependencies", async (c) => {
  const id = c.req.param("id");

  const existing = await queryOne<CompetencyRow>("SELECT * FROM competencies WHERE id = ?", [id]);
  if (!existing) {
    return c.json({ error: "Competency not found" }, 404);
  }

  const rows = await query<{ id: string; required_competency_id: string; rationale: string | null }>(
    "SELECT * FROM competency_dependencies WHERE competency_id = ?",
    [id]
  );

  return c.json(rows.map((r) => ({
    id: r.id,
    requiredCompetencyId: r.required_competency_id,
    rationale: r.rationale,
  })));
});

// DELETE /api/competencies/:id/dependencies/:depId - Remove a dependency
competencies.delete("/:id/dependencies/:depId", async (c) => {
  const competencyId = c.req.param("id");
  const depId = c.req.param("depId");

  await execute(
    "DELETE FROM competency_dependencies WHERE id = ? AND competency_id = ?",
    [depId, competencyId]
  );

  return c.json({ success: true });
});

export { competencies };
