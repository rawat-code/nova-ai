"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Cpu,
  Brain,
  Bell,
  Shield,
  CheckCircle2,
  Sparkles,
  Sliders,
  Volume2,
  Download,
  RotateCcw,
  LogOut,
  Save,
  Check,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { signOutUser } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";

type SettingsTab = "profile" | "ai" | "study" | "notifications" | "security";

interface UserSettingsState {
  fullName: string;
  gradeLevel: "high_school" | "college" | "graduate";
  learningStyle: "socratic" | "visual" | "deep_dive" | "simplified";
  primaryMajor: string;
  dailyGoalMinutes: number;
  aiModel: string;
  socraticDepth: "strict" | "balanced" | "direct";
  strictVaultGrounding: boolean;
  citationFootnotes: boolean;
  katexMathRendering: boolean;
  dailyCardTarget: number;
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  autoStartBreaks: boolean;
  soundEffects: boolean;
  dailyReminders: boolean;
  reviewAlerts: boolean;
  ambientSoundPreset: string;
}

const DEFAULT_SETTINGS: UserSettingsState = {
  fullName: "Scholar",
  gradeLevel: "college",
  learningStyle: "socratic",
  primaryMajor: "Computer Science & Artificial Intelligence",
  dailyGoalMinutes: 45,
  aiModel: "gemini-3.5-flash-lite",
  socraticDepth: "balanced",
  strictVaultGrounding: true,
  citationFootnotes: true,
  katexMathRendering: true,
  dailyCardTarget: 20,
  pomodoroWorkMinutes: 25,
  pomodoroBreakMinutes: 5,
  autoStartBreaks: false,
  soundEffects: true,
  dailyReminders: true,
  reviewAlerts: true,
  ambientSoundPreset: "rain",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [settings, setSettings] = useState<UserSettingsState>(DEFAULT_SETTINGS);
  const [savedStatus, setSavedStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [userEmail, setUserEmail] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const router = useRouter();

  // Load saved settings from localStorage and server API
  useEffect(() => {
    // 1. LocalStorage
    const local = localStorage.getItem("nova_user_settings");
    if (local) {
      try {
        setSettings((prev) => ({ ...prev, ...JSON.parse(local) }));
      } catch (e) {
        console.warn("Failed to parse local settings:", e);
      }
    }

    // 2. Fetch profile from /api/settings
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.email) setUserEmail(data.user.email);
        if (data?.profile) {
          setSettings((prev) => ({
            ...prev,
            fullName: data.profile.full_name || prev.fullName,
            gradeLevel: data.profile.grade_level || prev.gradeLevel,
            learningStyle: data.profile.learning_style || prev.learningStyle,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Save changes handler
  const handleSave = async () => {
    setSavedStatus("saving");

    // Persist to local storage
    localStorage.setItem("nova_user_settings", JSON.stringify(settings));

    // Persist to Supabase via /api/settings
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: settings.fullName,
          grade_level: settings.gradeLevel,
          learning_style: settings.learningStyle,
        }),
      });
    } catch (err) {
      console.warn("Failed to sync settings to cloud:", err);
    }

    setSavedStatus("saved");
    setTimeout(() => setSavedStatus("idle"), 2500);
  };

  // Export scholar data as downloadable JSON
  const handleExportData = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: {
        email: userEmail,
        settings,
      },
      system: {
        version: "Nova AI v0.1.0",
        engine: "Gemini 3.5 Flash-Lite",
        spacedRepetition: "SuperMemo SM-2",
      },
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nova-scholar-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetLearningDNA = () => {
    localStorage.removeItem("nova_user_settings");
    setSettings(DEFAULT_SETTINGS);
    setShowResetConfirm(false);
    handleSave();
  };

  const tabs = [
    { id: "profile", label: "Scholar Profile", icon: User },
    { id: "ai", label: "AI & Tutor Engine", icon: Cpu },
    { id: "study", label: "Study & SM-2", icon: Brain },
    { id: "notifications", label: "Notifications & Audio", icon: Bell },
    { id: "security", label: "Data & Security", icon: Shield },
  ];

  return (
    <div data-lenis-prevent="true" className="space-y-6 pb-20">
      {/* Page Header with Save CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">
              Account & AI Settings
            </h1>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
              Personalization
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Tune your Socratic tutor, spaced repetition pacing, and multi-model AI failover preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={savedStatus === "saving"}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-lg transition-all ${
            savedStatus === "saved"
              ? "bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              : "bg-gradient-to-r from-cyan-400 to-indigo-500 text-[#030914] hover:shadow-[0_0_25px_rgba(0,245,212,0.4)]"
          }`}
        >
          {savedStatus === "saved" ? (
            <>
              <Check className="size-3.5" />
              <span>Saved to Cloud!</span>
            </>
          ) : savedStatus === "saving" ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <RotateCcw className="size-3.5" />
              </motion.div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="size-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div
        data-lenis-prevent="true"
        className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/[0.06] scrollbar-none"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,245,212,0.15)]"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {/* TAB 1: SCHOLAR PROFILE */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Identity Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-white mb-1">Scholar Profile Details</h3>
              <p className="text-xs text-slate-400 mb-4">
                Helps Nova calibrate dialogue vocabulary and question complexity to your exact level.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name / Scholar Moniker
                  </label>
                  <input
                    type="text"
                    value={settings.fullName}
                    onChange={(e) =>
                      setSettings({ ...settings, fullName: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="text"
                    disabled
                    value={userEmail || "Connected through Supabase Auth"}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Primary Academic Field / Focus Major
                  </label>
                  <input
                    type="text"
                    value={settings.primaryMajor}
                    onChange={(e) =>
                      setSettings({ ...settings, primaryMajor: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    placeholder="e.g. Neuroscience, Pre-Med, Computer Science, Economics"
                  />
                </div>
              </div>
            </div>

            {/* Academic Stage Selector */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-white mb-1">Academic Education Stage</h3>
              <p className="text-xs text-slate-400 mb-4">
                Sets the baseline cognitive depth for generated quizzes and study roadmap milestones.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "high_school",
                    title: "High School (AP / IB)",
                    desc: "Focus on foundational mastery, AP exam prep, and step-by-step concepts.",
                  },
                  {
                    id: "college",
                    title: "Undergraduate Scholar",
                    desc: "Rigorous proofs, analytical problem solving, and semester pace.",
                  },
                  {
                    id: "graduate",
                    title: "Graduate / Specialist",
                    desc: "Literature synthesis, deep theoretical frameworks, and research papers.",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        gradeLevel: item.id as UserSettingsState["gradeLevel"],
                      })
                    }
                    className={`flex flex-col text-left rounded-xl p-3.5 border transition-all ${
                      settings.gradeLevel === item.id
                        ? "border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,245,212,0.15)] ring-1 ring-cyan-500/30"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">
                        {item.title}
                      </span>
                      {settings.gradeLevel === item.id && (
                        <CheckCircle2 className="size-3.5 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Target Minutes */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-white">Daily Focus Target</h3>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {settings.dailyGoalMinutes} Minutes / Day
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Sets your daily habit completion bar and streak maintenance requirements.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {[15, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() =>
                      setSettings({ ...settings, dailyGoalMinutes: mins })
                    }
                    className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                      settings.dailyGoalMinutes === mins
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,245,212,0.3)]"
                        : "border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: AI & TUTOR ENGINE */}
        {activeTab === "ai" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Preferred Model */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-white mb-1">AI Primary Reasoning Model</h3>
              <p className="text-xs text-slate-400 mb-4">
                Nova uses an intelligent multi-model failover loop. If the primary quota triggers HTTP 429, it seamlessly transitions to the next available model.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "gemini-3.5-flash-lite",
                    name: "Gemini 3.5 Flash-Lite",
                    badge: "Recommended",
                    desc: "Ultra-fast sub-second token latency with generous daily quotas.",
                  },
                  {
                    id: "gemini-3.5-flash",
                    name: "Gemini 3.5 Flash",
                    badge: "High Reasoning",
                    desc: "Enhanced reasoning depth for intricate multi-step mathematical derivations.",
                  },
                  {
                    id: "gemini-flash-lite-latest",
                    name: "Gemini Flash Lite Latest",
                    badge: "Failover Candidate",
                    desc: "High resilience edge backup model for continuous availability.",
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, aiModel: m.id })}
                    className={`flex flex-col text-left rounded-xl p-3.5 border transition-all ${
                      settings.aiModel === m.id
                        ? "border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,245,212,0.15)] ring-1 ring-cyan-500/30"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{m.name}</span>
                      <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Socratic Persona Pacing */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-white mb-1">Socratic Dialogue Style</h3>
              <p className="text-xs text-slate-400 mb-4">
                Controls how much Nova guides you with questions versus providing direct answers.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "strict",
                    title: "Strict Socratic",
                    desc: "Answers exclusively with counter-questions and hints to force active thinking.",
                  },
                  {
                    id: "balanced",
                    title: "Balanced Mentor",
                    desc: "Provides scaffolding hints first, then explains clearly if you are stuck.",
                  },
                  {
                    id: "direct",
                    title: "Direct Tutor",
                    desc: "Comprehensive immediate answers followed by review quiz checks.",
                  },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        socraticDepth: s.id as UserSettingsState["socraticDepth"],
                      })
                    }
                    className={`flex flex-col text-left rounded-xl p-3.5 border transition-all ${
                      settings.socraticDepth === s.id
                        ? "border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,245,212,0.15)] ring-1 ring-cyan-500/30"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-white">{s.title}</span>
                      {settings.socraticDepth === s.id && (
                        <CheckCircle2 className="size-3.5 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-semibold text-white mb-2">Grounding & Rendering Options</h3>

              {/* Strict Vault Grounding */}
              <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                <div>
                  <p className="text-xs font-medium text-white">Strict Notes Vault Grounding</p>
                  <p className="text-[11px] text-slate-400">
                    Restricts AI tutor responses to only facts found in your uploaded documents.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      strictVaultGrounding: !settings.strictVaultGrounding,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.strictVaultGrounding ? "bg-cyan-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                      settings.strictVaultGrounding ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Citation Footnotes */}
              <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                <div>
                  <p className="text-xs font-medium text-white">Inline Citation Footnotes</p>
                  <p className="text-[11px] text-slate-400">
                    Include clickable `[Page X]` source citations in tutor responses and summaries.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      citationFootnotes: !settings.citationFootnotes,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.citationFootnotes ? "bg-cyan-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                      settings.citationFootnotes ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* KaTeX Math Rendering */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-medium text-white">LaTeX Mathematical Formatting</p>
                  <p className="text-[11px] text-slate-400">
                    Renders scientific formulas and equations with KaTeX typography.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      katexMathRendering: !settings.katexMathRendering,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.katexMathRendering ? "bg-cyan-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                      settings.katexMathRendering ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: STUDY & SM-2 */}
        {activeTab === "study" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Daily Card Review Target */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-white">Daily Review Card Quota</h3>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  {settings.dailyCardTarget} Cards / Day
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Target number of SM-2 flashcards queued each morning for spaced repetition.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {[10, 20, 30, 50, 75].map((target) => (
                  <button
                    key={target}
                    type="button"
                    onClick={() =>
                      setSettings({ ...settings, dailyCardTarget: target })
                    }
                    className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                      settings.dailyCardTarget === target
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,245,212,0.3)]"
                        : "border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    {target} cards
                  </button>
                ))}
              </div>
            </div>

            {/* Pomodoro Timer Configuration */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-white mb-1">Focus Sanctuary Interval Pacing</h3>
              <p className="text-xs text-slate-400 mb-4">
                Customize your Pomodoro work blocks and recovery intervals.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Deep Focus Block Length
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[25, 45, 50].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() =>
                          setSettings({ ...settings, pomodoroWorkMinutes: mins })
                        }
                        className={`rounded-xl py-2 text-xs font-medium transition-all ${
                          settings.pomodoroWorkMinutes === mins
                            ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,245,212,0.3)]"
                            : "border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white"
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Restorative Short Break
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 15].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() =>
                          setSettings({ ...settings, pomodoroBreakMinutes: mins })
                        }
                        className={`rounded-xl py-2 text-xs font-medium transition-all ${
                          settings.pomodoroBreakMinutes === mins
                            ? "bg-emerald-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                            : "border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white"
                        }`}
                      >
                        {mins} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Auto start breaks */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.06]">
                <div>
                  <p className="text-xs font-medium text-white">Auto-Start Break Timers</p>
                  <p className="text-[11px] text-slate-400">
                    Automatically transition to break soundscapes when a study block ends.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      autoStartBreaks: !settings.autoStartBreaks,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoStartBreaks ? "bg-cyan-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                      settings.autoStartBreaks ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: NOTIFICATIONS & AUDIO */}
        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Audio & Sound Effects */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-semibold text-white mb-2">Soundscapes & Haptic Feedback</h3>

              <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                <div>
                  <p className="text-xs font-medium text-white">Interactive Audio Effects</p>
                  <p className="text-[11px] text-slate-400">
                    Subtle acoustic feedback on card flips, correct quiz answers, and timer chimes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, soundEffects: !settings.soundEffects })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.soundEffects ? "bg-cyan-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                      settings.soundEffects ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Default Ambient Focus Soundscape
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "silent", label: "Silent Sanctuary" },
                    { id: "rain", label: "Rainfall & Thunder" },
                    { id: "waves", label: "Alpha Waves" },
                    { id: "white_noise", label: "White Noise" },
                  ].map((snd) => (
                    <button
                      key={snd.id}
                      type="button"
                      onClick={() =>
                        setSettings({ ...settings, ambientSoundPreset: snd.id })
                      }
                      className={`rounded-xl p-3 text-left border transition-all ${
                        settings.ambientSoundPreset === snd.id
                          ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-300 font-semibold"
                          : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
                      }`}
                    >
                      <Volume2 className="size-3.5 mb-1 text-cyan-400" />
                      <p className="text-xs">{snd.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification Alerts */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-semibold text-white mb-2">Study Reminders & Prompts</h3>

              <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                <div>
                  <p className="text-xs font-medium text-white">Daily Streak Reminders</p>
                  <p className="text-[11px] text-slate-400">
                    Header badge alerts when your cognitive streak is at risk of expiring.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      dailyReminders: !settings.dailyReminders,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.dailyReminders ? "bg-cyan-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                      settings.dailyReminders ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-medium text-white">SM-2 Due Queue Alerts</p>
                  <p className="text-[11px] text-slate-400">
                    Notifies when pending flashcards reach optimal forgetting curves.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      reviewAlerts: !settings.reviewAlerts,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.reviewAlerts ? "bg-cyan-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                      settings.reviewAlerts ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: DATA & SECURITY */}
        {activeTab === "security" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Export Data */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-white mb-1">Scholar Data Portability</h3>
              <p className="text-xs text-slate-400 mb-4">
                Export all your study history, custom flashcard decks, and configuration into an open JSON format.
              </p>

              <button
                type="button"
                onClick={handleExportData}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-white hover:bg-white/[0.08] hover:border-cyan-400/40 transition-all shadow-sm"
              >
                <Download className="size-4 text-cyan-400" />
                <span>Export Study Archive (.json)</span>
              </button>
            </div>

            {/* Cloud Session Information */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-white mb-1">Active Cloud Session</h3>
              <p className="text-xs text-slate-400 mb-3">
                Protected by Supabase Row-Level Security (RLS) policies and encrypted auth tokens.
              </p>

              <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <Shield className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Authenticated Session</p>
                    <p className="text-[11px] text-slate-400">{userEmail || "Connected"}</p>
                  </div>
                </div>

                <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">
                  Active
                </Badge>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={async () => {
                    await signOutUser();
                    router.push("/login");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
                >
                  <LogOut className="size-3.5" />
                  <span>Sign Out of Current Session</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.02] p-5 sm:p-6 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="size-4 text-rose-400" />
                <h3 className="text-sm font-semibold text-white">Danger Zone</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Reset your local study cache, Pomodoro records, and custom settings back to initial defaults.
              </p>

              {showResetConfirm ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 space-y-2">
                  <p className="text-xs font-semibold text-rose-200">
                    Are you sure? This will restore all default preferences.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetLearningDNA}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
                    >
                      Yes, Reset Everything
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 hover:border-rose-500/40 hover:text-rose-300 transition-colors"
                >
                  Reset Settings to Default
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
