"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Check, Copy } from "lucide-react";

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  return (
    <div className="prose prose-invert prose-cyan max-w-none text-sm sm:text-base leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const isInline = !match && !codeString.includes("\n");

            if (isInline) {
              return (
                <code
                  className="rounded-md bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs text-cyan-300 border border-white/[0.06]"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return <CodeBlock language={match ? match[1] : "text"} code={codeString} />;
          },
          p({ children }) {
            return <p className="mb-3 last:mb-0">{children}</p>;
          },
          ul({ children }) {
            return <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>;
          },
          h1({ children }) {
            return <h1 className="font-display mb-3 text-xl font-bold text-white tracking-tight">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="font-display mb-2 mt-4 text-lg font-bold text-cyan-200 tracking-tight">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="font-display mb-2 mt-3 text-base font-semibold text-slate-200">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-3 border-l-2 border-cyan-400/60 bg-cyan-500/[0.04] py-1.5 pl-4 text-slate-300 italic rounded-r-lg">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-[#070914]">
                <table className="w-full text-left text-xs sm:text-sm">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return <th className="border-b border-white/10 bg-white/[0.04] px-4 py-2 font-semibold text-cyan-300">{children}</th>;
          },
          td({ children }) {
            return <td className="border-b border-white/[0.06] px-4 py-2 text-slate-300">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-white/10 bg-[#070a16] shadow-lg">
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs">
        <span className="font-mono text-xs font-medium text-slate-400 uppercase tracking-wider">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="size-3 text-cyan-400" />
              <span className="text-[11px] text-cyan-300">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3 text-slate-400" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-xs sm:text-sm leading-relaxed text-slate-200">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
