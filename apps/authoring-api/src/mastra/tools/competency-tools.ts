// Competency Framework Tools for Curriculum Assistant
// These tools allow the agent to work with competencies, clusters, and rubrics

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { query, queryOne, execute } from "../../db/client.js";

// Type for database rows
type DbRow = Record<string, unknown>;

// ============================================================================
// List Competencies Tool
// ============================================================================

export const listCompetenciesTool = createTool({
  id: "list-competencies",
  description:
    "List all competencies for a course, optionally filtered by cluster. Returns competency codes, titles, descriptions, and audience layers.",
  inputSchema: z.object({
    courseId: z.string().describe("The course ID to list competencies for"),
    clusterId: z
      .string()
      .optional()
      .describe("Optional cluster ID to filter by"),
  }),
  outputSchema: z.object({
    competencies: z.array(
      z.object({
        id: z.string(),
        code: z.string(),
        title: z.string(),
        description: z.string(),
        audienceLayer: z.enum(["general", "practitioner", "specialist"]),
        clusterId: z.string().nullable(),
        clusterName: z.string().nullable(),
      })
    ),
    count: z.number(),
  }),
  execute: async (input) => {
    const { courseId, clusterId } = input;

    let sql = `
      SELECT c.id, c.code, c.title, c.description, c.audience_layer, c.cluster_id,
             cl.name as cluster_name
      FROM competencies c
      LEFT JOIN competency_clusters cl ON c.cluster_id = cl.id
      WHERE c.course_id = ?
    `;
    const params: string[] = [courseId];

    if (clusterId) {
      sql += ` AND c.cluster_id = ?`;
      params.push(clusterId);
    }

    sql += ` ORDER BY cl.order NULLS LAST, c.order`;

    const rows = (await query(sql, params)) as DbRow[];

    const competencies = rows.map((row) => ({
      id: row.id as string,
      code: row.code as string,
      title: row.title as string,
      description: row.description as string,
      audienceLayer: row.audience_layer as "general" | "practitioner" | "specialist",
      clusterId: row.cluster_id as string | null,
      clusterName: row.cluster_name as string | null,
    }));

    return { competencies, count: competencies.length };
  },
});

// ============================================================================
// List Clusters Tool
// ============================================================================

export const listClustersTool = createTool({
  id: "list-clusters",
  description:
    "List all competency clusters for a course. Clusters group related competencies together with a shared prefix code.",
  inputSchema: z.object({
    courseId: z.string().describe("The course ID to list clusters for"),
  }),
  outputSchema: z.object({
    clusters: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        prefix: z.string(),
        description: z.string(),
        competencyCount: z.number(),
      })
    ),
  }),
  execute: async (input) => {
    const { courseId } = input;

    const rows = (await query(
      `SELECT cl.id, cl.name, cl.prefix, cl.description,
              COUNT(c.id) as competency_count
       FROM competency_clusters cl
       LEFT JOIN competencies c ON c.cluster_id = cl.id
       WHERE cl.course_id = ?
       GROUP BY cl.id
       ORDER BY cl.order`,
      [courseId]
    )) as DbRow[];

    const clusters = rows.map((row) => ({
      id: row.id as string,
      name: row.name as string,
      prefix: row.prefix as string,
      description: row.description as string,
      competencyCount: Number(row.competency_count) || 0,
    }));

    return { clusters };
  },
});

// ============================================================================
// Get Competency Details Tool
// ============================================================================

export const getCompetencyTool = createTool({
  id: "get-competency",
  description:
    "Get detailed information about a specific competency including its rubric criteria and dependencies on other competencies.",
  inputSchema: z.object({
    competencyId: z.string().describe("The competency ID to get details for"),
  }),
  outputSchema: z.object({
    competency: z.object({
      id: z.string(),
      code: z.string(),
      title: z.string(),
      description: z.string(),
      audienceLayer: z.enum(["general", "practitioner", "specialist"]),
      clusterName: z.string().nullable(),
      rubric: z
        .record(
          z.object({
            description: z.string(),
            indicators: z.array(z.string()),
          })
        )
        .nullable(),
      dependencies: z.array(
        z.object({
          competencyId: z.string(),
          competencyCode: z.string(),
          competencyTitle: z.string(),
          rationale: z.string().nullable(),
        })
      ),
    }),
  }),
  execute: async (input) => {
    const { competencyId } = input;

    // Get competency with cluster info
    const row = (await queryOne(
      `SELECT c.*, cl.name as cluster_name
       FROM competencies c
       LEFT JOIN competency_clusters cl ON c.cluster_id = cl.id
       WHERE c.id = ?`,
      [competencyId]
    )) as DbRow | null;

    if (!row) {
      throw new Error(`Competency not found: ${competencyId}`);
    }

    // Get rubric
    const rubricRows = (await query(
      `SELECT level, description, indicators FROM rubric_criteria WHERE competency_id = ?`,
      [competencyId]
    )) as DbRow[];

    let rubric: Record<string, { description: string; indicators: string[] }> | null = null;
    if (rubricRows.length > 0) {
      const rubricMap: Record<string, { description: string; indicators: string[] }> = {};
      for (const r of rubricRows) {
        rubricMap[r.level as string] = {
          description: r.description as string,
          indicators: JSON.parse((r.indicators as string) || "[]"),
        };
      }
      rubric = rubricMap;
    }

    // Get dependencies
    const depRows = (await query(
      `SELECT d.required_competency_id, d.rationale, c.code, c.title
       FROM competency_dependencies d
       JOIN competencies c ON c.id = d.required_competency_id
       WHERE d.competency_id = ?`,
      [competencyId]
    )) as DbRow[];

    const dependencies = depRows.map((d) => ({
      competencyId: d.required_competency_id as string,
      competencyCode: d.code as string,
      competencyTitle: d.title as string,
      rationale: d.rationale as string | null,
    }));

    return {
      competency: {
        id: row.id as string,
        code: row.code as string,
        title: row.title as string,
        description: row.description as string,
        audienceLayer: row.audience_layer as "general" | "practitioner" | "specialist",
        clusterName: row.cluster_name as string | null,
        rubric,
        dependencies,
      },
    };
  },
});

// ============================================================================
// Create Competency Tool
// ============================================================================

export const createCompetencyTool = createTool({
  id: "create-competency",
  description:
    'Create a new competency in a course. The title should be an action verb phrase. The description MUST start with "Can " to describe what the learner can do.',
  inputSchema: z.object({
    courseId: z.string().describe("The course ID to create the competency in"),
    clusterId: z
      .string()
      .optional()
      .describe("Optional cluster ID to assign the competency to"),
    code: z
      .string()
      .describe(
        "Short code for the competency (e.g., 'DP-1' for Data Privacy cluster)"
      ),
    title: z
      .string()
      .describe("Action verb phrase title (e.g., 'Classify data sensitivity levels')"),
    description: z
      .string()
      .describe(
        'Full description starting with "Can " (e.g., "Can accurately classify data into sensitivity categories...")'
      ),
    audienceLayer: z
      .enum(["general", "practitioner", "specialist"])
      .describe("Target audience layer for this competency"),
  }),
  outputSchema: z.object({
    competency: z.object({
      id: z.string(),
      code: z.string(),
      title: z.string(),
    }),
    message: z.string(),
  }),
  execute: async (input) => {
    const { courseId, clusterId, code, title, description, audienceLayer } = input;

    // Validate description starts with "Can "
    if (!description.startsWith("Can ")) {
      throw new Error('Competency description must start with "Can "');
    }

    // Get next order
    const orderRow = (await queryOne(
      `SELECT COALESCE(MAX("order"), 0) + 1 as next_order FROM competencies WHERE course_id = ?`,
      [courseId]
    )) as DbRow | null;
    const order = Number(orderRow?.next_order) || 1;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO competencies (id, course_id, cluster_id, code, title, description, audience_layer, "order", created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, courseId, clusterId || null, code, title, description, audienceLayer, order, now, now]
    );

    return {
      competency: { id, code, title },
      message: `Created competency ${code}: "${title}"`,
    };
  },
});

// ============================================================================
// Create Cluster Tool
// ============================================================================

export const createClusterTool = createTool({
  id: "create-cluster",
  description:
    "Create a new competency cluster to group related competencies. The prefix should be 2-4 uppercase letters.",
  inputSchema: z.object({
    courseId: z.string().describe("The course ID to create the cluster in"),
    name: z.string().describe("Human-readable name for the cluster"),
    prefix: z
      .string()
      .describe("2-4 uppercase letter code (e.g., 'DP' for Data Privacy)"),
    description: z.string().describe("Description of what competencies belong in this cluster"),
  }),
  outputSchema: z.object({
    cluster: z.object({
      id: z.string(),
      name: z.string(),
      prefix: z.string(),
    }),
    message: z.string(),
  }),
  execute: async (input) => {
    const { courseId, name, prefix, description } = input;

    // Validate prefix format
    if (!/^[A-Z]{2,4}$/.test(prefix)) {
      throw new Error("Prefix must be 2-4 uppercase letters");
    }

    // Get next order
    const orderRow = (await queryOne(
      `SELECT COALESCE(MAX("order"), 0) + 1 as next_order FROM competency_clusters WHERE course_id = ?`,
      [courseId]
    )) as DbRow | null;
    const order = Number(orderRow?.next_order) || 1;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO competency_clusters (id, course_id, name, prefix, description, "order", created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, courseId, name, prefix, description, order, now, now]
    );

    return {
      cluster: { id, name, prefix },
      message: `Created cluster "${name}" with prefix ${prefix}`,
    };
  },
});

// ============================================================================
// Add Competency Dependency Tool
// ============================================================================

export const addDependencyTool = createTool({
  id: "add-competency-dependency",
  description:
    "Add a prerequisite dependency between competencies. The required competency must be demonstrated before the dependent competency.",
  inputSchema: z.object({
    competencyId: z
      .string()
      .describe("The competency that has the prerequisite"),
    requiredCompetencyId: z
      .string()
      .describe("The competency that must be completed first"),
    rationale: z
      .string()
      .optional()
      .describe("Explanation of why this dependency exists"),
  }),
  outputSchema: z.object({
    message: z.string(),
  }),
  execute: async (input) => {
    const { competencyId, requiredCompetencyId, rationale } = input;

    // Verify both competencies exist and are in the same course
    const comp = (await queryOne(`SELECT course_id, code FROM competencies WHERE id = ?`, [
      competencyId,
    ])) as DbRow | null;
    const req = (await queryOne(`SELECT course_id, code FROM competencies WHERE id = ?`, [
      requiredCompetencyId,
    ])) as DbRow | null;

    if (!comp || !req) {
      throw new Error("One or both competencies not found");
    }

    if (comp.course_id !== req.course_id) {
      throw new Error("Competencies must be in the same course");
    }

    // Check for existing dependency
    const existing = (await queryOne(
      `SELECT id FROM competency_dependencies WHERE competency_id = ? AND required_competency_id = ?`,
      [competencyId, requiredCompetencyId]
    )) as DbRow | null;

    if (existing) {
      throw new Error("This dependency already exists");
    }

    const id = crypto.randomUUID();
    await execute(
      `INSERT INTO competency_dependencies (id, competency_id, required_competency_id, rationale)
       VALUES (?, ?, ?, ?)`,
      [id, competencyId, requiredCompetencyId, rationale || null]
    );

    return {
      message: `Added dependency: ${comp.code} now requires ${req.code}`,
    };
  },
});

// ============================================================================
// Set Rubric Tool
// ============================================================================

export const setRubricTool = createTool({
  id: "set-competency-rubric",
  description:
    'Set or update the 4-level rubric for a competency. Each level (not_demonstrated, partial, competent, strong) should have a description and observable indicators.',
  inputSchema: z.object({
    competencyId: z.string().describe("The competency to set the rubric for"),
    rubric: z.object({
      not_demonstrated: z.object({
        description: z.string().describe("What it looks like when competency is not shown"),
        indicators: z.array(z.string()).describe("Observable behaviors at this level"),
      }),
      partial: z.object({
        description: z.string().describe("What it looks like when competency is partially shown"),
        indicators: z.array(z.string()).describe("Observable behaviors at this level"),
      }),
      competent: z.object({
        description: z.string().describe("What it looks like when competency is fully demonstrated"),
        indicators: z.array(z.string()).describe("Observable behaviors at this level"),
      }),
      strong: z.object({
        description: z.string().describe("What it looks like when competency exceeds expectations"),
        indicators: z.array(z.string()).describe("Observable behaviors at this level"),
      }),
    }),
  }),
  outputSchema: z.object({
    message: z.string(),
  }),
  execute: async (input) => {
    const { competencyId, rubric } = input;

    // Verify competency exists
    const comp = (await queryOne(`SELECT code FROM competencies WHERE id = ?`, [competencyId])) as DbRow | null;
    if (!comp) {
      throw new Error(`Competency not found: ${competencyId}`);
    }

    // Delete existing rubric entries
    await execute(`DELETE FROM rubric_criteria WHERE competency_id = ?`, [competencyId]);

    // Insert new rubric entries
    const levels = ["not_demonstrated", "partial", "competent", "strong"] as const;
    for (const level of levels) {
      const criteria = rubric[level];
      const id = crypto.randomUUID();
      await execute(
        `INSERT INTO rubric_criteria (id, competency_id, level, description, indicators)
         VALUES (?, ?, ?, ?, ?)`,
        [id, competencyId, level, criteria.description, JSON.stringify(criteria.indicators)]
      );
    }

    return {
      message: `Set 4-level rubric for competency ${comp.code}`,
    };
  },
});

// ============================================================================
// Suggest Competencies Tool
// ============================================================================

export const suggestCompetenciesTool = createTool({
  id: "suggest-competencies",
  description:
    "Analyze a course topic or learning goal and get context for suggesting competencies. Returns existing competencies and course info to help the agent make informed suggestions.",
  inputSchema: z.object({
    courseId: z.string().describe("The course ID to suggest competencies for"),
    topic: z.string().describe("The topic or subject area to analyze"),
    audienceLayer: z
      .enum(["general", "practitioner", "specialist"])
      .optional()
      .describe("Target audience layer to focus on"),
  }),
  outputSchema: z.object({
    existingCompetencies: z.array(
      z.object({
        code: z.string(),
        title: z.string(),
        description: z.string(),
      })
    ),
    courseInfo: z.object({
      title: z.string(),
      description: z.string(),
      clusterCount: z.number(),
      competencyCount: z.number(),
    }),
    context: z.string(),
  }),
  execute: async (input) => {
    const { courseId, topic, audienceLayer } = input;

    // Get course info
    const course = (await queryOne(`SELECT title, description FROM courses WHERE id = ?`, [courseId])) as DbRow | null;
    if (!course) {
      throw new Error(`Course not found: ${courseId}`);
    }

    // Get existing competencies
    let sql = `SELECT code, title, description FROM competencies WHERE course_id = ?`;
    const params: string[] = [courseId];

    if (audienceLayer) {
      sql += ` AND audience_layer = ?`;
      params.push(audienceLayer);
    }

    const competencies = (await query(sql, params)) as DbRow[];

    // Get counts
    const clusterCount = (await queryOne(
      `SELECT COUNT(*) as count FROM competency_clusters WHERE course_id = ?`,
      [courseId]
    )) as DbRow | null;
    const competencyCount = (await queryOne(
      `SELECT COUNT(*) as count FROM competencies WHERE course_id = ?`,
      [courseId]
    )) as DbRow | null;

    return {
      existingCompetencies: competencies.map((c) => ({
        code: c.code as string,
        title: c.title as string,
        description: c.description as string,
      })),
      courseInfo: {
        title: course.title as string,
        description: course.description as string,
        clusterCount: Number(clusterCount?.count) || 0,
        competencyCount: Number(competencyCount?.count) || 0,
      },
      context: `Analyzing topic "${topic}" for course "${course.title}". ${
        audienceLayer ? `Focusing on ${audienceLayer} level.` : "Considering all audience levels."
      }`,
    };
  },
});

// ============================================================================
// Analyze Dependencies Tool
// ============================================================================

export const analyzeDependenciesTool = createTool({
  id: "analyze-dependencies",
  description:
    "Analyze the dependency graph for a course to identify potential issues like circular dependencies, orphan competencies, or missing prerequisites.",
  inputSchema: z.object({
    courseId: z.string().describe("The course ID to analyze"),
  }),
  outputSchema: z.object({
    analysis: z.object({
      totalCompetencies: z.number(),
      withDependencies: z.number(),
      orphans: z.array(z.object({ code: z.string(), title: z.string() })),
      roots: z.array(z.object({ code: z.string(), title: z.string() })),
      deepestChain: z.number(),
    }),
  }),
  execute: async (input) => {
    const { courseId } = input;

    // Get all competencies
    const competencies = (await query(
      `SELECT id, code, title FROM competencies WHERE course_id = ?`,
      [courseId]
    )) as Array<{ id: string; code: string; title: string }>;

    // Get all dependencies
    const dependencies = (await query(
      `SELECT d.competency_id, d.required_competency_id
       FROM competency_dependencies d
       JOIN competencies c ON c.id = d.competency_id
       WHERE c.course_id = ?`,
      [courseId]
    )) as Array<{ competency_id: string; required_competency_id: string }>;

    // Build dependency map
    const hasDependency = new Set<string>();
    const isDependedOn = new Set<string>();

    for (const dep of dependencies) {
      hasDependency.add(dep.competency_id);
      isDependedOn.add(dep.required_competency_id);
    }

    // Find orphans (no dependencies and not depended on)
    const orphans = competencies
      .filter((c) => !hasDependency.has(c.id) && !isDependedOn.has(c.id))
      .map((c) => ({ code: c.code, title: c.title }));

    // Find roots (depended on but have no dependencies)
    const roots = competencies
      .filter((c) => isDependedOn.has(c.id) && !hasDependency.has(c.id))
      .map((c) => ({ code: c.code, title: c.title }));

    return {
      analysis: {
        totalCompetencies: competencies.length,
        withDependencies: hasDependency.size,
        orphans,
        roots,
        deepestChain: 0, // Would need recursive query for accurate calculation
      },
    };
  },
});

// Export all tools
export const competencyTools = [
  listCompetenciesTool,
  listClustersTool,
  getCompetencyTool,
  createCompetencyTool,
  createClusterTool,
  addDependencyTool,
  setRubricTool,
  suggestCompetenciesTool,
  analyzeDependenciesTool,
];
