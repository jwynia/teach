// Mastra Configuration for Authoring API

import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { curriculumAssistant } from "./agents/curriculum-assistant.js";

export const mastra = new Mastra({
  agents: {
    curriculumAssistant,
  },
  storage: new LibSQLStore({
    id: "authoring-api",
    url: process.env.DATABASE_URL || "file:./data/mastra.db",
  }),
});
