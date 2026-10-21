export interface RawQuizAttempt {
  id: string;
  score: number;
  completed_at: string;
  topic?: string;
  quizzes?: { topic: string; difficulty: string } | null;
}

export interface RawStudySession {
  id: string;
  duration_minutes: number;
  mode: string;
  created_at: string;
}

export interface RawProfile {
  learning_style?: string | null;
  grade_level?: string | null;
}

export interface RawConversation {
  id: string;
  mode?: string | null;
}

export interface TopicMasteryItem {
  averageScore: number;
  attemptsCount: number;
  status: "mastered" | "developing" | "struggling";
}

export interface LearningDNAInsights {
  topicMastery: Record<string, TopicMasteryItem>;
  strugglingTopics: string[];
  optimalStudyHours: {
    peakHour: number;
    timeOfDay: "Morning" | "Afternoon" | "Evening" | "Night";
    totalMinutesLogged: number;
    hourlyDistribution: Record<number, number>;
  };
  preferredStyle: string;
  overallMasteryPercent: number;
  totalStudyMinutes: number;
  totalQuizzesTaken: number;
  summary: string;
}

/**
 * Pure function: Computes Learning DNA insights from real database rows.
 * No fake data.
 */
export function computeLearningDNA(
  quizAttempts: RawQuizAttempt[],
  studySessions: RawStudySession[],
  profile?: RawProfile | null,
  conversations?: RawConversation[]
): LearningDNAInsights {
  // 1. Topic Mastery & Struggling Topics
  const topicMap: Record<string, { totalScore: number; count: number }> = {};

  quizAttempts.forEach((attempt) => {
    const topic =
      attempt.topic ||
      (attempt.quizzes && typeof attempt.quizzes === "object" ? attempt.quizzes.topic : "") ||
      "General Knowledge";

    if (!topicMap[topic]) {
      topicMap[topic] = { totalScore: 0, count: 0 };
    }
    topicMap[topic].totalScore += Number(attempt.score) || 0;
    topicMap[topic].count += 1;
  });

  const topicMastery: Record<string, TopicMasteryItem> = {};
  const strugglingTopics: string[] = [];
  let totalScoreSum = 0;
  let totalTopicsCount = 0;

  Object.entries(topicMap).forEach(([topic, data]) => {
    const avg = Math.round((data.totalScore / data.count) * 10) / 10;
    totalScoreSum += avg;
    totalTopicsCount++;

    let status: "mastered" | "developing" | "struggling" = "developing";
    if (avg >= 80) status = "mastered";
    else if (avg < 60) status = "struggling";

    topicMastery[topic] = {
      averageScore: avg,
      attemptsCount: data.count,
      status,
    };

    if (avg < 70) {
      strugglingTopics.push(topic);
    }
  });

  const overallMasteryPercent =
    totalTopicsCount > 0
      ? Math.round((totalScoreSum / totalTopicsCount) * 10) / 10
      : 0;

  // 2. Optimal Study Hours & Total Focus Time
  const hourlyDistribution: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourlyDistribution[i] = 0;

  let totalStudyMinutes = 0;
  studySessions.forEach((s) => {
    const mins = Number(s.duration_minutes) || 0;
    totalStudyMinutes += mins;

    if (s.created_at) {
      const hour = new Date(s.created_at).getUTCHours();
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + mins;
    }
  });

  let peakHour = 19; // Default 7 PM if no data
  let maxMins = 0;
  Object.entries(hourlyDistribution).forEach(([hourStr, mins]) => {
    if (mins > maxMins) {
      maxMins = mins;
      peakHour = Number(hourStr);
    }
  });

  let timeOfDay: "Morning" | "Afternoon" | "Evening" | "Night" = "Evening";
  if (peakHour >= 5 && peakHour < 12) timeOfDay = "Morning";
  else if (peakHour >= 12 && peakHour < 17) timeOfDay = "Afternoon";
  else if (peakHour >= 17 && peakHour < 22) timeOfDay = "Evening";
  else timeOfDay = "Night";

  // 3. Preferred Explanation Style
  let preferredStyle = profile?.learning_style || "";
  if (!preferredStyle && conversations && conversations.length > 0) {
    const modeCounts: Record<string, number> = {};
    conversations.forEach((c) => {
      if (c.mode) {
        modeCounts[c.mode] = (modeCounts[c.mode] || 0) + 1;
      }
    });

    let topMode = "socratic";
    let topCount = 0;
    Object.entries(modeCounts).forEach(([m, cnt]) => {
      if (cnt > topCount) {
        topCount = cnt;
        topMode = m;
      }
    });
    preferredStyle = topMode;
  }

  if (!preferredStyle) {
    preferredStyle = "socratic";
  }

  // 4. Learning DNA Summary
  const summaryParts: string[] = [];
  if (strugglingTopics.length > 0) {
    summaryParts.push(`Identified gap areas: ${strugglingTopics.slice(0, 3).join(", ")}`);
  }
  if (totalTopicsCount > 0) {
    summaryParts.push(`Overall mastery index: ${overallMasteryPercent}% across ${totalTopicsCount} topics`);
  }
  if (totalStudyMinutes > 0) {
    summaryParts.push(`Optimal study rhythm: ${timeOfDay} (${peakHour}:00)`);
  }
  summaryParts.push(`Preferred learning style: ${preferredStyle}`);

  const summary = summaryParts.join(". ") + ".";

  return {
    topicMastery,
    strugglingTopics,
    optimalStudyHours: {
      peakHour,
      timeOfDay,
      totalMinutesLogged: totalStudyMinutes,
      hourlyDistribution,
    },
    preferredStyle,
    overallMasteryPercent,
    totalStudyMinutes,
    totalQuizzesTaken: quizAttempts.length,
    summary,
  };
}

/**
 * Formats a short Learning DNA summary prompt injection for the AI Tutor.
 */
export function formatLearningDNATutorInjection(insights: LearningDNAInsights): string {
  const parts: string[] = [];

  if (insights.strugglingTopics.length > 0) {
    parts.push(`Weak/Struggling Topics: ${insights.strugglingTopics.join(", ")}`);
  }
  if (insights.preferredStyle) {
    parts.push(`Preferred Learning Style: ${insights.preferredStyle}`);
  }
  if (insights.overallMasteryPercent > 0) {
    parts.push(`Current Mastery: ${insights.overallMasteryPercent}%`);
  }

  if (parts.length === 0) return "";

  return `\n\n[STUDENT LEARNING DNA]\n${parts.join(" | ")}\nInstruction: Adapt explanations to reinforce these struggling topics and respect the student's preferred style.`;
}
