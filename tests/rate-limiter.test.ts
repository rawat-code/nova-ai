import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit } from "@/lib/ai/rate-limiter";

describe("Rate Limiter Engine", () => {
  it("allows requests below the defined threshold", async () => {
    const id = `test-user-${Date.now()}`;
    const result = await checkRateLimit(id, 3, 60);

    expect(result.success).toBe(true);
    expect(result.limit).toBe(3);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests when the threshold is exceeded", async () => {
    const id = `test-throttle-${Date.now()}`;
    const limit = 2;

    const req1 = await checkRateLimit(id, limit, 60);
    expect(req1.success).toBe(true);
    expect(req1.remaining).toBe(1);

    const req2 = await checkRateLimit(id, limit, 60);
    expect(req2.success).toBe(true);
    expect(req2.remaining).toBe(0);

    // Third request exceeds limit
    const req3 = await checkRateLimit(id, limit, 60);
    expect(req3.success).toBe(false);
    expect(req3.remaining).toBe(0);
  });

  it("resets window after expiration", async () => {
    const id = `test-window-${Date.now()}`;
    const req1 = await checkRateLimit(id, 1, 1);
    expect(req1.success).toBe(true);

    const req2 = await checkRateLimit(id, 1, 1);
    expect(req2.success).toBe(false);

    // Wait for window to expire
    await new Promise((res) => setTimeout(res, 1100));

    const req3 = await checkRateLimit(id, 1, 1);
    expect(req3.success).toBe(true);
  });
});
