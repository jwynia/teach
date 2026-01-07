// Database Migration Runner for Authoring API

import { getDb } from "./client.js";
import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface Migration {
  id: number;
  name: string;
  applied_at: string;
}

async function ensureMigrationsTable(): Promise<void> {
  const db = getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const db = getDb();
  const result = await db.execute("SELECT name FROM _migrations ORDER BY id");
  return new Set(result.rows.map((row) => row.name as string));
}

async function recordMigration(name: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: "INSERT INTO _migrations (name) VALUES (?)",
    args: [name],
  });
}

export async function migrate(): Promise<void> {
  console.log("Running migrations...");

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();

  const migrationsDir = join(__dirname, "migrations");
  let files: string[];

  try {
    files = await readdir(migrationsDir);
  } catch {
    console.log("No migrations directory found. Creating...");
    return;
  }

  const sqlFiles = files
    .filter((f) => f.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  const db = getDb();
  let migrationsRun = 0;

  for (const file of sqlFiles) {
    if (applied.has(file)) {
      continue;
    }

    console.log(`Applying migration: ${file}`);
    const sql = await readFile(join(migrationsDir, file), "utf-8");

    // Split by semicolons and execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      await db.execute(statement);
    }

    await recordMigration(file);
    migrationsRun++;
  }

  if (migrationsRun > 0) {
    console.log(`Applied ${migrationsRun} migration(s)`);
  } else {
    console.log("No new migrations to apply");
  }
}

// Run migrations if this file is executed directly
if (process.argv[1]?.endsWith("migrate.ts") || process.argv[1]?.endsWith("migrate.js")) {
  migrate()
    .then(() => {
      console.log("Migration complete");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
