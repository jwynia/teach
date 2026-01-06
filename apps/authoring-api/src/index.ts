// Authoring API Server
// Hono + Mastra server for course creation and management

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { MastraServer } from "@mastra/hono";
import { mastra } from "./mastra/index.js";

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

// Initialize Mastra routes
const server = new MastraServer({ app, mastra });
await server.init();

// Start server
const port = parseInt(process.env.PORT || "4000");
console.log(`Authoring API running at http://localhost:${port}`);
console.log(`Agent endpoint: POST /api/agents/curriculum-assistant/generate`);

serve({ fetch: app.fetch, port });
