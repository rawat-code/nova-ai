import { getAIProvider, type ChatMessage } from "./provider";
import { extractJsonFromResponse } from "./quiz-generator";
import {
  studyPlanScheduleSchema,
  type StudyPlanSchedule,
} from "@/lib/study/planner";

export interface PlannerGenerationOptions {
  examName: string;
  targetDate: string; // "YYYY-MM-DD"
  weeklyHours: number;
  topics?: string[];
  signal?: AbortSignal;
}

export function buildPlannerPrompt(options: PlannerGenerationOptions): {
  systemInstruction: string;
  userPrompt: string;
  startDate: string;
  targetDate: string;
} {
  const { examName, targetDate, weeklyHours, topics = [] } = options;

  const now = new Date();
  const startDateStr = now.toISOString().split("T")[0];

  const systemInstruction = `You are Nova's Academic Study Architect, specialized in cognitive pacing, spaced review, and realistic time blocking for students.
Create an actionable, day-by-day study calendar leading up to the student's exam/goal.

RULES:
1. Schedule daily tasks that realistically fit the student's target of ${weeklyHours} hours per week.
2. Balance reading/theory, practical coding/problem solving, active recall review, and practice quizzes.
3. Keep individual task durations between 20 and 60 minutes for optimal focus.
4. Distribute the provided subjects/topics strategically so high-yield topics are covered first and revisited before the target date.
5. Provide a realistic day-by-day schedule from ${startDateStr} to ${targetDate}. (Schedule maximum 14 days).
6. OUTPUT STRICT JSON ONLY matching the schema. No markdown fences, no explanatory prelude or outro.

JSON SCHEMA:
{
  "examName": "${examName}",
  "targetDate": "${targetDate}",
  "weeklyHours": ${weeklyHours},
  "overview": "Short 1-2 sentence strategy overview of the plan",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "dayOfWeek": "Monday",
      "tasks": [
        {
          "id": "task-uuid-or-id",
          "title": "Clear action-oriented task title",
          "topic": "Topic name",
          "durationMinutes": 30,
          "completed": false,
          "type": "reading" | "practice" | "review" | "quiz"
        }
      ]
    }
  ]
}`;

  const topicListStr =
    topics.length > 0
      ? `Available course topics to incorporate:\n${topics.map((t) => `- ${t}`).join("\n")}`
      : `General exam preparation for: ${examName}`;

  const userPrompt = `Generate a day-by-day study schedule for the exam "${examName}".
Target Exam Date: ${targetDate}
Available Study Time: ${weeklyHours} hours per week

${topicListStr}

Output strict JSON only matching the schema.`;

  return {
    systemInstruction,
    userPrompt,
    startDate: startDateStr,
    targetDate,
  };
}

/**
 * Generates an adaptive, structured study plan schedule with Zod validation.
 */
export async function generateStudyPlanWithAI(
  options: PlannerGenerationOptions,
  maxRetries = 1
): Promise<StudyPlanSchedule> {
  const { signal } = options;
  const { systemInstruction, userPrompt } = buildPlannerPrompt(options);

  const aiProvider = getAIProvider();
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= maxRetries) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    try {
      const messages: ChatMessage[] = [
        { role: "user", content: userPrompt },
      ];

      if (attempt > 0 && lastError) {
        messages.push({
          role: "model",
          content: "```json\n{ ... }\n```",
        });
        messages.push({
          role: "user",
          content: `Your previous response failed validation: ${lastError.message}.
Please output STRICT JSON ONLY matching the schema object with keys: examName, targetDate, weeklyHours, overview, days. Ensure it is valid JSON.`,
        });
      }

      const rawResponse = await aiProvider.generateChat({
        messages,
        systemInstruction,
        signal,
      });

      const jsonString = extractJsonFromResponse(rawResponse);
      const parsedJson = JSON.parse(jsonString);

      // Ensure tasks have IDs if model omitted them
      if (Array.isArray(parsedJson.days)) {
        parsedJson.days.forEach((day: { tasks?: Array<{ id?: string }> }, dIdx: number) => {
          if (Array.isArray(day.tasks)) {
            day.tasks.forEach((task, tIdx) => {
              if (!task.id) {
                task.id = `task-${dIdx + 1}-${tIdx + 1}-${Date.now().toString(36)}`;
              }
            });
          }
        });
      }

      const validated = studyPlanScheduleSchema.parse(parsedJson);
      return validated;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      attempt++;
      if (attempt > maxRetries) {
        console.warn(
          `[StudyPlanner] AI generation failed (${lastError.message}). Generating high-quality algorithmic study plan...`
        );
        return generateAlgorithmicStudyPlan(options);
      }
    }
  }

  return generateAlgorithmicStudyPlan(options);
}

/**
 * High-quality deterministic/algorithmic study plan generator.
 * Used as a zero-failure fallback if AI API quotas or network outages occur.
 */
export function generateAlgorithmicStudyPlan(
  options: PlannerGenerationOptions
): StudyPlanSchedule {
  const { examName, targetDate, weeklyHours, topics = [] } = options;

  const effectiveTopics =
    topics.length > 0
      ? topics
      : [examName, `${examName} Fundamentals`, `${examName} Problem Solving`, `${examName} Review`];

  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.max(1, Math.min(14, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const days: StudyPlanSchedule["days"] = [];

  // Pacing calculation: weeklyHours to daily minutes
  const dailyTargetMinutes = Math.max(30, Math.min(180, Math.round((weeklyHours * 60) / 7)));

  for (let i = 0; i < diffDays; i++) {
    const dayDate = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
    const dateStr = dayDate.toISOString().split("T")[0];
    const dayOfWeek = daysOfWeek[dayDate.getDay()];

    const progressRatio = (i + 1) / diffDays;
    const topic = effectiveTopics[i % effectiveTopics.length];
    const secondaryTopic = effectiveTopics[(i + 1) % effectiveTopics.length];

    const tasks: StudyPlanSchedule["days"][number]["tasks"] = [];

    if (progressRatio < 0.45) {
      tasks.push({
        id: `task-${i + 1}-1-${Date.now().toString(36)}`,
        title: `Deep Read & Concept Mastery: ${topic}`,
        topic,
        durationMinutes: Math.round(dailyTargetMinutes * 0.6),
        completed: false,
        type: "reading",
      });
      tasks.push({
        id: `task-${i + 1}-2-${Date.now().toString(36)}`,
        title: `Applied Exercises & Examples: ${topic}`,
        topic,
        durationMinutes: Math.round(dailyTargetMinutes * 0.4),
        completed: false,
        type: "practice",
      });
    } else if (progressRatio < 0.8) {
      tasks.push({
        id: `task-${i + 1}-1-${Date.now().toString(36)}`,
        title: `Targeted Problem Solving & Active Recall: ${secondaryTopic}`,
        topic: secondaryTopic,
        durationMinutes: Math.round(dailyTargetMinutes * 0.6),
        completed: false,
        type: "practice",
      });
      tasks.push({
        id: `task-${i + 1}-2-${Date.now().toString(36)}`,
        title: `Timed Benchmark Quiz: ${secondaryTopic}`,
        topic: secondaryTopic,
        durationMinutes: Math.round(dailyTargetMinutes * 0.4),
        completed: false,
        type: "quiz",
      });
    } else {
      tasks.push({
        id: `task-${i + 1}-1-${Date.now().toString(36)}`,
        title: `High-Yield Formula & Concept Review: ${examName}`,
        topic,
        durationMinutes: Math.round(dailyTargetMinutes * 0.5),
        completed: false,
        type: "review",
      });
      tasks.push({
        id: `task-${i + 1}-2-${Date.now().toString(36)}`,
        title: `Final Exam Simulation & Mock Test: ${examName}`,
        topic: examName,
        durationMinutes: Math.round(dailyTargetMinutes * 0.5),
        completed: false,
        type: "quiz",
      });
    }

    days.push({
      date: dateStr,
      dayOfWeek,
      tasks,
    });
  }

  return {
    examName,
    targetDate,
    weeklyHours,
    overview: `Strategic ${weeklyHours}h/week paced review for ${examName}. Balanced progression from foundational reading to active problem-solving and final exam simulation.`,
    days,
  };
}
