// Course CRUD Routes for Authoring API

import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { query, queryOne, execute, transaction } from "../db/client.js";
import { randomUUID } from "crypto";
import {
  mapThemeRow,
  generateThemeCSS,
  type PresentationThemeRow,
  type PresentationTheme,
  type SectionColors,
} from "../services/themes/index.js";

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
  presentation_theme_id: string | null;
  theme_overrides: string | null;
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
  slide_content: string;
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

// GET /api/courses/:id/export/revealjs - Export course as RevealJS presentation
// Now uses course's stored presentation theme, with fallback to query params
// Supports ?theme=black|white|league|etc (fallback), ?theme-id=<id> (override), ?download=true
courses.get("/:id/export/revealjs", async (c) => {
  const id = c.req.param("id");
  const themeOverride = c.req.query("theme");
  const themeIdOverride = c.req.query("theme-id");
  const download = c.req.query("download") === "true";

  // Valid RevealJS base themes
  const validThemes = ["black", "white", "league", "beige", "night", "serif", "simple", "solarized", "blood", "moon"];

  // Get course
  const courseRow = await queryOne<CourseRow>(
    "SELECT * FROM courses WHERE id = ?",
    [id]
  );

  if (!courseRow) {
    return c.json({ error: "Course not found" }, 404);
  }

  // Determine theme to use:
  // 1. If theme-id query param, use that theme
  // 2. If course has a presentation_theme_id, use that
  // 3. If theme query param, use that as base theme (legacy)
  // 4. Default to 'black'

  let presentationTheme: PresentationTheme | null = null;
  let themeOverrides: { sectionColors?: Partial<SectionColors>; customCss?: string } | null = null;
  let baseTheme = "black";

  if (themeIdOverride) {
    // Use override theme
    const themeRow = await queryOne<PresentationThemeRow>(
      "SELECT * FROM presentation_themes WHERE id = ?",
      [themeIdOverride]
    );
    if (themeRow) {
      presentationTheme = mapThemeRow(themeRow);
      baseTheme = presentationTheme.baseTheme;
    }
  } else if (courseRow.presentation_theme_id) {
    // Use course's stored theme
    const themeRow = await queryOne<PresentationThemeRow>(
      "SELECT * FROM presentation_themes WHERE id = ?",
      [courseRow.presentation_theme_id]
    );
    if (themeRow) {
      presentationTheme = mapThemeRow(themeRow);
      baseTheme = presentationTheme.baseTheme;
      // Apply course-level overrides if any
      if (courseRow.theme_overrides) {
        themeOverrides = JSON.parse(courseRow.theme_overrides);
      }
    }
  } else if (themeOverride && validThemes.includes(themeOverride)) {
    // Legacy: use base theme directly
    baseTheme = themeOverride;
  }

  // Generate theme CSS if we have a presentation theme
  let themeCSS: string | undefined;
  if (presentationTheme) {
    themeCSS = generateThemeCSS(presentationTheme, themeOverrides || undefined);
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
  lines.push(`theme: ${baseTheme}`);
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

    // Each lesson as a slide with key points extracted
    for (const lessonRow of lessonRows) {
      lines.push("---");
      lines.push("");
      lines.push(`### ${lessonRow.title}`);
      lines.push("");

      // Use slide_content if available, otherwise extract from narrative
      if (lessonRow.slide_content && lessonRow.slide_content.trim()) {
        // slide_content is already formatted markdown - append directly
        // (strip any leading # headers since we already have the lesson title)
        const slideLines = lessonRow.slide_content.split("\n")
          .filter(line => !line.match(/^##?\s/)); // Remove H1/H2 headers
        lines.push(...slideLines);
      } else if (lessonRow.content_body && lessonRow.content_body.trim()) {
        // Fall back to extracting key points from narrative content
        const keyPoints = extractKeyPointsForSlides(lessonRow.content_body);
        if (keyPoints.length > 0) {
          for (const point of keyPoints) {
            lines.push(`- ${point}`);
          }
        } else if (lessonRow.description) {
          lines.push(lessonRow.description);
        }
      } else if (lessonRow.description) {
        lines.push(lessonRow.description);
      }
      lines.push("");
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

  // Generate RevealJS HTML with theme
  const html = generateRevealJSFromMarkdown(markdown, courseRow.title, baseTheme, themeCSS);

  // Set response headers
  if (download) {
    const filename = courseRow.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    c.header("Content-Disposition", `attachment; filename="${filename}.html"`);
  }
  c.header("Content-Type", "text/html; charset=utf-8");

  return c.body(html);
});

// Helper function to extract key points from markdown for slides
function extractKeyPointsForSlides(markdown: string): string[] {
  const points: string[] = [];
  const lines = markdown.split('\n');

  // First, try to extract H2 headings as key topics
  const h2s = lines
    .filter(line => line.startsWith('## '))
    .map(line => line.replace(/^##\s+/, '').trim())
    .filter(h => h.length > 0 && h.length < 80); // Skip very long headings

  if (h2s.length >= 3 && h2s.length <= 8) {
    return h2s.slice(0, 6); // Return up to 6 H2 headings
  }

  // Otherwise, look for bullet points in the first part of the content
  const bulletPattern = /^[-*]\s+(.+)$/;
  for (const line of lines.slice(0, 50)) { // Check first 50 lines
    const match = line.match(bulletPattern);
    if (match && match[1].length < 100) {
      points.push(match[1].trim());
      if (points.length >= 6) break;
    }
  }

  if (points.length >= 3) {
    return points;
  }

  // Fallback: extract first paragraph after title
  let inFirstPara = false;
  let firstPara = '';
  for (const line of lines) {
    if (line.startsWith('#')) {
      inFirstPara = true;
      continue;
    }
    if (inFirstPara && line.trim() === '') {
      if (firstPara) break;
      continue;
    }
    if (inFirstPara && line.trim()) {
      firstPara += (firstPara ? ' ' : '') + line.trim();
    }
  }

  if (firstPara && firstPara.length > 20) {
    // Truncate to ~150 chars at word boundary
    if (firstPara.length > 150) {
      const truncated = firstPara.substring(0, 150);
      const lastSpace = truncated.lastIndexOf(' ');
      return [truncated.substring(0, lastSpace) + '...'];
    }
    return [firstPara];
  }

  return [];
}

// Interface for parsed slide annotations
interface SlideAnnotations {
  type: string;
  layout: string;
  imageHint: string | null;
  content: string;
}

// Parse slide annotations from markdown content
function parseSlideAnnotations(slideMarkdown: string): SlideAnnotations {
  const typeMatch = slideMarkdown.match(/<!--\s*type:\s*(\w+)\s*-->/);
  const layoutMatch = slideMarkdown.match(/<!--\s*layout:\s*([\w-]+)\s*-->/);
  const imageMatch = slideMarkdown.match(/\[IMAGE:\s*([^\]]+)\]/);
  const diagramMatch = slideMarkdown.match(/\[DIAGRAM:\s*([^\]]+)\]/);

  // Strip annotations from display content but keep structure
  let content = slideMarkdown
    .replace(/<!--\s*type:\s*\w+\s*-->/g, '')
    .replace(/<!--\s*layout:\s*[\w-]+\s*-->/g, '')
    .replace(/<!--\s*emphasis:\s*\w+\s*-->/g, '')
    .trim();

  // Transform [IMAGE: ...] into a visual placeholder
  content = content.replace(
    /\[IMAGE:\s*([^\]]+)\]/g,
    '<div class="image-placeholder">📊 $1</div>'
  );

  // Transform [DIAGRAM: ...] into a visual placeholder
  content = content.replace(
    /\[DIAGRAM:\s*([^\]]+)\]/g,
    '<div class="diagram-placeholder">📈 $1</div>'
  );

  // Transform [ICON: ...] into emoji hint
  content = content.replace(
    /\[ICON:\s*([^\]]+)\]/g,
    '<!-- icon: $1 -->'
  );

  return {
    type: typeMatch?.[1] || 'default',
    layout: layoutMatch?.[1] || 'single',
    imageHint: imageMatch?.[1] || diagramMatch?.[1] || null,
    content
  };
}

// Apply type-specific CSS classes to slide content
function getSlideClasses(type: string, layout: string): string {
  const classes: string[] = [];

  // Type-based styling
  switch (type) {
    case 'quote':
      classes.push('slide-quote');
      break;
    case 'big-quote':
    case 'giant-quote':
      classes.push('slide-big-quote');
      break;
    case 'full-image':
    case 'image':
      classes.push('slide-full-image');
      break;
    case 'title':
      classes.push('slide-title');
      break;
    case 'definition':
      classes.push('slide-definition');
      break;
    case 'question':
      classes.push('slide-question');
      break;
    case 'comparison':
      classes.push('slide-comparison');
      break;
    case 'process':
      classes.push('slide-process');
      break;
    case 'summary':
      classes.push('slide-summary');
      break;
    case 'assertion':
      classes.push('slide-assertion');
      break;
    case 'example':
      classes.push('slide-example');
      break;
  }

  // Layout-based styling
  switch (layout) {
    case 'two-column':
      classes.push('layout-two-column');
      break;
    case 'image-left':
      classes.push('layout-image-left');
      break;
    case 'image-right':
      classes.push('layout-image-right');
      break;
    case 'full-image':
      classes.push('layout-full-image');
      break;
  }

  return classes.join(' ');
}

// Helper function to generate RevealJS HTML from markdown
function generateRevealJSFromMarkdown(
  markdown: string,
  title: string,
  theme: string,
  themeCSS?: string
): string {
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
      // Single slide - parse annotations
      const annotations = parseSlideAnnotations(part);
      const classes = getSlideClasses(annotations.type, annotations.layout);
      const classAttr = classes ? ` class="${classes}"` : '';

      slidesHtml.push(`      <section data-markdown${classAttr}>
        <textarea data-template>
${annotations.content}
        </textarea>
      </section>`);
    } else {
      // Vertical slides
      const verticalHtml = verticalParts.map(vp => {
        const annotations = parseSlideAnnotations(vp);
        const classes = getSlideClasses(annotations.type, annotations.layout);
        const classAttr = classes ? ` class="${classes}"` : '';

        return `        <section data-markdown${classAttr}>
          <textarea data-template>
${annotations.content}
          </textarea>
        </section>`;
      }).join("\n");

      slidesHtml.push(`      <section>
${verticalHtml}
      </section>`);
    }
  }

  // Custom CSS for slide types
  const customCSS = `
  <style>
    /* Slide type styles */
    .slide-quote blockquote {
      font-size: 1.4em;
      font-style: italic;
      border-left: 4px solid currentColor;
      padding-left: 1em;
      margin: 1em 0;
    }

    /* Big/Giant Quote - dramatic full-screen quote */
    .slide-big-quote {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
    }
    .slide-big-quote blockquote,
    .slide-big-quote p:first-of-type {
      font-size: 2.5em !important;
      font-style: italic;
      font-weight: 300;
      line-height: 1.3;
      max-width: 80%;
      margin: 0 auto;
      border: none;
      padding: 0;
      quotes: """ """ "'" "'";
    }
    .slide-big-quote blockquote::before,
    .slide-big-quote p:first-of-type::before {
      content: open-quote;
      font-size: 3em;
      line-height: 0;
      vertical-align: -0.4em;
      opacity: 0.3;
      margin-right: 0.1em;
    }
    .slide-big-quote blockquote::after,
    .slide-big-quote p:first-of-type::after {
      content: close-quote;
      font-size: 3em;
      line-height: 0;
      vertical-align: -0.4em;
      opacity: 0.3;
      margin-left: 0.1em;
    }
    .slide-big-quote cite,
    .slide-big-quote p:last-of-type:not(:first-of-type) {
      display: block;
      font-size: 0.5em !important;
      font-style: normal;
      margin-top: 1.5em;
      opacity: 0.7;
    }
    .slide-big-quote cite::before,
    .slide-big-quote p:last-of-type:not(:first-of-type)::before {
      content: "— ";
    }

    /* Full Image - edge-to-edge image slide */
    .slide-full-image {
      padding: 0 !important;
      margin: 0 !important;
    }
    .slide-full-image img {
      max-width: 100vw !important;
      max-height: 100vh !important;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover;
      position: absolute;
      top: 0;
      left: 0;
    }
    .slide-full-image .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2em;
      position: absolute;
      top: 0;
      left: 0;
      border-radius: 0;
      border: none;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    }
    /* Caption overlay for full-image slides */
    .slide-full-image p:not(.image-placeholder) {
      position: absolute;
      bottom: 2em;
      left: 0;
      right: 0;
      text-align: center;
      background: rgba(0,0,0,0.6);
      padding: 0.5em 1em;
      margin: 0;
      font-size: 0.8em;
    }

    /* Title slide styling */
    .slide-title {
      text-align: center !important;
    }
    .slide-title h1, .slide-title h2 {
      font-size: 3em !important;
      margin-bottom: 0.5em;
    }
    .slide-title p {
      font-size: 1.2em;
      opacity: 0.8;
    }

    .slide-definition h2 {
      color: var(--r-link-color);
    }
    .slide-definition strong {
      font-size: 1.1em;
    }
    .slide-question h2 {
      font-size: 1.8em;
      text-align: center;
    }
    .slide-comparison table {
      width: 100%;
      margin: 1em 0;
    }
    .slide-comparison th, .slide-comparison td {
      padding: 0.5em;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .slide-process ol {
      font-size: 0.9em;
    }
    .slide-process li strong {
      color: var(--r-link-color);
    }
    .slide-summary ul {
      list-style: none;
      padding: 0;
    }
    .slide-summary li {
      padding: 0.3em 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .slide-summary li:before {
      content: "✓ ";
      color: var(--r-link-color);
    }

    /* Visual placeholder styles */
    .image-placeholder, .diagram-placeholder {
      background: rgba(255,255,255,0.1);
      border: 2px dashed rgba(255,255,255,0.3);
      border-radius: 8px;
      padding: 2em;
      margin: 1em 0;
      font-style: italic;
      opacity: 0.8;
    }

    /* Layout styles */
    .layout-two-column .reveal-viewport {
      display: flex;
      flex-wrap: wrap;
    }
    .layout-image-left, .layout-image-right {
      display: flex;
      align-items: center;
    }
  </style>`;

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
  ${customCSS}
  ${themeCSS || ""}
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
