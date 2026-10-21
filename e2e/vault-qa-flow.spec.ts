import { test, expect } from "@playwright/test";

test.describe("Critical Flow 2: Notes Vault & Cited Grounded Q&A", () => {
  test("renders vault dropzone, document list, and grounded Q&A panel", async ({ page }) => {
    await page.goto("/vault");

    // Vault header inside main area
    await expect(page.locator("main").getByRole("heading", { name: "Notes Vault" })).toBeVisible();
    await expect(page.getByText("RAG Engine").first()).toBeVisible();

    // Dropzone
    await expect(page.getByText(/Drag & drop your study notes/i)).toBeVisible();
    await expect(page.getByText(/Supports PDF, DOCX, TXT/i)).toBeVisible();

    // Grounded Q&A Assistant panel
    await expect(page.getByText(/Grounded Notes Q&A/i)).toBeVisible();
    await expect(page.getByText(/Untrusted Data Boundary Active/i)).toBeVisible();

    // Sample prompt chips
    await expect(page.getByText(/Summarize key concepts/i)).toBeVisible();
    await expect(page.getByText(/Test polite refusal/i)).toBeVisible();
    await expect(page.getByText(/Test prompt injection defense/i)).toBeVisible();
  });

  test("verifies empty vault state prompts upload before grounded Q&A", async ({ page }) => {
    await page.goto("/vault");

    // When no notes are uploaded, empty state guidance is displayed
    const emptyStateText = page.getByText(/No study notes uploaded yet/i).first();
    await expect(emptyStateText).toBeVisible();
  });
});
