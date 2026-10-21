import { describe, it, expect } from "vitest";
import {
  computeLearningDNA,
  formatLearningDNATutorInjection,
  type RawQuizAttempt,
  type RawStudySession,
} from "@/lib/study/learning-dna";

describe("Learning DNA Engine", () => {
  const sampleQuizAttempts: RawQuizAttempt[] = [
    {
      id: "a-1",
      score: 90,
      completed_at: "2026-10-20T10:00:00Z",
      topic: "Python Data Types",
    },
    {
      id: "a-2",
      score: 80,
      completed_at: "2026-10-21T10:00:00Z",
      topic: "Python Data Types",
    },
    {
      id: "a-3",
      score: 50,
      completed_at: "2026-10-21T14:00:00Z",
      topic: "Python Metaclasses",
    },
    {
      id: "a-4",
      score: 60,
      completed_at: "2026-10-21T15:00:00Z",
      topic: "Python Metaclasses",
    },
  ];

  const sampleStudySessions: RawStudySession[] = [
    {
      id: "s-1",
      duration_minutes: 25,
      mode: "pomodoro",
      created_at: "2026-10-21T19:00:00Z", // 7 PM
    },
    {
      id: "s-2",
      duration_minutes: 50,
      mode: "pomodoro",
      created_at: "2026-10-21T19:30:00Z", // 7 PM
    },
    {
      id: "s-3",
      duration_minutes: 25,
      mode: "quiz",
      created_at: "2026-10-21T10:00:00Z", // 10 AM
    },
  ];

  it("computes accurate topic mastery status and identifies struggling topics (<70%)", () => {
    const insights = computeLearningDNA(
      sampleQuizAttempts,
      sampleStudySessions,
      { learning_style: "socratic" }
    );

    // Python Data Types: (90 + 80) / 2 = 85% -> mastered
    expect(insights.topicMastery["Python Data Types"]).toBeDefined();
    expect(insights.topicMastery["Python Data Types"].averageScore).toBe(85);
    expect(insights.topicMastery["Python Data Types"].status).toBe("mastered");

    // Python Metaclasses: (50 + 60) / 2 = 55% -> struggling
    expect(insights.topicMastery["Python Metaclasses"]).toBeDefined();
    expect(insights.topicMastery["Python Metaclasses"].averageScore).toBe(55);
    expect(insights.topicMastery["Python Metaclasses"].status).toBe("struggling");

    // Struggling topics list contains Metaclasses
    expect(insights.strugglingTopics).toContain("Python Metaclasses");
    expect(insights.strugglingTopics).not.toContain("Python Data Types");
  });

  it("calculates optimal study rhythm based on peak session minutes", () => {
    const insights = computeLearningDNA(
      sampleQuizAttempts,
      sampleStudySessions,
      { learning_style: "deep_dive" }
    );

    // Hour 19 (7 PM) had 25 + 50 = 75 minutes, higher than Hour 10 (25 mins)
    expect(insights.optimalStudyHours.peakHour).toBe(19);
    expect(insights.optimalStudyHours.timeOfDay).toBe("Evening");
    expect(insights.optimalStudyHours.totalMinutesLogged).toBe(100);
  });

  it("respects profile learning style and formats concise tutor injection tag", () => {
    const insights = computeLearningDNA(
      sampleQuizAttempts,
      sampleStudySessions,
      { learning_style: "simplified" }
    );

    expect(insights.preferredStyle).toBe("simplified");

    const promptInjection = formatLearningDNATutorInjection(insights);
    expect(promptInjection).toContain("[STUDENT LEARNING DNA]");
    expect(promptInjection).toContain("Python Metaclasses");
    expect(promptInjection).toContain("simplified");
  });

  it("handles empty database states cleanly without returning fake data", () => {
    const insights = computeLearningDNA([], [], null, []);

    expect(insights.overallMasteryPercent).toBe(0);
    expect(insights.strugglingTopics).toHaveLength(0);
    expect(insights.totalStudyMinutes).toBe(0);
    expect(insights.totalQuizzesTaken).toBe(0);
    expect(insights.preferredStyle).toBe("socratic");
  });
});
