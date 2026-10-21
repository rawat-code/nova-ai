import { describe, it, expect } from "vitest";
import {
  calculateSM2,
  calculateSM2FromRating,
  MIN_EASE_FACTOR,
  DEFAULT_EASE_FACTOR,
} from "@/lib/study/sm2";

describe("SuperMemo SM-2 Spaced Repetition Algorithm", () => {
  const baseDate = new Date("2026-10-21T00:00:00Z");

  it("handles initial review with perfect score (grade 5)", () => {
    const initialItem = {
      repetition: 0,
      intervalDays: 1,
      easeFactor: DEFAULT_EASE_FACTOR, // 2.5
    };

    // delta = 0.1 - (0) = +0.10 => EF = 2.60
    const result = calculateSM2(initialItem, 5, baseDate);

    expect(result.repetition).toBe(1);
    expect(result.intervalDays).toBe(1);
    expect(result.easeFactor).toBe(2.6);
    expect(result.nextReviewDate).toBe("2026-10-22");
  });

  it("sets interval to 6 days on second consecutive successful review (grade 4)", () => {
    const item = {
      repetition: 1,
      intervalDays: 1,
      easeFactor: 2.6,
    };

    // grade 4: delta = 0.1 - (1)*(0.08 + 0.02) = 0.1 - 0.10 = 0.00 => EF unchanged
    const result = calculateSM2(item, 4, baseDate);

    expect(result.repetition).toBe(2);
    expect(result.intervalDays).toBe(6);
    expect(result.easeFactor).toBe(2.6);
    expect(result.nextReviewDate).toBe("2026-10-27");
  });

  it("scales interval by easeFactor on 3rd+ consecutive successful review", () => {
    const item = {
      repetition: 2,
      intervalDays: 6,
      easeFactor: 2.5,
    };

    // interval = Math.round(6 * 2.5) = 15
    const result = calculateSM2(item, 4, baseDate);

    expect(result.repetition).toBe(3);
    expect(result.intervalDays).toBe(15);
    expect(result.easeFactor).toBe(2.5);
    expect(result.nextReviewDate).toBe("2026-11-05");
  });

  it("resets repetition to 0 and interval to 1 on failure (grade < 3)", () => {
    const item = {
      repetition: 4,
      intervalDays: 30,
      easeFactor: 2.4,
    };

    // Grade 1 (Forgot / Again)
    const result = calculateSM2(item, 1, baseDate);

    expect(result.repetition).toBe(0);
    expect(result.intervalDays).toBe(1);
    // delta = 0.1 - 4 * (0.08 + 4*0.02) = 0.1 - 4 * 0.16 = 0.1 - 0.64 = -0.54
    // 2.4 - 0.54 = 1.86
    expect(result.easeFactor).toBe(1.86);
    expect(result.nextReviewDate).toBe("2026-10-22");
  });

  it("never allows easeFactor to drop below MIN_EASE_FACTOR (1.30)", () => {
    let item = {
      repetition: 0,
      intervalDays: 1,
      easeFactor: 1.4,
    };

    // Consecutive complete blackout failures
    for (let i = 0; i < 5; i++) {
      const res = calculateSM2(item, 0, baseDate);
      item = {
        repetition: res.repetition,
        intervalDays: res.intervalDays,
        easeFactor: res.easeFactor,
      };
    }

    expect(item.easeFactor).toBe(MIN_EASE_FACTOR);
    expect(item.intervalDays).toBe(1);
    expect(item.repetition).toBe(0);
  });

  it("maps user rating labels (again, hard, good, easy) correctly", () => {
    const item = { repetition: 1, intervalDays: 1, easeFactor: 2.5 };

    const againRes = calculateSM2FromRating(item, "again", baseDate);
    expect(againRes.repetition).toBe(0);
    expect(againRes.intervalDays).toBe(1);

    const goodRes = calculateSM2FromRating(item, "good", baseDate);
    expect(goodRes.repetition).toBe(2);
    expect(goodRes.intervalDays).toBe(6);

    const easyRes = calculateSM2FromRating(item, "easy", baseDate);
    expect(easyRes.repetition).toBe(2);
    expect(easyRes.intervalDays).toBe(6);
    expect(easyRes.easeFactor).toBe(2.6);
  });
});
