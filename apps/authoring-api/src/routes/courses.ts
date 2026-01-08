// Course CRUD Routes for Authoring API

import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { query, queryOne, execute, transaction } from "../db/client.js";
import { randomUUID } from "crypto";

const courses = new Hono();

// ============================================================================
// Validation Schemas
// ============================================================================

const CreateCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  targetAudiences: z.array(z.enum(["general", "practitioner", "specialist"])).default(["general"]),
});

const UpdateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  targetAudiences: z.array(z.enum(["general", "practitioner", "specialist"])).optional(),
  defaultProgressionPathId: z.string().nullable().optional(),
});

// ============================================================================
// Database Row Types
// ============================================================================

interface CourseRow {
  id: string;
  title: string;
  description: string;
  target_audiences: string;
  default_progression_path_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UnitRow {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
}

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

function mapCourseRow(row: CourseRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    targetAudiences: JSON.parse(row.target_audiences),
    defaultProgressionPathId: row.default_progression_path_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

// GET /api/courses - List all courses
courses.get("/", async (c) => {
  const rows = await query<CourseRow>(
    "SELECT * FROM courses ORDER BY updated_at DESC"
  );
  return c.json(rows.map(mapCourseRow));
});

// POST /api/courses - Create a new course
courses.post("/", zValidator("json", CreateCourseSchema), async (c) => {
  const body = c.req.valid("json");
  const id = randomUUID();
  const now = new Date().toISOString();

  await execute(
    `INSERT INTO courses (id, title, description, target_audiences, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, body.title, body.description, JSON.stringify(body.targetAudiences), now, now]
  );

  const row = await queryOne<CourseRow>("SELECT * FROM courses WHERE id = ?", [id]);
  if (!row) {
    return c.json({ error: "Failed to create course" }, 500);
  }

  return c.json(mapCourseRow(row), 201);
});

// GET /api/courses/:id - Get course with full structure
courses.get("/:id", async (c) => {
  const id = c.req.param("id");

  const courseRow = await queryOne<CourseRow>(
    "SELECT * FROM courses WHERE id = ?",
    [id]
  );

  if (!courseRow) {
    return c.json({ error: "Course not found" }, 404);
  }

  // Get units
  const unitRows = await query<UnitRow>(
    'SELECT * FROM units WHERE course_id = ? ORDER BY "order"',
    [id]
  );

  // Get lessons for each unit
  const units = await Promise.all(
    unitRows.map(async (unitRow) => {
      const lessonRows = await query<LessonRow>(
        'SELECT * FROM lessons WHERE unit_id = ? ORDER BY "order"',
        [unitRow.id]
      );

      // Get activities for each lesson
      const lessons = await Promise.all(
        lessonRows.map(async (lessonRow) => {
          const activityRows = await query<ActivityRow>(
            "SELECT * FROM activities WHERE lesson_id = ?",
            [lessonRow.id]
          );

          return {
            ...mapLessonRow(lessonRow),
            activities: activityRows.map(mapActivityRow),
          };
        })
      );

      return {
        ...mapUnitRow(unitRow),
        lessons,
      };
    })
  );

  return c.json({
    ...mapCourseRow(courseRow),
    units,
  });
});

// PUT /api/courses/:id - Update course
courses.put("/:id", zValidator("json", UpdateCourseSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  // Check if course exists
  const existing = await queryOne<CourseRow>(
    "SELECT * FROM courses WHERE id = ?",
    [id]
  );

  if (!existing) {
    return c.json({ error: "Course not found" }, 404);
  }

  // Build update query
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
  if (body.targetAudiences !== undefined) {
    updates.push("target_audiences = ?");
    values.push(JSON.stringify(body.targetAudiences));
  }
  if (body.defaultProgressionPathId !== undefined) {
    updates.push("default_progression_path_id = ?");
    values.push(body.defaultProgressionPathId);
  }

  if (updates.length > 0) {
    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);

    await execute(
      `UPDATE courses SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  const row = await queryOne<CourseRow>("SELECT * FROM courses WHERE id = ?", [id]);
  return c.json(mapCourseRow(row!));
});

// DELETE /api/courses/:id - Delete course (cascades to all content)
courses.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const existing = await queryOne<CourseRow>(
    "SELECT * FROM courses WHERE id = ?",
    [id]
  );

  if (!existing) {
    return c.json({ error: "Course not found" }, 404);
  }

  await execute("DELETE FROM courses WHERE id = ?", [id]);

  return c.json({ success: true, deletedId: id });
});

// POST /api/courses/:id/export - Export course to portable format
courses.post("/:id/export", async (c) => {
  const id = c.req.param("id");

  // Get course with full structure
  const courseRow = await queryOne<CourseRow>(
    "SELECT * FROM courses WHERE id = ?",
    [id]
  );

  if (!courseRow) {
    return c.json({ error: "Course not found" }, 404);
  }

  // Get units
  const unitRows = await query<UnitRow>(
    'SELECT * FROM units WHERE course_id = ? ORDER BY "order"',
    [id]
  );

  // Build full structure
  const units = await Promise.all(
    unitRows.map(async (unitRow) => {
      const lessonRows = await query<LessonRow>(
        'SELECT * FROM lessons WHERE unit_id = ? ORDER BY "order"',
        [unitRow.id]
      );

      const lessons = await Promise.all(
        lessonRows.map(async (lessonRow) => {
          const activityRows = await query<ActivityRow>(
            "SELECT * FROM activities WHERE lesson_id = ?",
            [lessonRow.id]
          );

          // Get competency IDs for lesson
          const lessonCompetencies = await query<{ competency_id: string }>(
            "SELECT competency_id FROM lesson_competencies WHERE lesson_id = ?",
            [lessonRow.id]
          );

          return {
            id: lessonRow.id,
            title: lessonRow.title,
            description: lessonRow.description,
            order: lessonRow.order,
            audienceLayer: lessonRow.audience_layer,
            competencyIds: lessonCompetencies.map((r) => r.competency_id),
            content: {
              type: lessonRow.content_type,
              body: lessonRow.content_body,
            },
            activities: activityRows.map((activityRow) => ({
              id: activityRow.id,
              type: activityRow.type,
              title: activityRow.title,
              instructions: activityRow.instructions,
              audienceLayer: activityRow.audience_layer,
              scenarioId: activityRow.scenario_id,
              data: JSON.parse(activityRow.data),
            })),
          };
        })
      );

      // Get competency IDs for unit
      const unitCompetencies = await query<{ competency_id: string }>(
        "SELECT competency_id FROM unit_competencies WHERE unit_id = ?",
        [unitRow.id]
      );

      return {
        id: unitRow.id,
        title: unitRow.title,
        description: unitRow.description,
        order: unitRow.order,
        competencyIds: unitCompetencies.map((r) => r.competency_id),
        lessons,
      };
    })
  );

  // Get agent configs
  const agentRows = await query<{
    role: string;
    name: string;
    instructions: string;
    model: string;
    temperature: number | null;
    tools: string;
  }>("SELECT * FROM agent_configs WHERE course_id = ?", [id]);

  const agents: Record<string, unknown> = {
    teaching: {
      name: "teaching-agent",
      role: "teaching",
      instructions: "Help learners understand course content.",
      model: "claude-sonnet-4-20250514",
    },
    coaching: {
      name: "coaching-agent",
      role: "coaching",
      instructions: "Guide learners through practice and provide feedback.",
      model: "claude-sonnet-4-20250514",
    },
  };

  for (const agent of agentRows) {
    agents[agent.role] = {
      name: agent.name,
      role: agent.role,
      instructions: agent.instructions,
      model: agent.model,
      temperature: agent.temperature,
      tools: JSON.parse(agent.tools || "[]"),
    };
  }

  // Build export format
  const courseExport = {
    version: "1.0" as const,
    meta: {
      id: courseRow.id,
      title: courseRow.title,
      description: courseRow.description,
      targetAudiences: JSON.parse(courseRow.target_audiences),
      exportedAt: new Date().toISOString(),
    },
    content: {
      units,
    },
    agents,
    assets: {},
  };

  return c.json(courseExport);
});

// POST /api/courses/:id/export/revealjs - Export course as RevealJS presentation
courses.post("/:id/export/revealjs", async (c) => {
  const id = c.req.param("id");
  const theme = c.req.query("theme") || "black";
  const download = c.req.query("download") === "true";

  // Validate theme
  const validThemes = ["black", "white", "league", "beige", "night", "serif", "simple", "solarized", "blood", "moon"];
  const selectedTheme = validThemes.includes(theme) ? theme : "black";

  // Get course
  const courseRow = await queryOne<CourseRow>(
    "SELECT * FROM courses WHERE id = ?",
    [id]
  );

  if (!courseRow) {
    return c.json({ error: "Course not found" }, 404);
  }

  // Get units with lessons
  const unitRows = await query<UnitRow>(
    'SELECT * FROM units WHERE course_id = ? ORDER BY "order"',
    [id]
  );

  // Get competencies for the course
  const competencies = await query<{ code: string; title: string; description: string }>(
    "SELECT code, title, description FROM competencies WHERE course_id = ? ORDER BY code",
    [id]
  );

  // Build markdown content
  const lines: string[] = [];

  // Front matter
  lines.push("---");
  lines.push(`title: ${courseRow.title}`);
  lines.push(`theme: ${selectedTheme}`);
  lines.push("---");
  lines.push("");

  // Title slide
  lines.push(`# ${courseRow.title}`);
  lines.push("");
  if (courseRow.description) {
    lines.push(courseRow.description);
  }
  lines.push("");

  // Learning objectives slide (from competencies)
  if (competencies.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Learning Objectives");
    lines.push("");
    lines.push("By the end of this course, you will be able to:");
    lines.push("");
    for (const comp of competencies.slice(0, 6)) { // Limit to 6 for readability
      lines.push(`- ${comp.title}`);
    }
    if (competencies.length > 6) {
      lines.push(`- ...and ${competencies.length - 6} more`);
    }
    lines.push("");
  }

  // Each unit as a section
  for (const unitRow of unitRows) {
    lines.push("---");
    lines.push("");
    lines.push(`## ${unitRow.title}`);
    lines.push("");
    if (unitRow.description) {
      lines.push(unitRow.description);
    }
    lines.push("");

    // Get lessons for this unit
    const lessonRows = await query<LessonRow>(
      'SELECT * FROM lessons WHERE unit_id = ? ORDER BY "order"',
      [unitRow.id]
    );

    // Each lesson as a slide (or vertical slides)
    for (const lessonRow of lessonRows) {
      lines.push("---");
      lines.push("");
      lines.push(`### ${lessonRow.title}`);
      lines.push("");
      if (lessonRow.description) {
        lines.push(lessonRow.description);
      }
      lines.push("");

      // Add lesson content if available
      if (lessonRow.content_body && lessonRow.content_body.trim()) {
        lines.push("--");
        lines.push("");
        lines.push("#### Content");
        lines.push("");
        // Truncate long content for slides
        const content = lessonRow.content_body.trim();
        if (content.length > 500) {
          lines.push(content.substring(0, 500) + "...");
        } else {
          lines.push(content);
        }
        lines.push("");
      }
    }
  }

  // Closing slide
  lines.push("---");
  lines.push("");
  lines.push("## Thank You");
  lines.push("");
  lines.push("Questions?");
  lines.push("");

  const markdown = lines.join("\n");

  // Generate RevealJS HTML
  const html = generateRevealJSFromMarkdown(markdown, courseRow.title, selectedTheme);

  // Set response headers
  if (download) {
    const filename = courseRow.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    c.header("Content-Disposition", `attachment; filename="${filename}.html"`);
  }
  c.header("Content-Type", "text/html; charset=utf-8");

  return c.body(html);
});

// Helper function to generate RevealJS HTML from markdown
function generateRevealJSFromMarkdown(markdown: string, title: string, theme: string): string {
  const CDN_BASE = "https://unpkg.com/reveal.js@5";

  // Parse markdown into slides
  // Split by --- (ignoring front matter)
  const parts = markdown.split(/\n---\s*\n/);

  // Skip front matter if present
  let startIndex = 0;
  if (parts[0].trim().startsWith("---")) {
    startIndex = 1;
  }

  const slidesHtml: string[] = [];

  for (let i = startIndex; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;

    // Check for vertical slides (--)
    const verticalParts = part.split(/\n--\s*\n/);

    if (verticalParts.length === 1) {
      // Single slide
      slidesHtml.push(`      <section data-markdown>
        <textarea data-template>
${part}
        </textarea>
      </section>`);
    } else {
      // Vertical slides
      const verticalHtml = verticalParts.map(vp => `        <section data-markdown>
          <textarea data-template>
${vp.trim()}
          </textarea>
        </section>`).join("\n");

      slidesHtml.push(`      <section>
${verticalHtml}
      </section>`);
    }
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${escapeHtmlForAttr(title)}</title>
  <link rel="stylesheet" href="${CDN_BASE}/dist/reset.css">
  <link rel="stylesheet" href="${CDN_BASE}/dist/reveal.css">
  <link rel="stylesheet" href="${CDN_BASE}/dist/theme/${theme}.css">
  <link rel="stylesheet" href="${CDN_BASE}/plugin/highlight/monokai.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
${slidesHtml.join("\n\n")}
    </div>
  </div>

  <script src="${CDN_BASE}/dist/reveal.js"></script>
  <script src="${CDN_BASE}/plugin/markdown/markdown.js"></script>
  <script src="${CDN_BASE}/plugin/highlight/highlight.js"></script>
  <script src="${CDN_BASE}/plugin/notes/notes.js"></script>
  <script>
    Reveal.initialize({
      hash: true,
      plugins: [RevealMarkdown, RevealHighlight, RevealNotes]
    });
  </script>
</body>
</html>`;
}

function escapeHtmlForAttr(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export { courses };
