"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, Sparkles, Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageContent } from "../tutor/message-content";
import type { GeneratedQuiz, QuizQuestion } from "@/lib/ai/quiz-generator";

export interface QuizSubmissionPayload {
  quizId?: string;
  score: number;
  correctCount: number;
  totalCount: number;
  answers: Record<string, string>;
  questions: QuizQuestion[];
}

interface QuizRunnerProps {
  quiz: GeneratedQuiz & { id?: string };
  onComplete: (payload: QuizSubmissionPayload) => void;
  onExit: () => void;
}

export function QuizRunner({ quiz, onComplete, onExit }: QuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [shortAnswerInput, setShortAnswerInput] = useState<string>("");
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  const currentQuestion: QuizQuestion = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;

  const currentChoice =
    currentQuestion.type === "short_answer" ? shortAnswerInput : selectedAnswer;

  const checkIsCorrect = (userAns: string, correctAns: string, type: string): boolean => {
    const cleanUser = userAns.trim().toLowerCase();
    const cleanCorrect = correctAns.trim().toLowerCase();

    if (type === "short_answer") {
      // Fuzzy substring or exact match
      return cleanUser === cleanCorrect || cleanCorrect.includes(cleanUser) || cleanUser.includes(cleanCorrect);
    }
    return cleanUser === cleanCorrect;
  };

  const isCurrentCorrect = checkIsCorrect(
    currentChoice,
    currentQuestion.correctAnswer,
    currentQuestion.type
  );

  const handleSubmitAnswer = () => {
    if (!currentChoice.trim() || isAnswerSubmitted) return;

    setIsAnswerSubmitted(true);
    const updatedAnswers = {
      ...userAnswers,
      [currentQuestion.id]: currentChoice,
    };
    setUserAnswers(updatedAnswers);

    if (isCurrentCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Calculate final score
      const finalCorrectCount = correctAnswersCount;
      const scorePercentage = Math.round((finalCorrectCount / quiz.questions.length) * 100);

      onComplete({
        quizId: quiz.id,
        score: scorePercentage,
        correctCount: finalCorrectCount,
        totalCount: quiz.questions.length,
        answers: userAnswers,
        questions: quiz.questions,
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer("");
      setShortAnswerInput("");
      setIsAnswerSubmitted(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Quiz Progress & Topic Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            {quiz.topic} · {quiz.difficulty}
          </span>
          <h2 className="font-display text-lg font-bold text-white sm:text-xl">
            {quiz.title}
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onExit}
          className="border-white/10 text-xs text-slate-400 hover:text-white"
        >
          Exit Quiz
        </Button>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
          <span>
            {Math.round(((currentIndex + 1) / quiz.questions.length) * 100)}% Complete
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-white/10 bg-[#0a0d18]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <HelpCircle className="size-3.5" />
            {currentQuestion.type === "mcq"
              ? "Multiple Choice"
              : currentQuestion.type === "true_false"
              ? "True / False"
              : "Short Answer"}
          </span>

          <span className="text-xs text-slate-400 font-mono">
            Score: {correctAnswersCount} / {currentIndex + (isAnswerSubmitted ? 1 : 0)}
          </span>
        </div>

        <h3 className="font-display text-base font-semibold leading-relaxed text-white sm:text-lg">
          {currentQuestion.question}
        </h3>

        {/* Options / Inputs */}
        <div className="mt-6 space-y-3">
          {/* MCQ Options */}
          {currentQuestion.type === "mcq" && currentQuestion.options && (
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, idx) => {
                const optLetter = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = selectedAnswer === opt;
                const isCorrectChoice = opt === currentQuestion.correctAnswer;

                let stateStyle = "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5 text-slate-200";

                if (isAnswerSubmitted) {
                  if (isCorrectChoice) {
                    stateStyle = "border-emerald-500 bg-emerald-950/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]";
                  } else if (isSelected && !isCorrectChoice) {
                    stateStyle = "border-rose-500 bg-rose-950/30 text-rose-300";
                  } else {
                    stateStyle = "border-white/5 opacity-50 text-slate-400";
                  }
                } else if (isSelected) {
                  stateStyle = "border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.25)]";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedAnswer(opt)}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left text-xs sm:text-sm transition-all duration-200 ${stateStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 font-mono text-xs font-semibold">
                        {optLetter}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isAnswerSubmitted && isCorrectChoice && (
                      <Check className="size-5 text-emerald-400 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrectChoice && (
                      <XCircle className="size-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* True / False Options */}
          {currentQuestion.type === "true_false" && (
            <div className="grid grid-cols-2 gap-3">
              {["True", "False"].map((choice) => {
                const isSelected = selectedAnswer.toLowerCase() === choice.toLowerCase();
                const isCorrect = currentQuestion.correctAnswer.toLowerCase() === choice.toLowerCase();

                let style = "border-white/10 bg-white/[0.02] hover:border-white/20 text-slate-200";

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    style = "border-emerald-500 bg-emerald-950/30 text-emerald-300";
                  } else if (isSelected && !isCorrect) {
                    style = "border-rose-500 bg-rose-950/30 text-rose-300";
                  } else {
                    style = "border-white/5 opacity-50";
                  }
                } else if (isSelected) {
                  style = "border-indigo-500 bg-indigo-500/20 text-indigo-300";
                }

                return (
                  <button
                    key={choice}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedAnswer(choice)}
                    className={`flex items-center justify-center rounded-xl border p-4 font-display text-sm font-semibold transition-all ${style}`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          )}

          {/* Short Answer Input */}
          {currentQuestion.type === "short_answer" && (
            <div className="space-y-3">
              <input
                type="text"
                value={shortAnswerInput}
                onChange={(e) => setShortAnswerInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isAnswerSubmitted) {
                    handleSubmitAnswer();
                  }
                }}
                disabled={isAnswerSubmitted}
                placeholder="Type your short answer..."
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              {isAnswerSubmitted && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">Target Answer:</span>{" "}
                  <span className="text-emerald-400 font-mono">{currentQuestion.correctAnswer}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Per-Answer Explanation Reveal */}
        {isAnswerSubmitted && (
          <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-5 animate-in fade-in-0 duration-300">
            <div className="flex items-center gap-2">
              {isCurrentCorrect ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  <span>Correct!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                  <XCircle className="size-4" />
                  <span>Incorrect</span>
                </div>
              )}
            </div>

            <div className="mt-2 text-xs leading-relaxed text-slate-300">
              <MessageContent content={currentQuestion.explanation} />
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs text-slate-500">
            Press Check to verify, then continue
          </span>

          {!isAnswerSubmitted ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={!currentChoice.trim()}
              className="bg-indigo-600 font-semibold text-white hover:bg-indigo-500"
            >
              <Sparkles className="mr-2 size-4" />
              Check Answer
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              className="bg-gradient-to-r from-cyan-400 to-indigo-500 font-semibold text-black hover:opacity-95"
            >
              <span>{isLastQuestion ? "View Results" : "Next Question"}</span>
              <ArrowRight className="ml-2 size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
