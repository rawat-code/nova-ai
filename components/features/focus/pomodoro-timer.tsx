"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Flame,
  CheckCircle2,
  Loader2,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  soundscapeEngine,
  type SoundscapeType,
} from "./ambient-soundscape";

interface PomodoroTimerProps {
  onSessionLogged?: (session: { duration_minutes: number; mode: string }) => void;
  streakCount?: number;
  todayMinutes?: number;
}

type TimerMode = "work" | "short_break" | "long_break";

const MODE_CONFIGS: Record<TimerMode, { label: string; durationMinutes: number; color: string; badge: string }> = {
  work: {
    label: "Deep Focus",
    durationMinutes: 25,
    color: "from-cyan-400 via-sky-400 to-indigo-500",
    badge: "border-cyan-500/30 text-cyan-300 bg-cyan-500/10",
  },
  short_break: {
    label: "Short Respite",
    durationMinutes: 5,
    color: "from-emerald-400 to-teal-500",
    badge: "border-emerald-500/30 text-emerald-300 bg-emerald-500/10",
  },
  long_break: {
    label: "Deep Restoration",
    durationMinutes: 15,
    color: "from-purple-400 to-pink-500",
    badge: "border-purple-500/30 text-purple-300 bg-purple-500/10",
  },
};

export function PomodoroTimer({
  onSessionLogged,
  streakCount = 0,
  todayMinutes = 0,
}: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(MODE_CONFIGS.work.durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundscape, setSoundscape] = useState<SoundscapeType>("silent");
  const soundVolume = 0.35;
  const [isLogging, setIsLogging] = useState(false);
  const [lastLoggedSession, setLastLoggedSession] = useState<{
    minutes: number;
    time: string;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const totalDuration = MODE_CONFIGS[mode].durationMinutes * 60;
  const progressPercent = Math.max(0, Math.min(100, ((totalDuration - timeLeft) / totalDuration) * 100));

  // Handle mode switch
  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_CONFIGS[newMode].durationMinutes * 60);
  };

  // Soundscape toggle
  useEffect(() => {
    if (isRunning && soundscape !== "silent") {
      soundscapeEngine.playSoundscape(soundscape, soundVolume);
    } else {
      soundscapeEngine.stopCurrent();
    }
    return () => {
      soundscapeEngine.stopCurrent();
    };
  }, [isRunning, soundscape, soundVolume]);

  // Log session to Supabase
  const logCompletedSession = useCallback(
    async (durationMins: number) => {
      setIsLogging(true);
      try {
        const res = await fetch("/api/study-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            duration_minutes: durationMins,
            mode: "pomodoro",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.session && onSessionLogged) {
            onSessionLogged(data.session);
          }
          setLastLoggedSession({
            minutes: durationMins,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
        }
      } catch (err) {
        console.error("Failed to log focus session:", err);
      } finally {
        setIsLogging(false);
      }
    },
    [onSessionLogged]
  );

  // Countdown timer loop
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          soundscapeEngine.playChime();

          if (mode === "work") {
            logCompletedSession(MODE_CONFIGS.work.durationMinutes);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, mode, logCompletedSession]);

  // Ambient animated canvas: Breathing cosmic stars
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speed: number;
      hue: number;
    }> = [];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.3 + 0.1,
        hue: Math.random() > 0.5 ? 174 : 240, // Cyan or Indigo
      });
    }

    let t = 0;
    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speed * (isRunning ? 1.5 : 0.8);
        if (p.y < 0) p.y = height;

        const pulseAlpha = Math.sin(t + p.x) * 0.2 + p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${Math.max(0.1, Math.min(0.9, pulseAlpha))})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 65%, 0.5)`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isRunning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // SVG circular ring metrics
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="relative mx-auto flex max-w-2xl flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#080b16]/90 p-8 shadow-2xl backdrop-blur-2xl">
      {/* Background Animated Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full opacity-60"
      />

      {/* Mode Navigation Tabs */}
      <div className="relative z-10 flex gap-2 rounded-2xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-md">
        {(["work", "short_break", "long_break"] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
              mode === m
                ? "bg-white/15 text-white shadow-md backdrop-blur-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {MODE_CONFIGS[m].label}
          </button>
        ))}
      </div>

      {/* Circular Timer Display */}
      <div className="relative my-8 flex items-center justify-center">
        <svg className="size-72 -rotate-90 transform" viewBox="0 0 300 300">
          {/* Base track */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            className="stroke-white/[0.06]"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Dynamic Progress Indicator */}
          <circle
            cx="150"
            cy="150"
            r={radius}
            stroke="url(#timerGradient)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500 ease-linear"
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f5d4" />
              <stop offset="50%" stopColor="#00b4d8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Countdown Info */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${MODE_CONFIGS[mode].badge}`}>
            {MODE_CONFIGS[mode].label}
          </span>
          <span className="font-display my-1 text-5xl font-bold tracking-tight text-white tabular-nums sm:text-6xl drop-shadow-[0_0_25px_rgba(0,245,212,0.3)]">
            {formattedTime}
          </span>
          <span className="text-xs text-slate-400">
            {isRunning ? "Deep immersion active" : "Ready when you are"}
          </span>
        </div>
      </div>

      {/* Main Play / Pause / Reset Controls */}
      <div className="relative z-10 flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setIsRunning(false);
            setTimeLeft(MODE_CONFIGS[mode].durationMinutes * 60);
          }}
          className="size-11 rounded-2xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          title="Reset Timer"
        >
          <RotateCcw className="size-4" />
        </Button>

        <Button
          onClick={() => setIsRunning((prev) => !prev)}
          className="h-12 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 px-8 text-sm font-bold text-black shadow-[0_0_30px_rgba(0,245,212,0.35)] hover:opacity-95"
        >
          {isRunning ? (
            <>
              <Pause className="mr-2 size-4 fill-black" /> Pause Session
            </>
          ) : (
            <>
              <Play className="mr-2 size-4 fill-black" /> Begin Focus
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setIsRunning(false);
            if (mode === "work") {
              logCompletedSession(MODE_CONFIGS.work.durationMinutes);
            }
            switchMode(mode === "work" ? "short_break" : "work");
          }}
          className="size-11 rounded-2xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          title="Skip to next block"
        >
          <SkipForward className="size-4" />
        </Button>
      </div>

      {/* Ambient Soundscapes Selector */}
      <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 mr-2 font-medium text-slate-300">
          <Headphones className="size-3.5 text-cyan-400" />
          <span>Soundscape:</span>
        </div>

        {[
          { id: "silent", label: "Mute" },
          { id: "space", label: "Deep Cosmos" },
          { id: "rain", label: "Gentle Rain" },
          { id: "whitenoise", label: "White Noise" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setSoundscape(s.id as SoundscapeType)}
            className={`rounded-lg px-2.5 py-1 transition-colors ${
              soundscape === s.id
                ? "border border-cyan-500/40 bg-cyan-500/20 text-cyan-300"
                : "border border-white/5 bg-white/[0.02] hover:bg-white/10 hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Session Logging Notification */}
      {isLogging && (
        <div className="relative z-10 mt-4 flex items-center gap-2 text-xs text-cyan-300">
          <Loader2 className="size-3.5 animate-spin" />
          Syncing focus session to database...
        </div>
      )}

      {lastLoggedSession && !isLogging && (
        <div className="relative z-10 mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-1.5 text-xs text-emerald-300 animate-in fade-in-0 duration-300">
          <CheckCircle2 className="size-3.5 text-emerald-400" />
          <span>
            Logged {lastLoggedSession.minutes}m focus session at {lastLoggedSession.time}
          </span>
        </div>
      )}

      {/* Focus Session Status Bar */}
      <div className="relative z-10 mt-6 grid w-full grid-cols-2 gap-3 border-t border-white/5 pt-4 text-center">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
          <span className="text-[11px] text-slate-400">Today&apos;s Focus</span>
          <p className="font-display mt-0.5 text-base font-bold text-white">
            {todayMinutes} mins
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
          <span className="text-[11px] text-slate-400">Study Streak</span>
          <p className="font-display mt-0.5 flex items-center justify-center gap-1 text-base font-bold text-amber-400">
            <Flame className="size-4 fill-amber-400" />
            {streakCount} {streakCount === 1 ? "Day" : "Days"}
          </p>
        </div>
      </div>
    </div>
  );
}
