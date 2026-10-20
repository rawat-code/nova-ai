import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200",
          "focus-visible:outline-none focus-visible:border-cyan-400/60 focus-visible:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-cyan-400/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-rose-500/70 focus-visible:border-rose-500 focus-visible:ring-rose-500/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
