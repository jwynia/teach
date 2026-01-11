// Presentation Themes API Routes
// CRUD endpoints for managing presentation themes

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { randomUUID } from "crypto";
import { query, queryOne, execute } from "../db/client.js";
import {
  CreateThemeSchema,
  UpdateThemeSchema,
  GenerateThemeSchema,
  mapThemeRow,
  type PresentationThemeRow,
  type PresentationTheme,
} from "../services/themes/types.js";
import { generatePresentationTheme } from "../services/themes/generator.js";

export const themes = new Hono();

// GET /api/presentation-themes - List all themes
themes.get("/", async (c) => {
  const rows = await query<PresentationThemeRow>(
    "SELECT * FROM presentation_themes ORDER BY is_builtin DESC, name ASC"
  );

  const themesResponse = rows.map(mapThemeRow);
  return c.json(themesResponse);
});

// GET /api/presentation-themes/:id - Get single theme
themes.get("/:id", async (c) => {
  const id = c.req.param("id");

  const row = await queryOne<PresentationThemeRow>(
    "SELECT * FROM presentation_themes WHERE id = ?",
    [id]
  );

  if (!row) {
    return c.json({ error: "Theme not found" }, 404);
  }

  return c.json(mapThemeRow(row));
});

// POST /api/presentation-themes - Create custom theme
themes.post("/", zValidator("json", CreateThemeSchema), async (c) => {
  const body = c.req.valid("json");
  const id = randomUUID();
  const now = new Date().toISOString();

  await execute(
    `INSERT INTO presentation_themes (
      id, name, description, is_builtin, palette, section_colors,
      typography, base_theme, custom_css, created_at, updated_at
    ) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      body.name,
      body.description || null,
      JSON.stringify(body.palette),
      JSON.stringify(body.sectionColors),
      body.typography ? JSON.stringify(body.typography) : null,
      body.baseTheme,
      body.customCss || null,
      now,
      now,
    ]
  );

  const row = await queryOne<PresentationThemeRow>(
    "SELECT * FROM presentation_themes WHERE id = ?",
    [id]
  );

  return c.json(mapThemeRow(row!), 201);
});

// POST /api/presentation-themes/generate - Generate theme from seed color
themes.post(
  "/generate",
  zValidator("json", GenerateThemeSchema),
  async (c) => {
    const body = c.req.valid("json");

    const generated = generatePresentationTheme({
      name: body.name,
      seedColor: body.seedColor,
      theme: body.theme,
      style: body.style,
      baseTheme: body.baseTheme,
    });

    const now = new Date().toISOString();

    await execute(
      `INSERT INTO presentation_themes (
        id, name, description, is_builtin, palette, section_colors,
        typography, base_theme, custom_css, created_at, updated_at
      ) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`,
      [
        generated.id,
        generated.name,
        generated.description,
        JSON.stringify(generated.palette),
        JSON.stringify(generated.sectionColors),
        generated.typography ? JSON.stringify(generated.typography) : null,
        generated.baseTheme,
        generated.customCss,
        now,
        now,
      ]
    );

    const row = await queryOne<PresentationThemeRow>(
      "SELECT * FROM presentation_themes WHERE id = ?",
      [generated.id]
    );

    return c.json(mapThemeRow(row!), 201);
  }
);

// PUT /api/presentation-themes/:id - Update custom theme
themes.put("/:id", zValidator("json", UpdateThemeSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  // Check if theme exists and is not built-in
  const existing = await queryOne<PresentationThemeRow>(
    "SELECT * FROM presentation_themes WHERE id = ?",
    [id]
  );

  if (!existing) {
    return c.json({ error: "Theme not found" }, 404);
  }

  if (existing.is_builtin === 1) {
    return c.json({ error: "Cannot modify built-in themes" }, 403);
  }

  // Build update query dynamically
  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.name !== undefined) {
    updates.push("name = ?");
    values.push(body.name);
  }
  if (body.description !== undefined) {
    updates.push("description = ?");
    values.push(body.description);
  }
  if (body.palette !== undefined) {
    updates.push("palette = ?");
    values.push(JSON.stringify(body.palette));
  }
  if (body.sectionColors !== undefined) {
    updates.push("section_colors = ?");
    values.push(JSON.stringify(body.sectionColors));
  }
  if (body.typography !== undefined) {
    updates.push("typography = ?");
    values.push(JSON.stringify(body.typography));
  }
  if (body.baseTheme !== undefined) {
    updates.push("base_theme = ?");
    values.push(body.baseTheme);
  }
  if (body.customCss !== undefined) {
    updates.push("custom_css = ?");
    values.push(body.customCss);
  }

  if (updates.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  updates.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  await execute(
    `UPDATE presentation_themes SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  const row = await queryOne<PresentationThemeRow>(
    "SELECT * FROM presentation_themes WHERE id = ?",
    [id]
  );

  return c.json(mapThemeRow(row!));
});

// DELETE /api/presentation-themes/:id - Delete custom theme
themes.delete("/:id", async (c) => {
  const id = c.req.param("id");

  // Check if theme exists and is not built-in
  const existing = await queryOne<PresentationThemeRow>(
    "SELECT * FROM presentation_themes WHERE id = ?",
    [id]
  );

  if (!existing) {
    return c.json({ error: "Theme not found" }, 404);
  }

  if (existing.is_builtin === 1) {
    return c.json({ error: "Cannot delete built-in themes" }, 403);
  }

  // Check if any courses are using this theme
  const coursesUsingTheme = await query<{ id: string }>(
    "SELECT id FROM courses WHERE presentation_theme_id = ?",
    [id]
  );

  if (coursesUsingTheme.length > 0) {
    return c.json(
      {
        error: "Cannot delete theme that is in use by courses",
        courseIds: coursesUsingTheme.map((c) => c.id),
      },
      409
    );
  }

  await execute("DELETE FROM presentation_themes WHERE id = ?", [id]);

  return c.json({ success: true });
});

// ============================================================================
// Course Theme Endpoints
// ============================================================================

export const courseThemes = new Hono();

// GET /api/courses/:courseId/theme - Get course's theme
courseThemes.get("/", async (c) => {
  const courseId = c.req.param("courseId");

  const course = await queryOne<{
    presentation_theme_id: string | null;
    theme_overrides: string | null;
  }>("SELECT presentation_theme_id, theme_overrides FROM courses WHERE id = ?", [
    courseId,
  ]);

  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  if (!course.presentation_theme_id) {
    return c.json({
      theme: null,
      overrides: null,
      message: "No theme set for this course",
    });
  }

  const themeRow = await queryOne<PresentationThemeRow>(
    "SELECT * FROM presentation_themes WHERE id = ?",
    [course.presentation_theme_id]
  );

  if (!themeRow) {
    return c.json({
      theme: null,
      overrides: null,
      message: "Theme not found",
    });
  }

  const theme = mapThemeRow(themeRow);
  const overrides = course.theme_overrides
    ? JSON.parse(course.theme_overrides)
    : null;

  return c.json({ theme, overrides });
});

// PUT /api/courses/:courseId/theme - Set course's theme
courseThemes.put("/", async (c) => {
  const courseId = c.req.param("courseId");

  let body: { themeId: string; overrides?: { sectionColors?: object; customCss?: string } };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (!body.themeId) {
    return c.json({ error: "themeId is required" }, 400);
  }

  // Check course exists
  const course = await queryOne<{ id: string }>(
    "SELECT id FROM courses WHERE id = ?",
    [courseId]
  );

  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  // Check theme exists
  const themeRow = await queryOne<PresentationThemeRow>(
    "SELECT * FROM presentation_themes WHERE id = ?",
    [body.themeId]
  );

  if (!themeRow) {
    return c.json({ error: "Theme not found" }, 404);
  }

  // Update course
  await execute(
    `UPDATE courses SET
      presentation_theme_id = ?,
      theme_overrides = ?,
      updated_at = ?
    WHERE id = ?`,
    [
      body.themeId,
      body.overrides ? JSON.stringify(body.overrides) : null,
      new Date().toISOString(),
      courseId,
    ]
  );

  const theme = mapThemeRow(themeRow);

  return c.json({
    theme,
    overrides: body.overrides || null,
  });
});

// DELETE /api/courses/:courseId/theme - Remove course's theme
courseThemes.delete("/", async (c) => {
  const courseId = c.req.param("courseId");

  // Check course exists
  const course = await queryOne<{ id: string }>(
    "SELECT id FROM courses WHERE id = ?",
    [courseId]
  );

  if (!course) {
    return c.json({ error: "Course not found" }, 404);
  }

  await execute(
    `UPDATE courses SET
      presentation_theme_id = NULL,
      theme_overrides = NULL,
      updated_at = ?
    WHERE id = ?`,
    [new Date().toISOString(), courseId]
  );

  return c.json({ success: true });
});
