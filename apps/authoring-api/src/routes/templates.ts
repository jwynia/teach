// Template management routes
// Handles starter template downloads, user template uploads, and validation

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { readFile, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getDb } from "../db/client.js";
import { templateValidationService } from "../services/template-validation.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "../../../..");

export const templates = new Hono();

// ============================================================================
// Starter Template Endpoints
// ============================================================================

// Get list of starter templates
templates.get("/starters", async (c) => {
  try {
    const starterTemplatesPath = join(projectRoot, "storage/starter-templates");
    
    // Read manifests to get template info
    const pptxManifest = JSON.parse(
      await readFile(join(starterTemplatesPath, "manifests/pptx-manifest.json"), "utf-8")
    );
    const revealJsManifest = JSON.parse(
      await readFile(join(starterTemplatesPath, "manifests/revealjs-manifest.json"), "utf-8")
    );

    const starters = {
      pptx: Object.entries(pptxManifest).map(([key, info]: [string, any]) => ({
        id: key,
        name: info.name,
        description: info.description,
        version: info.version,
        type: "pptx",
        supported_document_types: info.supported_document_types,
        download_url: `/api/templates/starters/pptx/${key}`
      })),
      revealjs: Object.entries(revealJsManifest).map(([key, info]: [string, any]) => ({
        id: key,
        name: info.name,
        description: info.description,
        version: info.version,
        type: "revealjs",
        supported_document_types: info.supported_document_types,
        download_url: `/api/templates/starters/revealjs/${key}`
      }))
    };

    return c.json({
      starters,
      total: Object.keys(pptxManifest).length + Object.keys(revealJsManifest).length
    });
  } catch (error) {
    console.error("Error listing starter templates:", error);
    return c.json({ error: "Failed to list starter templates" }, 500);
  }
});

// Download specific starter template
templates.get("/starters/:type/:templateId", async (c) => {
  const { type, templateId } = c.req.param();
  
  if (!["pptx", "revealjs"].includes(type)) {
    return c.json({ error: "Invalid template type" }, 400);
  }

  try {
    const starterTemplatesPath = join(projectRoot, "storage/starter-templates");
    let filePath: string;
    let contentType: string;
    let filename: string;

    if (type === "pptx") {
      filePath = join(starterTemplatesPath, `pptx/${templateId}.pptx`);
      contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      filename = `${templateId}.pptx`;
    } else {
      filePath = join(starterTemplatesPath, `revealjs/${templateId}.md`);
      contentType = "text/markdown";
      filename = `${templateId}.md`;
    }

    // Check if file exists
    await stat(filePath);
    const fileBuffer = await readFile(filePath);

    c.header("Content-Type", contentType);
    c.header("Content-Disposition", `attachment; filename="${filename}"`);
    
    return c.body(fileBuffer);
  } catch (error) {
    console.error(`Error downloading starter template ${type}/${templateId}:`, error);
    
    if ((error as any).code === "ENOENT") {
      return c.json({ error: "Template not found" }, 404);
    }
    
    return c.json({ error: "Failed to download template" }, 500);
  }
});

// Get manifest for specific starter template
templates.get("/starters/:type/:templateId/manifest", async (c) => {
  const { type, templateId } = c.req.param();
  
  if (!["pptx", "revealjs"].includes(type)) {
    return c.json({ error: "Invalid template type" }, 400);
  }

  try {
    const starterTemplatesPath = join(projectRoot, "storage/starter-templates");
    const manifestPath = join(starterTemplatesPath, `manifests/${type}-manifest.json`);
    
    const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
    
    if (!manifest[templateId]) {
      return c.json({ error: "Template not found in manifest" }, 404);
    }

    return c.json({
      template_id: templateId,
      type,
      manifest: manifest[templateId]
    });
  } catch (error) {
    console.error(`Error getting manifest for ${type}/${templateId}:`, error);
    return c.json({ error: "Failed to get template manifest" }, 500);
  }
});

// ============================================================================
// User Template Endpoints
// ============================================================================

// List user's templates
templates.get("/mine", async (c) => {
  // TODO: Get user ID from authentication
  const userId = "temp-user"; // Placeholder
  
  try {
    const db = getDb();
    const result = await db.execute({
      sql: `SELECT id, name, description, type, document_types, version, 
                   validation_status, download_count, rating_average, 
                   is_public, tags, created_at, updated_at
            FROM templates 
            WHERE created_by_user_id = ?
            ORDER BY updated_at DESC`,
      args: [userId]
    });

    const templates = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      document_types: JSON.parse(row.document_types as string),
      version: row.version,
      validation_status: row.validation_status,
      download_count: row.download_count,
      rating_average: row.rating_average,
      is_public: Boolean(row.is_public),
      tags: JSON.parse((row.tags as string) || "[]"),
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    return c.json({ templates, count: templates.length });
  } catch (error) {
    console.error("Error listing user templates:", error);
    return c.json({ error: "Failed to list templates" }, 500);
  }
});

// List public templates (community)
templates.get("/public", async (c) => {
  const typeFilter = c.req.query("type");
  const tagsFilter = c.req.query("tags");
  const sort = c.req.query("sort") || "rating";
  const limit = parseInt(c.req.query("limit") || "20");
  const offset = parseInt(c.req.query("offset") || "0");

  try {
    const db = getDb();
    let sql = `
      SELECT t.id, t.name, t.description, t.type, t.document_types, t.version,
             t.download_count, t.rating_average, t.is_featured, t.tags,
             t.created_at, t.updated_at, t.created_by_user_id
      FROM templates t
      WHERE t.is_public = true AND t.validation_status = 'valid'
    `;
    const args: any[] = [];

    if (typeFilter) {
      sql += " AND t.type = ?";
      args.push(typeFilter);
    }

    if (tagsFilter) {
      // Simple tag search - in production would use JSON search
      sql += " AND t.tags LIKE ?";
      args.push(`%${tagsFilter}%`);
    }

    // Sort options
    switch (sort) {
      case "rating":
        sql += " ORDER BY t.rating_average DESC, t.download_count DESC";
        break;
      case "downloads":
        sql += " ORDER BY t.download_count DESC";
        break;
      case "newest":
        sql += " ORDER BY t.created_at DESC";
        break;
      default:
        sql += " ORDER BY t.is_featured DESC, t.rating_average DESC";
    }

    sql += " LIMIT ? OFFSET ?";
    args.push(limit, offset);

    const result = await db.execute({ sql, args });

    const templates = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      document_types: JSON.parse(row.document_types as string),
      version: row.version,
      download_count: row.download_count,
      rating_average: row.rating_average,
      is_featured: Boolean(row.is_featured),
      tags: JSON.parse((row.tags as string) || "[]"),
      created_by: row.created_by_user_id, // In production, join with users table
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    return c.json({ 
      templates, 
      count: templates.length,
      pagination: { limit, offset }
    });
  } catch (error) {
    console.error("Error listing public templates:", error);
    return c.json({ error: "Failed to list public templates" }, 500);
  }
});

// Get template details
templates.get("/:id", async (c) => {
  const { id } = c.req.param();

  try {
    const db = getDb();
    const result = await db.execute({
      sql: `SELECT t.*, tv.validation_results, tv.llm_enhanced_errors, tv.validated_at
            FROM templates t
            LEFT JOIN template_validations tv ON t.id = tv.template_id
            WHERE t.id = ?
            ORDER BY tv.validated_at DESC
            LIMIT 1`,
      args: [id]
    });

    if (result.rows.length === 0) {
      return c.json({ error: "Template not found" }, 404);
    }

    const row = result.rows[0];
    const template = {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      document_types: JSON.parse(row.document_types as string),
      file_path: row.file_path,
      manifest: JSON.parse(row.manifest as string),
      version: row.version,
      validation_status: row.validation_status,
      validation_results: row.validation_results ? JSON.parse(row.validation_results as string) : null,
      llm_enhanced_errors: row.llm_enhanced_errors ? JSON.parse(row.llm_enhanced_errors as string) : [],
      validated_at: row.validated_at,
      download_count: row.download_count,
      rating_average: row.rating_average,
      is_public: Boolean(row.is_public),
      is_featured: Boolean(row.is_featured),
      tags: JSON.parse((row.tags as string) || "[]"),
      created_by_user_id: row.created_by_user_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    };

    return c.json(template);
  } catch (error) {
    console.error(`Error getting template ${id}:`, error);
    return c.json({ error: "Failed to get template" }, 500);
  }
});

// Upload new template
const uploadSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(["pptx", "revealjs"]),
  document_types: z.array(z.enum([
    "lecture-slides", "student-handout", "instructor-guide",
    "assessment-worksheet", "grading-rubric"
  ])),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().optional().default(false)
});

templates.post("/upload", zValidator("json", uploadSchema), async (c) => {
  const validatedData = c.req.valid("json");
  // TODO: Get user ID from authentication
  const userId = "temp-user"; // Placeholder
  
  try {
    // TODO: Handle file upload from multipart/form-data
    // For now, this is a placeholder that shows the structure
    
    const templateId = crypto.randomUUID();
    const db = getDb();
    
    // Insert template record
    await db.execute({
      sql: `INSERT INTO templates (
        id, created_by_user_id, name, description, type, document_types,
        file_path, manifest, version, is_public, tags, validation_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        templateId,
        userId,
        validatedData.name,
        validatedData.description || null,
        validatedData.type,
        JSON.stringify(validatedData.document_types),
        `user-templates/${userId}/${templateId}.${validatedData.type === 'pptx' ? 'pptx' : 'md'}`,
        JSON.stringify({}), // Will be populated during validation
        "1.0",
        validatedData.is_public || false,
        JSON.stringify(validatedData.tags || []),
        "pending"
      ]
    });

    // TODO: Trigger validation process

    return c.json({
      id: templateId,
      message: "Template uploaded successfully",
      validation_status: "pending"
    }, 201);

  } catch (error) {
    console.error("Error uploading template:", error);
    return c.json({ error: "Failed to upload template" }, 500);
  }
});

// Validate template
templates.post("/:id/validate", async (c) => {
  const { id } = c.req.param();
  
  try {
    const db = getDb();
    
    // Get template details
    const templateResult = await db.execute({
      sql: "SELECT file_path, type FROM templates WHERE id = ?",
      args: [id]
    });

    if (templateResult.rows.length === 0) {
      return c.json({ error: "Template not found" }, 404);
    }

    const template = templateResult.rows[0];
    const templateType = template.type as "pptx" | "revealjs";
    const filePath = join(projectRoot, template.file_path as string);

    // Run validation with LLM assistance
    const validationResults = await templateValidationService.validateTemplate(
      filePath,
      templateType,
      "Course author uploading custom template" // User context
    );

    // Update template validation status  
    await db.execute({
      sql: "UPDATE templates SET validation_status = ?, updated_at = datetime('now') WHERE id = ?",
      args: [validationResults.isValid ? "valid" : "invalid", id]
    });

    // Insert validation results
    const validationId = crypto.randomUUID();
    await db.execute({
      sql: `INSERT INTO template_validations (
        id, template_id, validation_results, has_required_placeholders,
        has_required_elements, llm_enhanced_errors
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        validationId,
        id,
        JSON.stringify({
          isValid: validationResults.isValid,
          errors: validationResults.errors,
          warnings: validationResults.warnings,
          extractedPlaceholders: validationResults.extractedPlaceholders,
          missingRequiredElements: validationResults.missingRequiredElements
        }),
        validationResults.extractedPlaceholders.length > 0,
        validationResults.missingRequiredElements.length === 0,
        JSON.stringify(validationResults.llm_enhanced_errors || [])
      ]
    });

    // Generate and update template manifest
    const manifest = await templateValidationService.generateManifest(filePath, templateType);
    await db.execute({
      sql: "UPDATE templates SET manifest = ? WHERE id = ?",
      args: [JSON.stringify(manifest), id]
    });

    return c.json({
      template_id: id,
      validation_id: validationId,
      results: {
        isValid: validationResults.isValid,
        errors: validationResults.errors,
        warnings: validationResults.warnings,
        extractedPlaceholders: validationResults.extractedPlaceholders,
        missingRequiredElements: validationResults.missingRequiredElements
      },
      llm_enhanced_errors: validationResults.llm_enhanced_errors || [],
      manifest
    });

  } catch (error) {
    console.error(`Error validating template ${id}:`, error);
    return c.json({ error: "Failed to validate template" }, 500);
  }
});

// Update template visibility
const visibilitySchema = z.object({
  is_public: z.boolean()
});

templates.patch("/:id/visibility", zValidator("json", visibilitySchema), async (c) => {
  const { id } = c.req.param();
  const { is_public } = c.req.valid("json");
  // TODO: Get user ID from authentication and verify ownership
  
  try {
    const db = getDb();
    await db.execute({
      sql: "UPDATE templates SET is_public = ?, updated_at = datetime('now') WHERE id = ?",
      args: [is_public, id]
    });

    return c.json({ 
      template_id: id, 
      is_public,
      message: is_public ? "Template is now public" : "Template is now private"
    });
  } catch (error) {
    console.error(`Error updating template visibility ${id}:`, error);
    return c.json({ error: "Failed to update template visibility" }, 500);
  }
});

// Rate template
const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

templates.post("/:id/rating", zValidator("json", ratingSchema), async (c) => {
  const { id } = c.req.param();
  const { rating, comment } = c.req.valid("json");
  // TODO: Get user ID from authentication
  const userId = "temp-user";

  try {
    const db = getDb();
    const ratingId = crypto.randomUUID();
    
    // Insert or update rating
    await db.execute({
      sql: `INSERT OR REPLACE INTO template_ratings (
        id, template_id, user_id, rating, comment
      ) VALUES (?, ?, ?, ?, ?)`,
      args: [ratingId, id, userId, rating, comment || null]
    });

    // Recalculate average rating
    const avgResult = await db.execute({
      sql: "SELECT AVG(rating) as avg_rating FROM template_ratings WHERE template_id = ?",
      args: [id]
    });

    const avgRating = avgResult.rows[0]?.avg_rating || 0;

    await db.execute({
      sql: "UPDATE templates SET rating_average = ? WHERE id = ?",
      args: [avgRating, id]
    });

    return c.json({
      template_id: id,
      user_rating: rating,
      average_rating: avgRating,
      message: "Rating submitted successfully"
    });
  } catch (error) {
    console.error(`Error rating template ${id}:`, error);
    return c.json({ error: "Failed to submit rating" }, 500);
  }
});

// Record template usage (for analytics)
templates.post("/:id/usage", async (c) => {
  const { id } = c.req.param();
  // TODO: Get user ID from authentication
  const userId = "temp-user";

  try {
    const db = getDb();
    const usageId = crypto.randomUUID();
    
    await db.execute({
      sql: `INSERT INTO template_usage (
        id, template_id, user_id
      ) VALUES (?, ?, ?)`,
      args: [usageId, id, userId]
    });

    // Increment download count
    await db.execute({
      sql: "UPDATE templates SET download_count = download_count + 1 WHERE id = ?",
      args: [id]
    });

    return c.json({ 
      template_id: id,
      message: "Usage recorded"
    });
  } catch (error) {
    console.error(`Error recording template usage ${id}:`, error);
    return c.json({ error: "Failed to record usage" }, 500);
  }
});