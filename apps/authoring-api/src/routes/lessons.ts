// Lesson CRUD Routes for Authoring API

import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { generateText } from "ai";
import { query, queryOne, execute } from "../db/client.js";
import { getModelFromEnv } from "../mastra/providers.js";
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
  slideContent: z.string().default(""),
  audienceLayer: z.enum(["general", "practitioner", "specialist"]).optional(),
});

const UpdateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  order: z.number().optional(),
  contentType: z.enum(["markdown", "html"]).optional(),
  contentBody: z.string().optional(),
  slideContent: z.string().optional(),
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
  slide_content: string;
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
    slideContent: row.slide_content,
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
    `INSERT INTO lessons (id, unit_id, title, description, "order", content_type, content_body, slide_content, audience_layer, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, unitId, body.title, body.description, order, body.contentType, body.contentBody, body.slideContent, body.audienceLayer || null, now, now]
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
  if (body.slideContent !== undefined) {
    updates.push("slide_content = ?");
    values.push(body.slideContent);
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

// POST /api/lessons/:id/generate-slides - Generate slide content from narrative using LLM
lessons.post("/:id/generate-slides", async (c) => {
  const id = c.req.param("id");

  // Fetch the lesson
  const row = await queryOne<LessonRow>("SELECT * FROM lessons WHERE id = ?", [id]);
  if (!row) {
    return c.json({ error: "Lesson not found" }, 404);
  }

  const narrativeContent = row.content_body;
  if (!narrativeContent || narrativeContent.trim() === "") {
    return c.json({ error: "Lesson has no narrative content to generate slides from" }, 400);
  }

  let model;
  try {
    model = getModelFromEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to initialize LLM";
    console.error("LLM initialization error:", message);
    return c.json({ error: `LLM configuration error: ${message}` }, 500);
  }

  try {
    const { text } = await generateText({
      model,
      system: `You are an instructional designer creating presentation slides from lesson content.
Apply these research-backed principles:

## Core Principles (Mayer's Multimedia Learning + Assertion-Evidence)

1. **ONE idea per slide** - Each slide conveys a single message (Mayer's Segmenting)
2. **Assertion headlines** - Slide titles are complete sentences stating the key point (Alley)
3. **Visual evidence over bullets** - Support assertions with images/diagrams, not bullet lists (Alley)
4. **Signal important content** - Use bold, emphasis for key terms (Mayer's Signaling)
5. **Remove extraneous content** - Every element must serve learning (Mayer's Coherence)
6. **Three-second rule** - Content should be graspable in 3 seconds (Reynolds)

## Slide Types (choose based on content)

### ASSERTION SLIDE (for key concepts)
<!-- type: assertion -->
## [Complete sentence stating the main point]
[IMAGE: description of visual evidence supporting this assertion]

### DEFINITION SLIDE (for new terms - Mayer's Pre-training)
<!-- type: definition -->
## [Term]
**Definition:** One clear sentence explaining the term.

### PROCESS SLIDE (for sequences - Mayer's Segmenting)
<!-- type: process -->
## [Process name as assertion: "X happens in Y stages"]
1. **Stage One** — 3-5 words
2. **Stage Two** — 3-5 words
3. **Stage Three** — 3-5 words
[IMAGE: flowchart or diagram suggestion]

### COMPARISON SLIDE (for contrasts - Mayer's Spatial Contiguity)
<!-- type: comparison -->
## [Assertion comparing X and Y]
| Aspect | X | Y |
|--------|---|---|
| Key difference 1 | ... | ... |
| Key difference 2 | ... | ... |

### QUOTE SLIDE (for memorable insights - Reynolds' Signal-to-Noise)
<!-- type: quote -->
> "The memorable quote from the content"

### QUESTION SLIDE (for engagement/reflection)
<!-- type: question -->
## [Thought-provoking question?]

### EXAMPLE SLIDE (for concrete illustrations)
<!-- type: example -->
## Example: [Scenario in one sentence]
[IMAGE: visual representing the scenario]
Brief context in 1-2 sentences maximum.

### SUMMARY SLIDE (for section endings)
<!-- type: summary -->
## Key Takeaways
- First key point (complete sentence)
- Second key point (complete sentence)
- Third key point (complete sentence)

## Annotation Format
Each slide should include metadata annotations:
- Start with \`<!-- type: X -->\` where X is: assertion, definition, process, comparison, quote, question, example, summary
- Add \`<!-- layout: X -->\` if needed: single (default), two-column, image-left, image-right, full-image
- Include \`[IMAGE: description]\` for visual suggestions
- REQUIRED: Add \`Note:\` with the verbatim transcript text that corresponds to this slide (for TTS voiceover)

Example with speaker notes:
\`\`\`
<!-- type: assertion -->
## AI reduces manual data entry by 40% in typical workflows

[IMAGE: bar chart comparing manual vs AI-assisted data entry times]

Note:
When we look at the actual time savings, AI reduces manual data entry by about 40% in typical workflows. This isn't just about speed - it's about freeing up your team to focus on higher-value work that requires human judgment.
\`\`\`

## Instructions
1. Read the narrative and identify 4-8 key ideas worth a slide each
2. For each idea, select the most appropriate slide type
3. Start each slide with \`<!-- type: X -->\` annotation
4. Add \`<!-- layout: X -->\` if a specific layout is needed
5. Write the slide using the format for that type
6. Headlines must be complete sentences (assertions), not topic phrases
7. Include [IMAGE: description] for visual suggestions
8. REQUIRED: After each slide, include \`Note:\` with the exact verbatim transcript text that this slide was derived from. Preserve the original teaching language word-for-word - this will be used for TTS voiceover. Every slide must have a Note section.
9. VARY the slide types - never use the same type twice in a row
10. Output ONLY the slide markdown with annotations, no commentary

## Anti-Patterns to Avoid
- Multiple bullet points per slide (violates Segmenting)
- Topic headlines like "Benefits" instead of "AI reduces manual work by 40%"
- Walls of text (violates Three-second rule)
- Same slide format repeated (creates monotony)
- Decorative content that doesn't support the assertion (violates Coherence)
- Missing type annotations
- Missing or summarized speaker notes (must include verbatim transcript)`,
      prompt: `Convert this lesson narrative into slide-ready markdown with annotations:\n\n${narrativeContent}`,
    });

    return c.json({ slideContent: text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "LLM generation failed";
    console.error("LLM generation error:", error);
    return c.json({ error: `LLM generation failed: ${message}` }, 500);
  }
});

export { lessons };
