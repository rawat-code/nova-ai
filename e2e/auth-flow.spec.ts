import { test, expect } from "@playwright/test";

test.describe("Critical Flow 1: Authentication & Onboarding", () => {
  test("renders login page with email, password, and Google OAuth options", async ({ page }) => {
    await page.goto("/login");

    // Title and branding
    await expect(page).toHaveTitle(/Nova/i);
    await expect(page.getByText(/Continue with Google/i)).toBeVisible();
    await expect(page.getByText(/Or continue with email/i)).toBeVisible();

    // Inputs
    const emailInput = page.getByPlaceholder(/scholar@university.edu/i);
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.getByRole("button", { name: "Sign In" });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Switch to Signup link
    const createAccountLink = page.getByRole("link", { name: /Create account/i });
    await expect(createAccountLink).toBeVisible();
    await createAccountLink.click();

    // Verify redirected to signup
    await expect(page).toHaveURL(/.*\/signup/);
  });

  test("renders signup page with full name, email, password, and validation", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.getByRole("heading", { name: /Create your account/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Alex Vance/i)).toBeVisible();
    await expect(page.getByPlaceholder(/scholar@university.edu/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Minimum 6 characters/i)).toBeVisible();

    // Submit button
    const signupBtn = page.getByRole("button", { name: /Create Account/i });
    await expect(signupBtn).toBeVisible();

    // Link back to login
    const loginLink = page.getByRole("link", { name: "Sign in", exact: true });
    await expect(loginLink).toBeVisible();
    await loginLink.click();

    await expect(page).toHaveURL(/.*\/login/);
  });
});
