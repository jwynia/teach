// Mastra Configuration for Delivery API

import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { teachingAgent } from "./agents/teaching-agent.js";
import { coachingAgent } from "./agents/coaching-agent.js";

export const mastra = new Mastra({
  agents: {
    teachingAgent,
    coachingAgent,
  },
  storage: new LibSQLStore({
    url: process.env.DATABASE_URL || "file:./data/learner.db",
  }),
});
