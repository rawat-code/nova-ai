import React from "react";
import { TutorChat } from "@/components/features/tutor/tutor-chat";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tutor — Nova",
  description: "Adaptive multi-modal AI Tutor for students. Socratic inquiry, simplified explanations, deep technical derivations, and exam preparation.",
};

export default function TutorPage() {
  return (
    <div className="w-full">
      <TutorChat />
    </div>
  );
}
