import type { Metadata, Viewport } from "next";
import { Outfit, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GrainOverlay } from "@/components/layout/grain-overlay";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Nova — AI Learning Companion for Students",
  description:
    "Nova is an adaptive AI learning companion for high school and college students. Featuring Socratic AI tutoring, notes vault with citation-grounded RAG, adaptive quizzes, spaced repetition, and personalized study planning.",
  keywords: [
    "AI tutor",
    "study companion",
    "spaced repetition",
    "flashcards",
    "quiz generator",
    "student productivity",
    "RAG study notes",
  ],
  authors: [{ name: "Nova AI" }],
};

export const viewport: Viewport = {
  themeColor: "#05060b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#05060b] text-foreground font-sans relative selection:bg-cyan-500/20 selection:text-cyan-300">
        <GrainOverlay />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
