"use client";

import { useEffect, useState } from "react";
import { CornerRightUp } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils";

interface AIInputWithLoadingProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  loadingDuration?: number;
  thinkingDuration?: number;
  onSubmit?: (value: string) => void | Promise<void>;
  className?: string;
  autoAnimate?: boolean;
}

export function AIInputWithLoading({
  id = "ai-input-with-loading",
  placeholder = "Ask me anything!",
  minHeight = 56,
  maxHeight = 200,
  loadingDuration = 3000,
  thinkingDuration = 1000,
  onSubmit,
  className,
  autoAnimate = false,
}: AIInputWithLoadingProps) {
  const [inputValue, setInputValue] = useState("");
  const [submitted, setSubmitted] = useState(autoAnimate);
  const [isAnimating, setIsAnimating] = useState(autoAnimate);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight, maxHeight });

  useEffect(() => {
    if (!autoAnimate) {
      return;
    }

    setIsAnimating(true);
  }, [autoAnimate]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const runAnimation = () => {
      if (!isAnimating) {
        return;
      }
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, thinkingDuration);
      }, loadingDuration);
    };

    if (isAnimating) {
      runAnimation();
    }

    return () => clearTimeout(timeoutId);
  }, [isAnimating, loadingDuration, thinkingDuration]);

  const handleSubmit = async () => {
    if (!inputValue.trim() || submitted) {
      return;
    }

    setSubmitted(true);
    await onSubmit?.(inputValue);
    setInputValue("");
    adjustHeight(true);

    setTimeout(() => {
      setSubmitted(false);
    }, loadingDuration);
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="mx-auto flex w-full max-w-xl flex-col items-start gap-2">
        <div className="relative w-full max-w-xl">
          <Textarea
            id={id}
            placeholder={placeholder}
            className={cn(
              "w-full max-w-xl rounded-3xl border-none bg-black/5 px-6 py-4 text-black placeholder:text-black/70",
              "ring-offset-0 transition focus-visible:ring-2 focus-visible:ring-black/30 dark:bg-white/5 dark:text-white dark:placeholder:text-white/70 dark:focus-visible:ring-white/30",
              "resize-none leading-[1.2]",
              `min-h-[${minHeight}px]`
            )}
            ref={textareaRef}
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              adjustHeight();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
            disabled={submitted}
          />
          <button
            type="button"
            onClick={handleSubmit}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-1 py-1",
              submitted ? "bg-transparent" : "bg-black/5 dark:bg-white/5"
            )}
            disabled={submitted}
          >
            {submitted ? (
              <div
                className="h-4 w-4 animate-spin rounded-sm bg-black transition duration-700 dark:bg-white"
                style={{ animationDuration: "3s" }}
              />
            ) : (
              <CornerRightUp
                className={cn(
                  "h-4 w-4 transition-opacity text-black dark:text-white",
                  inputValue ? "opacity-100" : "opacity-30"
                )}
              />
            )}
          </button>
        </div>
        <p className="mx-auto h-4 pl-4 text-xs text-black/70 dark:text-white/70">
          {submitted ? "AI is thinking..." : "Ready to submit!"}
        </p>
      </div>
    </div>
  );
}

export default AIInputWithLoading;
