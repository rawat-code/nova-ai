/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 * Pure functional implementation without side effects.
 */

export interface SM2Item {
  repetition: number;
  intervalDays: number;
  easeFactor: number;
}

export interface SM2Result {
  repetition: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: string; // ISO date string YYYY-MM-DD
}

/**
 * Standard 0-5 SuperMemo grading scale:
 * 5: Perfect recall
 * 4: Correct response after hesitation
 * 3: Correct response with serious difficulty
 * 2: Incorrect response, but seemed easy to recall upon seeing answer
 * 1: Incorrect response, familiar with the concept
 * 0: Complete blackout
 */
export type SM2Grade = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Convenient 4-button rating types for flashcard review UIs:
 * - 'again' (grade 1): failure, reset interval
 * - 'hard' (grade 3): correct with serious difficulty
 * - 'good' (grade 4): correct with brief hesitation
 * - 'easy' (grade 5): perfect recall, bonus interval
 */
export type UserRating = "again" | "hard" | "good" | "easy";

export const RATING_TO_GRADE: Record<UserRating, SM2Grade> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

export const MIN_EASE_FACTOR = 1.3;
export const DEFAULT_EASE_FACTOR = 2.5;

/**
 * Calculate the next review schedule using the SuperMemo SM-2 algorithm.
 *
 * @param item Current card state (repetition, intervalDays, easeFactor)
 * @param grade Performance rating from 0 (blackout) to 5 (perfect)
 * @param currentDate Optional reference date (defaults to today)
 * @returns Updated repetition, interval, easeFactor, and nextReviewDate
 */
export function calculateSM2(
  item: SM2Item,
  grade: SM2Grade,
  currentDate: Date = new Date()
): SM2Result {
  const { repetition, intervalDays, easeFactor } = item;

  let nextRepetition: number;
  let nextInterval: number;

  if (grade >= 3) {
    // Correct recall
    if (repetition === 0) {
      nextInterval = 1;
    } else if (repetition === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(intervalDays * easeFactor);
    }
    nextRepetition = repetition + 1;
  } else {
    // Incorrect recall (forgotten)
    nextRepetition = 0;
    nextInterval = 1;
  }

  // Calculate new Ease Factor:
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const delta = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
  const rawEase = easeFactor + delta;
  const nextEaseFactor = Math.max(MIN_EASE_FACTOR, Math.round(rawEase * 100) / 100);

  // Calculate next review date in YYYY-MM-DD
  const targetDate = new Date(currentDate);
  targetDate.setDate(targetDate.getDate() + nextInterval);
  const nextReviewDate = targetDate.toISOString().split("T")[0];

  return {
    repetition: nextRepetition,
    intervalDays: nextInterval,
    easeFactor: nextEaseFactor,
    nextReviewDate,
  };
}

/**
 * Helper to calculate SM-2 with user rating ("again" | "hard" | "good" | "easy").
 */
export function calculateSM2FromRating(
  item: SM2Item,
  rating: UserRating,
  currentDate?: Date
): SM2Result {
  const grade = RATING_TO_GRADE[rating];
  return calculateSM2(item, grade, currentDate);
}
