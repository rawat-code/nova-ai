import { test, expect } from "@playwright/test";

test.describe("Critical Flow 3: Adaptive Quiz & Flashcard Spaced Repetition", () => {
  test("opens quiz generator modal with topic, question count, and difficulty options", async ({ page }) => {
    await page.goto("/quiz");

    // Header and action button in main content area
    await expect(page.locator("main").getByRole("heading", { name: "Adaptive Quizzes" })).toBeVisible();
    await expect(page.getByText("Active Recall").first()).toBeVisible();

    const createQuizBtn = page.getByRole("button", { name: /Create New Quiz/i });
    await expect(createQuizBtn).toBeVisible();

    // Open generator modal
    await createQuizBtn.click();

    // Verify modal elements
    await expect(page.getByText(/Create Adaptive Quiz/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Thermodynamics, Mitosis/i)).toBeVisible();
    await expect(page.getByText(/Difficulty Calibration/i)).toBeVisible();

    // Close modal
    const closeBtn = page.getByRole("button", { name: /Cancel/i });
    await closeBtn.click();
    await expect(page.getByText(/Create Adaptive Quiz/i)).not.toBeVisible();
  });

  test("renders flashcards review hub with review queue and deck synthesis options", async ({ page }) => {
    await page.goto("/flashcards");

    // Spaced repetition review header in main content area
    await expect(page.locator("main").getByRole("heading", { name: "Spaced Repetition" })).toBeVisible();
    await expect(page.getByText("SM-2 Engine").first()).toBeVisible();

    // Deck generator button
    const synthesizeBtn = page.getByRole("button", { name: /Synthesize Deck/i });
    await expect(synthesizeBtn).toBeVisible();

    // Manual card creator
    const addCardBtn = page.getByRole("button", { name: /Add Card/i });
    await expect(addCardBtn).toBeVisible();
    await addCardBtn.click();

    // Verify manual card form expands
    await expect(page.getByText(/Create Custom Flashcard/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Question or concept.../i)).toBeVisible();
    await expect(page.getByPlaceholder(/e.g. Physics, History.../i)).toBeVisible();
  });
});
