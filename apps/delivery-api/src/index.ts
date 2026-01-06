// Delivery API Server
// Hono + Mastra server for course delivery and learner interaction

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
    origin: ["http://localhost:5174", "http://localhost:3001"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    service: "delivery-api",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get("/", (c) => {
  return c.json({
    name: "Teach Delivery API",
    version: "0.1.0",
    endpoints: {
      health: "/health",
      agents: "/api/agents",
      course: "/api/course (coming soon)",
      progress: "/api/progress (coming soon)",
    },
  });
});

// Initialize Mastra routes
const server = new MastraServer({ app, mastra });
await server.init();

// Start server
const port = parseInt(process.env.PORT || "4001");
console.log(`Delivery API running at http://localhost:${port}`);
console.log(`Agent endpoints:`);
console.log(`  POST /api/agents/teaching-agent/generate`);
console.log(`  POST /api/agents/coaching-agent/generate`);

serve({ fetch: app.fetch, port });
