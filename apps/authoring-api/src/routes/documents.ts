// Document Generation Routes for Authoring API

import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { query, queryOne, execute } from "../db/client.js";
import { randomUUID } from "crypto";
import { createHash } from "crypto";
import {
  pdfService,
  docxService,
  buildStudentHandoutSpec,
  buildInstructorGuideSpec,
  DocumentGenerationRequestSchema,
  type CourseData,
  type LessonData,
  type CompetencyData,
  type ActivityData,
} from "../services/documents/index.js";
import { mkdir, writeFile, readFile, rm } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

// ============================================================================
// Initialize storage directory
// ============================================================================

const STORAGE_BASE = "./storage/generated";

async function ensureStorageDir(courseId: string, lessonId: string): Promise<string> {
  const dir = join(STORAGE_BASE, courseId, lessonId);
  await mkdir(dir, { recursive: true });
  return dir;
}

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

interface UnitRow {
  id: string;
  course_id: string;
  title: string;
}

interface CourseRow {
  id: string;
  title: string;
  description: string;
}

interface CompetencyRow {
  id: string;
  code: string;
  title: string;
  description: string;
}

interface ActivityRow {
  id: string;
  type: string;
  title: string;
  instructions: string;
}

interface GeneratedDocumentRow {
  id: string;
  course_id: string;
  unit_id: string | null;
  lesson_id: string | null;
  document_type: string;
  template_id: string | null;
  filename: string;
  storage_path: string;
  file_size: number;
  checksum: string;
  metadata: string;
  generated_at: string;
  generated_by: string | null;
}

// ============================================================================
// Routes
// ============================================================================

// Lesson documents router (mounted at /api/lessons/:lessonId/documents)
export const lessonDocuments = new Hono();

// POST /api/lessons/:lessonId/documents - Generate documents for a lesson
lessonDocuments.post(
  "/",
  zValidator("json", DocumentGenerationRequestSchema),
  async (c) => {
    const lessonId = c.req.param("lessonId");
    const body = c.req.valid("json");

    // Get lesson
    const lesson = await queryOne<LessonRow>(
      "SELECT * FROM lessons WHERE id = ?",
      [lessonId]
    );
    if (!lesson) {
      return c.json({ error: "Lesson not found" }, 404);
    }

    // Get unit and course
    const unit = await queryOne<UnitRow>(
      "SELECT id, course_id, title FROM units WHERE id = ?",
      [lesson.unit_id]
    );
    if (!unit) {
      return c.json({ error: "Unit not found" }, 404);
    }

    const course = await queryOne<CourseRow>(
      "SELECT id, title, description FROM courses WHERE id = ?",
      [unit.course_id]
    );
    if (!course) {
      return c.json({ error: "Course not found" }, 404);
    }

    // Get competencies linked to this lesson
    const competencies = await query<CompetencyRow>(
      `SELECT c.id, c.code, c.title, c.description
       FROM competencies c
       JOIN lesson_competencies lc ON lc.competency_id = c.id
       WHERE lc.lesson_id = ?
       ORDER BY c.code`,
      [lessonId]
    );

    // Get activities for this lesson
    const activities = await query<ActivityRow>(
      `SELECT id, type, title, instructions FROM activities WHERE lesson_id = ? ORDER BY id`,
      [lessonId]
    );

    // Prepare data for spec builders
    const courseData: CourseData = {
      id: course.id,
      title: course.title,
      description: course.description,
    };

    const lessonData: LessonData = {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      content: {
        type: lesson.content_type as "markdown" | "html",
        body: lesson.content_body,
      },
    };

    const competencyData: CompetencyData[] = competencies.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      description: c.description,
    }));

    const activityData: ActivityData[] = activities.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      instructions: a.instructions,
    }));

    // Ensure storage directory exists
    const storageDir = await ensureStorageDir(course.id, lesson.id);

    // Generate requested documents
    const generated: Array<{
      type: string;
      filename: string;
      path: string;
      contentType: string;
      fileSize: number;
    }> = [];

    for (const docType of body.documentTypes) {
      try {
        if (docType === "student-handout") {
          // Build spec and generate PDF
          const spec = buildStudentHandoutSpec(
            courseData,
            lessonData,
            competencyData,
            activityData
          );
          const result = await pdfService.generate(spec);

          // Save to storage
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const filename = `student-handout-${timestamp}.pdf`;
          const storagePath = join(storageDir, filename);
          await writeFile(storagePath, result.buffer);

          // Calculate checksum
          const checksum = createHash("md5").update(result.buffer).digest("hex");

          // Record in database
          const docId = randomUUID();
          await execute(
            `INSERT INTO generated_documents
             (id, course_id, unit_id, lesson_id, document_type, filename, storage_path, file_size, checksum, metadata, generated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [
              docId,
              course.id,
              unit.id,
              lesson.id,
              docType,
              filename,
              storagePath,
              result.buffer.length,
              checksum,
              JSON.stringify(result.metadata),
            ]
          );

          generated.push({
            type: docType,
            filename,
            path: `/api/documents/${docId}/download`,
            contentType: result.contentType,
            fileSize: result.buffer.length,
          });
        } else if (docType === "instructor-guide") {
          // Build spec and generate DOCX
          const spec = buildInstructorGuideSpec(
            courseData,
            lessonData,
            competencyData,
            activityData
          );
          const result = await docxService.generate(spec);

          // Save to storage
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const filename = `instructor-guide-${timestamp}.docx`;
          const storagePath = join(storageDir, filename);
          await writeFile(storagePath, result.buffer);

          // Calculate checksum
          const checksum = createHash("md5").update(result.buffer).digest("hex");

          // Record in database
          const docId = randomUUID();
          await execute(
            `INSERT INTO generated_documents
             (id, course_id, unit_id, lesson_id, document_type, filename, storage_path, file_size, checksum, metadata, generated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [
              docId,
              course.id,
              unit.id,
              lesson.id,
              docType,
              filename,
              storagePath,
              result.buffer.length,
              checksum,
              JSON.stringify(result.metadata),
            ]
          );

          generated.push({
            type: docType,
            filename,
            path: `/api/documents/${docId}/download`,
            contentType: result.contentType,
            fileSize: result.buffer.length,
          });
        }
        // Add other document types here as they are implemented
      } catch (error) {
        console.error(`Error generating ${docType}:`, error);
        return c.json(
          {
            error: `Failed to generate ${docType}`,
            details: error instanceof Error ? error.message : String(error),
          },
          500
        );
      }
    }

    return c.json({ generated });
  }
);

// GET /api/lessons/:lessonId/documents - List generated documents for a lesson
lessonDocuments.get("/", async (c) => {
  const lessonId = c.req.param("lessonId");

  const docs = await query<GeneratedDocumentRow>(
    `SELECT * FROM generated_documents WHERE lesson_id = ? ORDER BY generated_at DESC`,
    [lessonId]
  );

  return c.json(
    docs.map((d) => ({
      id: d.id,
      courseId: d.course_id,
      unitId: d.unit_id,
      lessonId: d.lesson_id,
      documentType: d.document_type,
      filename: d.filename,
      fileSize: d.file_size,
      metadata: JSON.parse(d.metadata),
      generatedAt: d.generated_at,
      downloadPath: `/api/documents/${d.id}/download`,
    }))
  );
});

// Documents router (mounted at /api/documents)
export const documents = new Hono();

// GET /api/documents/:docId - Get document metadata
documents.get("/:docId", async (c) => {
  const docId = c.req.param("docId");

  const doc = await queryOne<GeneratedDocumentRow>(
    "SELECT * FROM generated_documents WHERE id = ?",
    [docId]
  );

  if (!doc) {
    return c.json({ error: "Document not found" }, 404);
  }

  return c.json({
    id: doc.id,
    courseId: doc.course_id,
    unitId: doc.unit_id,
    lessonId: doc.lesson_id,
    documentType: doc.document_type,
    filename: doc.filename,
    fileSize: doc.file_size,
    checksum: doc.checksum,
    metadata: JSON.parse(doc.metadata),
    generatedAt: doc.generated_at,
    downloadPath: `/api/documents/${doc.id}/download`,
  });
});

// GET /api/documents/:docId/download - Download a generated document
documents.get("/:docId/download", async (c) => {
  const docId = c.req.param("docId");

  const doc = await queryOne<GeneratedDocumentRow>(
    "SELECT * FROM generated_documents WHERE id = ?",
    [docId]
  );

  if (!doc) {
    return c.json({ error: "Document not found" }, 404);
  }

  // Check if file exists
  if (!existsSync(doc.storage_path)) {
    return c.json({ error: "File not found on disk" }, 404);
  }

  // Read file
  const fileBuffer = await readFile(doc.storage_path);

  // Determine content type
  let contentType = "application/octet-stream";
  if (doc.filename.endsWith(".pdf")) {
    contentType = "application/pdf";
  } else if (doc.filename.endsWith(".docx")) {
    contentType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  } else if (doc.filename.endsWith(".xlsx")) {
    contentType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  } else if (doc.filename.endsWith(".pptx")) {
    contentType =
      "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  }

  // Set headers for download
  c.header("Content-Type", contentType);
  c.header("Content-Disposition", `attachment; filename="${doc.filename}"`);
  c.header("Content-Length", String(fileBuffer.length));

  return c.body(fileBuffer);
});

// DELETE /api/documents/:docId - Delete a generated document
documents.delete("/:docId", async (c) => {
  const docId = c.req.param("docId");

  const doc = await queryOne<GeneratedDocumentRow>(
    "SELECT * FROM generated_documents WHERE id = ?",
    [docId]
  );

  if (!doc) {
    return c.json({ error: "Document not found" }, 404);
  }

  // Delete file if it exists
  if (existsSync(doc.storage_path)) {
    await rm(doc.storage_path);
  }

  // Delete database record
  await execute("DELETE FROM generated_documents WHERE id = ?", [docId]);

  return c.json({ deleted: true });
});

// Course documents router (mounted at /api/courses/:courseId/documents)
export const courseDocuments = new Hono();

// GET /api/courses/:courseId/documents - List all generated documents for a course
courseDocuments.get("/", async (c) => {
  const courseId = c.req.param("courseId");

  const docs = await query<GeneratedDocumentRow>(
    `SELECT * FROM generated_documents WHERE course_id = ? ORDER BY generated_at DESC`,
    [courseId]
  );

  return c.json(
    docs.map((d) => ({
      id: d.id,
      courseId: d.course_id,
      unitId: d.unit_id,
      lessonId: d.lesson_id,
      documentType: d.document_type,
      filename: d.filename,
      fileSize: d.file_size,
      metadata: JSON.parse(d.metadata),
      generatedAt: d.generated_at,
      downloadPath: `/api/documents/${d.id}/download`,
    }))
  );
});

// GET /api/courses/:courseId/documents/rubric - Generate course grading rubric (XLSX)
// This will be implemented in Phase 3 with xlsx.service.ts
courseDocuments.get("/rubric", async (c) => {
  return c.json(
    { error: "Grading rubric generation not yet implemented" },
    501
  );
});
