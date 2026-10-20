import React from "react";
import { Badge } from "@/components/ui/badge";
import { Key, User } from "lucide-react";

export default function SettingsPlaceholderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white tracking-tight">
          Settings & Preferences
        </h2>
        <p className="text-xs text-slate-400">
          Manage your learning DNA, API configurations, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              <User className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Scholar Profile</h3>
              <p className="text-[11px] text-slate-400">Personalize grade level & study pacing</p>
            </div>
          </div>
          <Badge variant="secondary" size="sm">Connected via Supabase Auth</Badge>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <Key className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Engine Configuration</h3>
              <p className="text-[11px] text-slate-400">Gemini 2.5 Flash • Text-Embedding-004</p>
            </div>
          </div>
          <Badge variant="default" size="sm">Provider Active</Badge>
        </div>
      </div>
    </div>
  );
}
