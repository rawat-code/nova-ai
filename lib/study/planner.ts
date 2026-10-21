import { z } from "zod";

export const planTaskTypeSchema = z.enum(["reading", "practice", "review", "quiz"]);
export type PlanTaskType = z.infer<typeof planTaskTypeSchema>;

export const planTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Task title is required"),
  topic: z.string().min(1, "Topic is required"),
  durationMinutes: z.number().int().min(5).max(180),
  completed: z.boolean().default(false),
  type: planTaskTypeSchema.default("reading"),
});
export type PlanTask = z.infer<typeof planTaskSchema>;

export const planDaySchema = z.object({
  date: z.string(), // "YYYY-MM-DD"
  dayOfWeek: z.string(), // "Monday", "Tuesday", etc.
  tasks: z.array(planTaskSchema),
});
export type PlanDay = z.infer<typeof planDaySchema>;

export const studyPlanScheduleSchema = z.object({
  examName: z.string().min(1, "Exam name is required"),
  targetDate: z.string(), // "YYYY-MM-DD"
  weeklyHours: z.number().int().min(1).max(60),
  overview: z.string().default(""),
  days: z.array(planDaySchema),
});
export type StudyPlanSchedule = z.infer<typeof studyPlanScheduleSchema>;

/**
 * Pure function: Reschedules a task from a source date to a target date.
 */
export function rescheduleTask(
  schedule: StudyPlanSchedule,
  taskId: string,
  sourceDate: string,
  targetDate: string
): StudyPlanSchedule {
  if (sourceDate === targetDate) return schedule;

  let movedTask: PlanTask | null = null;

  const updatedDays = schedule.days.map((day) => {
    if (day.date === sourceDate) {
      const remainingTasks = day.tasks.filter((t) => {
        if (t.id === taskId) {
          movedTask = t;
          return false;
        }
        return true;
      });
      return { ...day, tasks: remainingTasks };
    }
    return day;
  });

  if (!movedTask) return schedule;

  const finalDays = updatedDays.map((day) => {
    if (day.date === targetDate) {
      return { ...day, tasks: [...day.tasks, movedTask!] };
    }
    return day;
  });

  return { ...schedule, days: finalDays };
}

/**
 * Pure function: Toggles completion state of a task in the schedule.
 */
export function toggleTaskInSchedule(
  schedule: StudyPlanSchedule,
  taskId: string
): { updatedSchedule: StudyPlanSchedule; isCompleted: boolean } {
  let isCompleted = false;

  const days = schedule.days.map((day) => ({
    ...day,
    tasks: day.tasks.map((task) => {
      if (task.id === taskId) {
        isCompleted = !task.completed;
        return { ...task, completed: isCompleted };
      }
      return task;
    }),
  }));

  return {
    updatedSchedule: { ...schedule, days },
    isCompleted,
  };
}

/**
 * Calculates current study streak (in consecutive days) from timestamps/dates of activity.
 * Supports dates array formatted as YYYY-MM-DD.
 */
export function calculateStreakFromDates(activityDates: string[]): {
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
} {
  if (!activityDates || activityDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, isActiveToday: false };
  }

  // Deduplicate and sort descending (newest first)
  const uniqueDates = Array.from(new Set(activityDates)).sort().reverse();

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const isActiveToday = uniqueDates.includes(todayStr);

  let currentStreak = 0;
  let checkDate = new Date();

  // If not active today, check starting from yesterday
  if (!isActiveToday) {
    if (!uniqueDates.includes(yesterdayStr)) {
      // Streak broken
      return { currentStreak: 0, longestStreak: calculateLongestStreak(uniqueDates), isActiveToday: false };
    }
    checkDate = yesterday;
  }

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (uniqueDates.includes(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const longestStreak = Math.max(currentStreak, calculateLongestStreak(uniqueDates));

  return {
    currentStreak,
    longestStreak,
    isActiveToday,
  };
}

function calculateLongestStreak(sortedDescDates: string[]): number {
  if (sortedDescDates.length === 0) return 0;

  // Sort ascending for longest streak calculation
  const sortedAsc = [...sortedDescDates].sort();
  let maxStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = new Date(sortedAsc[i - 1]);
    const curr = new Date(sortedAsc[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentRun++;
      if (currentRun > maxStreak) maxStreak = currentRun;
    } else if (diffDays > 1) {
      currentRun = 1;
    }
  }

  return maxStreak;
}
