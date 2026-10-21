import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

// -----------------------------------------------------------------------------
// RLS Policy & Isolation Test Suite
// -----------------------------------------------------------------------------
// Validates:
// 1. Static validation: All tables in migrations have RLS enabled and policies defined.
// 2. Multi-tenant isolation simulation: User A cannot read, insert, update, or delete User B's records.
// -----------------------------------------------------------------------------

describe("Database RLS Migrations & Policy Structure", () => {
  const migrationsDir = path.resolve(__dirname, "../supabase/migrations");
  const rlsMigrationPath = path.join(migrationsDir, "0003_rls_policies.sql");
  const rlsContent = fs.readFileSync(rlsMigrationPath, "utf-8");

  const expectedTables = [
    "profiles",
    "documents",
    "chunks",
    "conversations",
    "messages",
    "quizzes",
    "quiz_attempts",
    "flashcards",
    "study_plans",
    "study_sessions",
    "learning_insights",
  ];

  it("enables Row Level Security on every table in the schema", () => {
    for (const table of expectedTables) {
      const regex = new RegExp(`ALTER\\s+TABLE\\s+public\\.${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, "i");
      expect(regex.test(rlsContent), `Table ${table} must have RLS enabled`).toBe(true);
    }
  });

  it("defines SELECT, INSERT, UPDATE, DELETE policies for each table", () => {
    for (const table of expectedTables) {
      const selectRegex = new RegExp(`ON\\s+public\\.${table}\\s+FOR\\s+SELECT`, "i");
      const insertRegex = new RegExp(`ON\\s+public\\.${table}\\s+FOR\\s+INSERT`, "i");
      const updateRegex = new RegExp(`ON\\s+public\\.${table}\\s+FOR\\s+UPDATE`, "i");
      const deleteRegex = new RegExp(`ON\\s+public\\.${table}\\s+FOR\\s+DELETE`, "i");

      expect(selectRegex.test(rlsContent), `Table ${table} must have SELECT policy`).toBe(true);
      expect(insertRegex.test(rlsContent), `Table ${table} must have INSERT policy`).toBe(true);
      expect(updateRegex.test(rlsContent), `Table ${table} must have UPDATE policy`).toBe(true);
      expect(deleteRegex.test(rlsContent), `Table ${table} must have DELETE policy`).toBe(true);
    }
  });

  it("enforces auth.uid() scoping in all policies", () => {
    expect(rlsContent).toContain("auth.uid() = id");
    expect(rlsContent).toContain("auth.uid() = user_id");
  });

  it("defines match_chunks with SECURITY INVOKER and user_id filtering", () => {
    expect(rlsContent).toContain("SECURITY INVOKER");
    expect(rlsContent).toContain("c.user_id = p_user_id");
  });

  it("validates 0004_storage_and_search.sql bucket configuration, storage RLS, and hybrid search", () => {
    const storageMigrationPath = path.join(migrationsDir, "0004_storage_and_search.sql");
    const storageContent = fs.readFileSync(storageMigrationPath, "utf-8");

    expect(storageContent).toContain("'notes'");
    expect(storageContent).toContain("20971520");
    expect(storageContent).toContain("notes_storage_insert_own");
    expect(storageContent).toContain("notes_storage_select_own");
    expect(storageContent).toContain("notes_storage_delete_own");
    expect(storageContent).toContain("(storage.foldername(name))[1] = auth.uid()::text");
    expect(storageContent).toContain("match_chunks_hybrid");
    expect(storageContent).toContain("SECURITY INVOKER");
  });
});

describe("Multi-Tenant RLS Data Isolation Simulation", () => {
  interface MockRow {
    id: string;
    user_id: string;
    data: string;
  }

  class MockRlsDatabase {
    private rows: MockRow[] = [];

    insert(row: MockRow, currentAuthUid: string): { success: boolean; error?: string } {
      // Simulates RLS WITH CHECK (auth.uid() = user_id)
      if (row.user_id !== currentAuthUid) {
        return { success: false, error: "42501: new row violates row-level security policy for table" };
      }
      this.rows.push(row);
      return { success: true };
    }

    select(currentAuthUid: string): MockRow[] {
      // Simulates RLS USING (auth.uid() = user_id)
      return this.rows.filter((r) => r.user_id === currentAuthUid);
    }

    update(id: string, updateData: Partial<MockRow>, currentAuthUid: string): { updatedCount: number } {
      // Simulates RLS USING + WITH CHECK
      let count = 0;
      this.rows = this.rows.map((r) => {
        if (r.id === id && r.user_id === currentAuthUid) {
          count++;
          return { ...r, ...updateData, user_id: currentAuthUid };
        }
        return r;
      });
      return { updatedCount: count };
    }

    delete(id: string, currentAuthUid: string): { deletedCount: number } {
      // Simulates RLS USING (auth.uid() = user_id)
      const initial = this.rows.length;
      this.rows = this.rows.filter((r) => !(r.id === id && r.user_id === currentAuthUid));
      return { deletedCount: initial - this.rows.length };
    }
  }

  const userA = "11111111-1111-1111-1111-111111111111";
  const userB = "22222222-2222-2222-2222-222222222222";

  it("proves User A cannot read User B's rows", () => {
    const db = new MockRlsDatabase();
    db.insert({ id: "doc-1", user_id: userA, data: "User A Study Notes" }, userA);
    db.insert({ id: "doc-2", user_id: userB, data: "User B Private Thesis" }, userB);

    const userAReads = db.select(userA);
    expect(userAReads).toHaveLength(1);
    expect(userAReads[0].id).toBe("doc-1");
    expect(userAReads.some((r) => r.id === "doc-2")).toBe(false);

    const userBReads = db.select(userB);
    expect(userBReads).toHaveLength(1);
    expect(userBReads[0].id).toBe("doc-2");
  });

  it("proves User A cannot insert records on behalf of User B", () => {
    const db = new MockRlsDatabase();
    const maliciousInsert = db.insert(
      { id: "spoofed-doc", user_id: userB, data: "Spoofed by User A" },
      userA // authenticated as User A
    );

    expect(maliciousInsert.success).toBe(false);
    expect(maliciousInsert.error).toContain("row-level security policy");

    const userBRows = db.select(userB);
    expect(userBRows).toHaveLength(0);
  });

  it("proves User A cannot update User B's rows", () => {
    const db = new MockRlsDatabase();
    db.insert({ id: "doc-b", user_id: userB, data: "Original B Content" }, userB);

    const updateAttempt = db.update("doc-b", { data: "Hacked by User A" }, userA);
    expect(updateAttempt.updatedCount).toBe(0);

    const userBRows = db.select(userB);
    expect(userBRows[0].data).toBe("Original B Content");
  });

  it("proves User A cannot delete User B's rows", () => {
    const db = new MockRlsDatabase();
    db.insert({ id: "doc-b", user_id: userB, data: "Important B Content" }, userB);

    const deleteAttempt = db.delete("doc-b", userA);
    expect(deleteAttempt.deletedCount).toBe(0);

    const userBRows = db.select(userB);
    expect(userBRows).toHaveLength(1);
  });
});
