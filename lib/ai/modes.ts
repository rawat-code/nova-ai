export type TutorMode = "explain" | "deep" | "socratic" | "exam";

export interface ModeConfig {
  id: TutorMode;
  name: string;
  tagline: string;
  badge: string;
  description: string;
  color: string;
  bgGradient: string;
  samplePrompt: string;
}

export const TUTOR_MODES: Record<TutorMode, ModeConfig> = {
  explain: {
    id: "explain",
    name: "Explain Simply",
    tagline: "Feynman technique & intuitive real-world analogies",
    badge: "Intuitive",
    description: "Breaks complex academic topics down into simple, vivid analogies without heavy jargon.",
    color: "text-cyan-300",
    bgGradient: "from-cyan-500/20 to-sky-500/10",
    samplePrompt: "Explain how photosynthesis converts photon energy using a simple everyday analogy.",
  },
  deep: {
    id: "deep",
    name: "Deep Dive",
    tagline: "Rigorous first-principles derivation & academic mechanics",
    badge: "Rigorous",
    description: "Explores the mathematical derivations, theoretical mechanics, edge cases, and proofs.",
    color: "text-indigo-300",
    bgGradient: "from-indigo-500/20 to-violet-500/10",
    samplePrompt: "Derive the Navier-Stokes momentum equations from conservation of momentum.",
  },
  socratic: {
    id: "socratic",
    name: "Socratic Inquiry",
    tagline: "Guided questioning to build independent mastery",
    badge: "Interactive",
    description: "Guides you through problems by asking probing questions instead of giving away raw answers.",
    color: "text-emerald-300",
    bgGradient: "from-emerald-500/20 to-teal-500/10",
    samplePrompt: "I'm confused about why capacitors block DC current but pass AC signals.",
  },
  exam: {
    id: "exam",
    name: "Exam Mode",
    tagline: "Strict rubric grading, key terms check, & instant scoring",
    badge: "Evaluative",
    description: "Simulates test conditions, evaluates precision against standard grading rubrics, and catches omissions.",
    color: "text-amber-300",
    bgGradient: "from-amber-500/20 to-orange-500/10",
    samplePrompt: "Test my knowledge on the citric acid cycle. Ask me an exam question with marks.",
  },
};

export interface PromptContext {
  studentName?: string;
  gradeLevel?: "high_school" | "college" | "graduate" | string;
  learningStyle?: "visual" | "socratic" | "deep_dive" | "simplified" | string;
  topic?: string;
  citedNotes?: Array<{
    title: string;
    page?: number;
    content: string;
  }>;
}

/**
 * Builds the customized system instruction for Nova based on the selected mode and student context.
 */
export function buildSystemInstruction(mode: TutorMode, context: PromptContext = {}): string {
  const baseInstruction = [
    "You are Nova, an elite adaptive AI learning companion designed for high school and college scholars.",
    "Your responses must be visually engaging and formatted with GitHub Flavored Markdown.",
    "When mathematical or scientific formulas are needed, use LaTeX: inline equations enclosed in $...$ and block display equations in $$...$$.",
    "Format code snippets with standard fenced triple-backtick markdown blocks specifying the language identifier.",
    "Maintain high intellectual warmth, pedagogical clarity, and academic honesty. Never hallucinate citations.",
  ];

  if (context.gradeLevel) {
    baseInstruction.push(`Target Academic Level: ${context.gradeLevel}.`);
  }
  if (context.studentName) {
    baseInstruction.push(`Student Name: ${context.studentName}.`);
  }

  let modeSpecificInstruction = "";

  switch (mode) {
    case "explain":
      modeSpecificInstruction = `
[MODE: EXPLAIN SIMPLY]
- Objective: Provide ultra-clear, intuitive explanations using the Feynman technique.
- Principles:
  1. Start with a relatable real-world analogy before introducing formal terminology.
  2. Avoid unnecessary academic jargon; replace buzzwords with plain concepts.
  3. Break multi-stage concepts into crisp numbered steps or bullet points.
  4. Conclude with a quick 1-sentence "TL;DR" takeaway.
      `.trim();
      break;

    case "deep":
      modeSpecificInstruction = `
[MODE: DEEP DIVE]
- Objective: Provide exhaustive, university-level technical depth and mechanistic understanding.
- Principles:
  1. Trace concepts from first-principles foundations up to advanced formulations.
  2. Include explicit mathematical derivations, formal proofs, and standard LaTeX notation.
  3. Highlight boundary conditions, non-obvious edge cases, and theoretical trade-offs.
  4. Compare competing frameworks or alternative physical/computational interpretations.
      `.trim();
      break;

    case "socratic":
      modeSpecificInstruction = `
[MODE: SOCRATIC INQUIRY]
- Objective: Guide the student to discover the answer themselves through structured inquiry.
- Principles:
  1. NEVER directly hand the student the full final solution or answer right away.
  2. Acknowledge what the student got right, isolate their core uncertainty or misconception.
  3. Pose 1 or 2 focused, thought-provoking guiding questions that lead toward the next logical step.
  4. If the student is stuck, provide a minimal progressive hint rather than solving the problem.
      `.trim();
      break;

    case "exam":
      modeSpecificInstruction = `
[MODE: EXAM MODE]
- Objective: Conduct strict, test-oriented evaluation with rubric-based scoring.
- Principles:
  1. If evaluating a student answer: provide a score (e.g. [Score: X/Y]), list required key terms that were present or missing, and give an exemplar model answer.
  2. If posing a practice question: specify the topic, point value, and question type (e.g., [Question — 5 Marks]).
  3. Enforce strict academic rigor and zero tolerance for vague or incomplete explanations.
      `.trim();
      break;
  }

  const sections = [...baseInstruction, modeSpecificInstruction];

  if (context.citedNotes && context.citedNotes.length > 0) {
    const notesContent = context.citedNotes
      .map(
        (n, idx) =>
          `[Source ${idx + 1}: ${n.title}${n.page ? ` (Page ${n.page})` : ""}]\n${n.content}`
      )
      .join("\n\n");

    sections.push(`
[GROUNDED COURSE NOTES]
The student has provided their own course notes below.
Grounded Rules:
- Ground your explanation strictly in these provided notes whenever relevant.
- Cite the exact source using [Source X: Title (Page Y)].
- If the student asks a specific factual question about their course material that is NOT contained in the notes, state politely that the uploaded notes do not cover that specific detail.
${notesContent}
    `.trim());
  }

  return sections.join("\n\n");
}
