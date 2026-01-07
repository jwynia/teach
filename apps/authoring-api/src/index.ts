// Authoring API Server
// Hono + Mastra server for course creation and management

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { MastraServer } from "@mastra/hono";
import { mastra } from "./mastra/index.js";
import { migrate } from "./db/migrate.js";
import { courses } from "./routes/courses.js";
import { units } from "./routes/units.js";
import { lessons } from "./routes/lessons.js";
import { activities } from "./routes/activities.js";
import { competencies } from "./routes/competencies.js";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    service: "authoring-api",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get("/", (c) => {
  return c.json({
    name: "Teach Authoring API",
    version: "0.1.0",
    endpoints: {
      health: "/health",
      agents: "/api/agents",
      courses: "/api/courses (coming soon)",
    },
  });
});

// Run database migrations
await migrate();

// Register API routes
app.route("/api/courses", courses);
app.route("/api/courses/:courseId/units", units);
app.route("/api/units/:unitId/lessons", lessons);
app.route("/api/lessons/:lessonId/activities", activities);
// Also register direct routes for update/delete
app.route("/api/units", units);
app.route("/api/lessons", lessons);
app.route("/api/activities", activities);
// Competency framework routes
app.route("/api/courses/:courseId/competencies", competencies);
app.route("/api/competencies", competencies);
app.route("/api/clusters", competencies);

// Initialize Mastra routes
const server = new MastraServer({ app, mastra });
await server.init();

// Start server
const port = parseInt(process.env.PORT || "4000");
console.log(`Authoring API running at http://localhost:${port}`);
console.log(`Content endpoints:`);
console.log(`  Courses:      GET/POST /api/courses, GET/PUT/DEL /api/courses/:id`);
console.log(`  Units:        GET/POST /api/courses/:id/units, GET/PUT/DEL /api/units/:id`);
console.log(`  Lessons:      GET/POST /api/units/:id/lessons, GET/PUT/DEL /api/lessons/:id`);
console.log(`  Activities:   GET/POST /api/lessons/:id/activities, GET/PUT/DEL /api/activities/:id`);
console.log(`Competency endpoints:`);
console.log(`  Clusters:     GET/POST /api/courses/:id/clusters, PUT/DEL /api/clusters/:id`);
console.log(`  Competencies: GET/POST /api/courses/:id/competencies, GET/PUT/DEL /api/competencies/:id`);
console.log(`  Rubrics:      GET/PUT /api/competencies/:id/rubric`);
console.log(`  Dependencies: GET/POST/DEL /api/competencies/:id/dependencies`);
console.log(`Other:`);
console.log(`  Export:       POST /api/courses/:id/export`);
console.log(`  Agent:        POST /api/agents/curriculum-assistant/generate`);
console.log(`Database: ./data/authoring.db`);

serve({ fetch: app.fetch, port });
