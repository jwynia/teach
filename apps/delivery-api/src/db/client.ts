// Database Client for Delivery API
// Handles learner progress and assessment data storage

import { createClient, type Client, type InValue } from "@libsql/client";

let db: Client | null = null;

export function getDb(): Client {
  if (!db) {
    db = createClient({
      url: process.env.APP_DATABASE_URL || "file:./data/delivery.db",
    });
  }
  return db;
}

export async function closeDb(): Promise<void> {
  if (db) {
    db.close();
    db = null;
  }
}

// Convert undefined to null for SQL compatibility
// Accept unknown[] for backward compatibility with dynamic array building
export type SqlValue = InValue | undefined;
function normalizeArgs(args: unknown[]): InValue[] {
  return args.map((arg) => {
    if (arg === undefined) return null;
    // At runtime, trust that the caller passed valid SQL values
    return arg as InValue;
  });
}

// Helper to run queries with error handling
export async function query<T = unknown>(
  sql: string,
  args: unknown[] = []
): Promise<T[]> {
  const result = await getDb().execute({ sql, args: normalizeArgs(args) });
  return result.rows as T[];
}

// Helper to run a single query and return first row
export async function queryOne<T = unknown>(
  sql: string,
  args: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, args);
  return rows[0] || null;
}

// Helper for insert/update/delete operations
export async function execute(
  sql: string,
  args: unknown[] = []
): Promise<{ rowsAffected: number; lastInsertRowid?: bigint }> {
  const result = await getDb().execute({ sql, args: normalizeArgs(args) });
  return {
    rowsAffected: result.rowsAffected,
    lastInsertRowid: result.lastInsertRowid,
  };
}

// Run multiple statements in a transaction
export async function transaction<T>(
  fn: (tx: {
    query: <R = unknown>(sql: string, args?: unknown[]) => Promise<R[]>;
    execute: (sql: string, args?: unknown[]) => Promise<void>;
  }) => Promise<T>
): Promise<T> {
  const client = getDb();
  await client.execute("BEGIN");
  try {
    const result = await fn({
      query: async <R = unknown>(sql: string, args: unknown[] = []) => {
        const result = await client.execute({ sql, args: normalizeArgs(args) });
        return result.rows as R[];
      },
      execute: async (sql: string, args: unknown[] = []) => {
        await client.execute({ sql, args: normalizeArgs(args) });
      },
    });
    await client.execute("COMMIT");
    return result;
  } catch (error) {
    await client.execute("ROLLBACK");
    throw error;
  }
}
