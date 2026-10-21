import { describe, it, expect } from "vitest";
import {
  rescheduleTask,
  toggleTaskInSchedule,
  calculateStreakFromDates,
  type StudyPlanSchedule,
} from "@/lib/study/planner";
import { buildPlannerPrompt } from "@/lib/ai/planner-generator";

describe("Study Planner Core Logic", () => {
  const initialSchedule: StudyPlanSchedule = {
    examName: "Python Intermediate Certification",
    targetDate: "2026-10-30",
    weeklyHours: 10,
    overview: "Fast-paced revision plan",
    days: [
      {
        date: "2026-10-22",
        dayOfWeek: "Thursday",
        tasks: [
          {
            id: "task-1",
            title: "Review Mutability and shallow copies",
            topic: "Python Core",
            durationMinutes: 30,
            completed: false,
            type: "reading",
          },
          {
            id: "task-2",
            title: "Practice Generator yield functions",
            topic: "Generators",
            durationMinutes: 45,
            completed: false,
            type: "practice",
          },
        ],
      },
      {
        date: "2026-10-23",
        dayOfWeek: "Friday",
        tasks: [
          {
            id: "task-3",
            title: "Solve Comprehensions quiz",
            topic: "Comprehensions",
            durationMinutes: 30,
            completed: false,
            type: "quiz",
          },
        ],
      },
    ],
  };

  it("rescheduleTask moves a task cleanly from source date to target date", () => {
    const updated = rescheduleTask(
      initialSchedule,
      "task-2",
      "2026-10-22",
      "2026-10-23"
    );

    const day1 = updated.days.find((d) => d.date === "2026-10-22");
    const day2 = updated.days.find((d) => d.date === "2026-10-23");

    expect(day1?.tasks).toHaveLength(1);
    expect(day1?.tasks[0].id).toBe("task-1");

    expect(day2?.tasks).toHaveLength(2);
    expect(day2?.tasks.map((t) => t.id)).toContain("task-2");
  });

  it("rescheduleTask returns original schedule if source and target date are identical", () => {
    const updated = rescheduleTask(
      initialSchedule,
      "task-1",
      "2026-10-22",
      "2026-10-22"
    );
    expect(updated).toEqual(initialSchedule);
  });

  it("toggleTaskInSchedule flips task completion state", () => {
    const { updatedSchedule, isCompleted } = toggleTaskInSchedule(
      initialSchedule,
      "task-1"
    );

    expect(isCompleted).toBe(true);
    const day1 = updatedSchedule.days.find((d) => d.date === "2026-10-22");
    expect(day1?.tasks[0].completed).toBe(true);

    const toggledAgain = toggleTaskInSchedule(updatedSchedule, "task-1");
    expect(toggledAgain.isCompleted).toBe(false);
  });

  it("calculateStreakFromDates returns 0 when no activity exists", () => {
    const streak = calculateStreakFromDates([]);
    expect(streak.currentStreak).toBe(0);
    expect(streak.isActiveToday).toBe(false);
  });

  it("calculateStreakFromDates accurately computes consecutive streaks", () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const dates = [
      today.toISOString().split("T")[0],
      yesterday.toISOString().split("T")[0],
      twoDaysAgo.toISOString().split("T")[0],
    ];

    const streak = calculateStreakFromDates(dates);
    expect(streak.currentStreak).toBe(3);
    expect(streak.isActiveToday).toBe(true);
  });

  it("buildPlannerPrompt formats strict JSON instructions with target hours and topics", () => {
    const { systemInstruction, userPrompt } = buildPlannerPrompt({
      examName: "Quantum Mechanics Final",
      targetDate: "2026-11-05",
      weeklyHours: 15,
      topics: ["Wavefunctions", "Schrodinger Equation"],
    });

    expect(systemInstruction).toContain("15 hours per week");
    expect(systemInstruction).toContain("OUTPUT STRICT JSON ONLY");
    expect(userPrompt).toContain("Quantum Mechanics Final");
    expect(userPrompt).toContain("Wavefunctions");
  });
});
