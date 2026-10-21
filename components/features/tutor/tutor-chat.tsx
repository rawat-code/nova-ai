"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageContent } from "./message-content";
import { ModeSelector } from "./mode-selector";
import { ConversationSidebar, type ConversationSummary } from "./conversation-sidebar";
import { TUTOR_MODES, type TutorMode } from "@/lib/ai/modes";
import {
  Send,
  Square,
  Sparkles,
  Bot,
  User,
  PanelLeft,
  AlertCircle,
  FileText,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatMessageItem {
  id: string;
  role: "user" | "model";
  content: string;
  mode?: TutorMode;
  citations?: Array<{ title: string; page?: number }>;
  createdAt: Date;
}

const SAMPLE_PROMPTS: Record<TutorMode, string[]> = {
  explain: [
    "Explain how public-key cryptography works using an analogy.",
    "Why does time dilation occur in special relativity? Keep it simple.",
    "Explain the electron transport chain like an assembly line.",
  ],
  deep: [
    "Derive the Schrödinger time-independent wave equation from de Broglie's hypothesis.",
    "Explain the mathematical mechanics behind the attention mechanism in Transformers.",
    "Derive the Euler-Lagrange equations from the principle of least action.",
  ],
  socratic: [
    "I don't understand why a negative times a negative equals a positive.",
    "Why does water expand when it freezes unlike most other liquids?",
    "How does the central limit theorem guarantee normality for sample means?",
  ],
  exam: [
    "Test my understanding of the Krebs cycle with a 5-mark question and rubric.",
    "Give me an exam question on dynamic programming versus divide-and-conquer.",
    "Evaluate my explanation: 'Enzymes lower the Gibbs free energy of a reaction.'",
  ],
};

export function TutorChat() {
  const [mode, setMode] = useState<TutorMode>("socratic");
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [conversations, setConversations] = useState<ConversationSummary[]>([
    {
      id: "demo-conv-1",
      title: "Thermodynamic Entropy & Free Energy",
      mode: "socratic",
      updated_at: "2026-10-21T09:00:00.000Z",
    },
    {
      id: "demo-conv-2",
      title: "Navier-Stokes Derivation",
      mode: "deep",
      updated_at: "2026-10-21T08:00:00.000Z",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messageSeqRef = useRef(0);
  const streamAccumulatorRef = useRef("");

  // Auto-scroll to bottom as messages stream in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isStreaming) return;

    setErrorMessage(null);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const nextSeq = ++messageSeqRef.current;
    const userMessageId = `user-msg-${nextSeq}`;
    const assistantMessageId = `model-msg-${nextSeq}`;

    const newMessages: ChatMessageItem[] = [
      ...messages,
      {
        id: userMessageId,
        role: "user",
        content: prompt,
        createdAt: new Date(),
      },
    ];

    setMessages(newMessages);

    // Prepare assistant placeholder message
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "model",
        content: "",
        mode,
        createdAt: new Date(),
      },
    ]);

    setIsStreaming(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          mode,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response stream returned by server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      streamAccumulatorRef.current = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const dataStr = trimmed.slice(6).trim();

          if (dataStr === "[DONE]") {
            break;
          }

          try {
            const dataObj = JSON.parse(dataStr);
            if (dataObj.error) {
              throw new Error(dataObj.error);
            }
            if (dataObj.text) {
              streamAccumulatorRef.current += dataObj.text;
              const currentText = streamAccumulatorRef.current;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: currentText }
                    : msg
                )
              );
            }
          } catch {
            // Ignore non-json chunks
          }
        }
      }

      const finalAccumulated = streamAccumulatorRef.current;
      // If conversation is new, update conversation list title
      if (!conversationId && finalAccumulated) {
        const newConvId = `conv-${++messageSeqRef.current}`;
        setConversationId(newConvId);
        setConversations((prev) => [
          {
            id: newConvId,
            title: prompt.slice(0, 40) + (prompt.length > 40 ? "..." : ""),
            mode,
            updated_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (err: unknown) {
      if (abortController.signal.aborted) {
        // User aborted intentionally
      } else {
        const errMsg = err instanceof Error ? err.message : "Error streaming response";
        setErrorMessage(errMsg);
        // Remove empty assistant placeholder if failed completely
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantMessageId || m.content.length > 0)
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const handleNewConversation = () => {
    handleStopStreaming();
    setConversationId(undefined);
    setMessages([]);
    setErrorMessage(null);
  };

  const handleSelectConversation = (id: string) => {
    handleStopStreaming();
    setConversationId(id);
    const conv = conversations.find((c) => c.id === id);
    if (conv) {
      setMode(conv.mode);
      setMessages([
        {
          id: `loaded-1`,
          role: "user",
          content: `Reviewing: ${conv.title}`,
          createdAt: new Date(),
        },
        {
          id: `loaded-2`,
          role: "model",
          content: `Welcome back to this session on **${conv.title}**. Where would you like to pick up?`,
          mode: conv.mode,
          createdAt: new Date(),
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeModeConfig = TUTOR_MODES[mode];

  return (
    <div className="flex h-[calc(100vh-8.5rem)] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#060813] shadow-2xl">
      {/* Conversation History Drawer */}
      <ConversationSidebar
        conversations={conversations}
        activeId={conversationId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Pane */}
      <div className="flex flex-1 flex-col min-w-0 h-full relative">
        {/* Chat Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#070916]/80 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
              aria-label="Toggle Conversation History"
            >
              <PanelLeft className="size-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 p-0.5">
                <div className="flex size-full items-center justify-center rounded-[6px] bg-[#070914]">
                  <Sparkles className="size-3.5 text-cyan-300" />
                </div>
              </div>
              <div>
                <span className="font-display text-sm font-semibold text-white">Nova AI Tutor</span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                  {activeModeConfig.badge}
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switcher Pills */}
          <ModeSelector currentMode={mode} onSelectMode={setMode} disabled={isStreaming} />
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-6">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[360px] text-center max-w-xl mx-auto my-auto py-10">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_30px_rgba(0,245,212,0.25)] mb-4">
                <Sparkles className="size-7" />
              </div>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                {activeModeConfig.name} Mode
              </span>
              <h2 className="font-display mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                How can Nova help you study today?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {activeModeConfig.description}
              </p>

              {/* Sample Prompts */}
              <div className="mt-8 grid grid-cols-1 gap-2.5 w-full text-left">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                  Suggested Prompts for this Mode:
                </span>
                {SAMPLE_PROMPTS[mode].map((promptText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(promptText)}
                    className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs text-slate-300 transition-all hover:border-cyan-500/30 hover:bg-white/[0.05] hover:text-white"
                  >
                    <span>{promptText}</span>
                    <Send className="size-3 text-cyan-400 opacity-60 ml-2 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Message List */
            messages.map((msg) => {
              const isUser = msg.role === "user";

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 sm:gap-4 max-w-3xl",
                    isUser ? "ml-auto justify-end" : "mr-auto justify-start"
                  )}
                >
                  {!isUser && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-[#0c1228] shadow-[0_0_15px_rgba(0,245,212,0.2)]">
                      <Bot className="size-4 text-cyan-300" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "rounded-2xl p-4 sm:p-5 shadow-lg",
                      isUser
                        ? "bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-indigo-600/20 border border-cyan-500/30 text-white max-w-[85%] sm:max-w-[75%]"
                        : "bg-[#080d1e]/90 border border-white/10 text-slate-100 w-full"
                    )}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/[0.06] text-xs">
                        <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                          <Sparkles className="size-3 text-cyan-400" />
                          <span>Nova</span>
                          {msg.mode && (
                            <span className="text-[10px] text-slate-400 font-mono font-normal">
                              • {TUTOR_MODES[msg.mode]?.name || msg.mode}
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}

                    {isUser ? (
                      <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                        {msg.content}
                      </p>
                    ) : (
                      <>
                        {msg.content ? (
                          <MessageContent content={msg.content} />
                        ) : (
                          <div className="flex items-center gap-1.5 py-1 text-slate-400 text-xs font-mono">
                            <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
                            <span>Formulating pedagogical response...</span>
                          </div>
                        )}

                        {/* Citations block if grounded */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-wrap gap-2 text-xs">
                            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                              <FileText className="size-3 text-indigo-400" /> Grounded in notes:
                            </span>
                            {msg.citations.map((cite, i) => (
                              <span
                                key={i}
                                className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-mono text-indigo-300"
                              >
                                {cite.title} {cite.page ? `(Pg. ${cite.page})` : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {isUser && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
                      <User className="size-4 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mx-4 mb-2 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => handleSendMessage()}
              className="flex items-center gap-1 font-semibold text-red-300 hover:text-white"
            >
              <RefreshCw className="size-3" /> Retry
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-white/[0.08] bg-[#070914]/90 backdrop-blur-xl">
          <div className="relative mx-auto max-w-4xl">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Ask Nova in ${activeModeConfig.name} mode... (Enter to send, Shift+Enter for newline)`}
              disabled={isStreaming}
              className="w-full resize-none rounded-2xl border border-white/15 bg-white/[0.03] px-4 py-3.5 pr-24 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/[0.05] focus:shadow-[0_0_25px_rgba(0,245,212,0.15)] disabled:opacity-50"
            />

            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStopStreaming}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/30 transition shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  title="Stop generating"
                >
                  <Square className="size-3 text-red-300 fill-red-300" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!input.trim()}
                  onClick={() => handleSendMessage()}
                  className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 text-[#030914] shadow-[0_0_20px_rgba(0,245,212,0.35)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,245,212,0.6)] disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none"
                  aria-label="Send message"
                >
                  <Send className="size-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 max-w-4xl mx-auto px-1">
            <span>
              Tip: Supports LaTeX (<code className="text-cyan-400">$E=mc^2$</code>) &amp; syntax highlighting
            </span>
            <span className="font-mono">{input.length} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
}
