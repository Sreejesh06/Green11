"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cx } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { LoaderCircle, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getGeminiEndpoint } from "@/lib/gemini";

interface OrbProps {
  dimension?: string;
  className?: string;
  tones?: {
    base?: string;
    accent1?: string;
    accent2?: string;
    accent3?: string;
  };
  spinDuration?: number;
}

const orbStyles = `
  @property --angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
  }

  .color-orb {
    display: grid;
    grid-template-areas: "stack";
    overflow: hidden;
    border-radius: 50%;
    position: relative;
    transform: scale(1.1);
  }

  .color-orb::before,
  .color-orb::after {
    content: "";
    display: block;
    grid-area: stack;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    transform: translateZ(0);
  }

  .color-orb::before {
    background:
      conic-gradient(
        from calc(var(--angle) * 2) at 25% 70%,
        var(--accent3),
        transparent 20% 80%,
        var(--accent3)
      ),
      conic-gradient(
        from calc(var(--angle) * 2) at 45% 75%,
        var(--accent2),
        transparent 30% 60%,
        var(--accent2)
      ),
      conic-gradient(
        from calc(var(--angle) * -3) at 80% 20%,
        var(--accent1),
        transparent 40% 60%,
        var(--accent1)
      ),
      conic-gradient(
        from calc(var(--angle) * 2) at 15% 5%,
        var(--accent2),
        transparent 10% 90%,
        var(--accent2)
      ),
      conic-gradient(
        from calc(var(--angle) * 1) at 20% 80%,
        var(--accent1),
        transparent 10% 90%,
        var(--accent1)
      ),
      conic-gradient(
        from calc(var(--angle) * -2) at 85% 10%,
        var(--accent3),
        transparent 20% 80%,
        var(--accent3)
      );
    box-shadow: inset var(--base) 0 0 var(--shadow) calc(var(--shadow) * 0.2);
    filter: blur(var(--blur)) contrast(var(--contrast));
    animation: spin var(--spin-duration) linear infinite;
  }

  .color-orb::after {
    background-image: radial-gradient(
      circle at center,
      var(--base) var(--dot),
      transparent var(--dot)
    );
    background-size: calc(var(--dot) * 2) calc(var(--dot) * 2);
    backdrop-filter: blur(calc(var(--blur) * 2)) contrast(calc(var(--contrast) * 2));
    mix-blend-mode: overlay;
  }

  .color-orb[style*="--mask: 0%"]::after {
    mask-image: none;
  }

  .color-orb:not([style*="--mask: 0%"] )::after {
    mask-image: radial-gradient(black var(--mask), transparent 75%);
  }

  @keyframes spin {
    to {
      --angle: 360deg;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .color-orb::before {
      animation: none;
    }
  }
`;

const SPEED_FACTOR = 1;
const FORM_WIDTH = 360;
const BASE_FORM_HEIGHT = 220;

const colorOrbTonesFallback = {
  base: "oklch(95% 0.02 264.695)",
  accent1: "oklch(75% 0.15 350)",
  accent2: "oklch(80% 0.12 200)",
  accent3: "oklch(78% 0.14 280)",
};

const ColorOrb: React.FC<OrbProps> = ({
  dimension = "192px",
  className,
  tones,
  spinDuration = 20,
}) => {
  const palette = { ...colorOrbTonesFallback, ...tones };
  const dimValue = Number.parseInt(dimension.replace("px", ""), 10) || 0;

  const blurStrength =
    dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4);
  const contrastStrength =
    dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5);
  const pixelDot = dimValue < 50 ? Math.max(dimValue * 0.004, 0.05) : Math.max(dimValue * 0.008, 0.1);
  const shadowRange = dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2);
  const maskRadius = dimValue < 30 ? "0%" : dimValue < 50 ? "5%" : dimValue < 100 ? "15%" : "25%";
  const adjustedContrast =
    dimValue < 30 ? 1.1 : dimValue < 50 ? Math.max(contrastStrength * 1.2, 1.3) : contrastStrength;

  return (
    <>
      <style>{orbStyles}</style>
      <div
        className={cn("color-orb", className)}
        style={{
          width: dimension,
          height: dimension,
          "--base": palette.base,
          "--accent1": palette.accent1,
          "--accent2": palette.accent2,
          "--accent3": palette.accent3,
          "--spin-duration": `${spinDuration}s`,
          "--blur": `${blurStrength}px`,
          "--contrast": adjustedContrast,
          "--dot": `${pixelDot}px`,
          "--shadow": `${shadowRange}px`,
          "--mask": maskRadius,
        } as React.CSSProperties}
      />
    </>
  );
};

interface FormContextValue {
  showForm: boolean;
  triggerOpen: () => void;
  triggerClose: () => void;
  submitPrompt: (message: string) => Promise<void>;
  isSubmitting: boolean;
  responseText: string | null;
  errorMessage: string | null;
}

const FormContext = React.createContext<FormContextValue | undefined>(undefined);

const useFormContext = () => {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error("MorphPanel components must be used within the FormContext provider");
  }
  return context;
};

interface MorphPanelProps {
  className?: string;
  promptContext?: string;
  placeholder?: string;
}

export const MorphPanel: React.FC<MorphPanelProps> = ({
  className,
  promptContext,
  placeholder = "Ask me anything...",
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [responseText, setResponseText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerClose = useCallback(() => {
    setShowForm(false);
    textareaRef.current?.blur();
  }, []);

  const triggerOpen = useCallback(() => {
    setShowForm(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node) && showForm) {
        triggerClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showForm, triggerClose]);

  const submitPrompt = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) {
        return;
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setErrorMessage("Gemini API key is missing. Set VITE_GEMINI_API_KEY in your .env file.");
        return;
      }

      try {
        setIsSubmitting(true);
        setErrorMessage(null);
        setResponseText(null);

        const prompt = promptContext
          ? `${promptContext}\n\nUser question: ${trimmed}`
          : trimmed;

        const { endpoint } = await getGeminiEndpoint(apiKey);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorPayload = await response.json().catch(() => null);
          const messageText = errorPayload?.error?.message ?? `Gemini request failed (${response.status})`;
          throw new Error(messageText);
        }

        const data = await response.json();
        const textResponse: string | undefined = data?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text ?? "")
          .join("")
          .trim();

        if (!textResponse) {
          throw new Error("Gemini did not return any content. Try rephrasing your question.");
        }

        setResponseText(textResponse);
      } catch (error) {
        setResponseText(null);
        setErrorMessage(error instanceof Error ? error.message : "Failed to reach Gemini.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [promptContext]
  );

  const contextValue = useMemo(
    () => ({
      showForm,
      triggerOpen,
      triggerClose,
      submitPrompt,
      isSubmitting,
      responseText,
      errorMessage,
    }),
    [showForm, triggerOpen, triggerClose, submitPrompt, isSubmitting, responseText, errorMessage]
  );

  const calculatedHeight = showForm
    ? responseText || errorMessage
      ? BASE_FORM_HEIGHT + 160
      : BASE_FORM_HEIGHT
    : 44;

  return (
    <div className={cn("w-full max-w-[360px]", className)}>
      <motion.div
        ref={wrapperRef}
        data-panel
        className="relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-background/95 shadow-lg backdrop-blur"
        initial={false}
        animate={{
          width: "100%",
          height: calculatedHeight,
          borderRadius: showForm ? 16 : 999,
        }}
        transition={{
          type: "spring",
          stiffness: 550 / SPEED_FACTOR,
          damping: 45,
          mass: 0.7,
          delay: showForm ? 0 : 0.08,
        }}
      >
        <FormContext.Provider value={contextValue}>
          <DockBar placeholder={placeholder} />
          <InputForm ref={textareaRef} placeholder={placeholder} />
        </FormContext.Provider>
      </motion.div>
    </div>
  );
};

interface DockBarProps {
  placeholder: string;
}

function DockBar({ placeholder }: DockBarProps) {
  const { showForm, triggerOpen } = useFormContext();

  return (
    <footer className="mt-auto select-none whitespace-nowrap">
      <div className="flex h-[44px] items-center justify-center gap-2 px-3 max-sm:h-10 max-sm:px-2">
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div key="blank" className="h-5 w-5" initial={{ opacity: 0 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} />
            ) : (
              <motion.div
                key="orb"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ColorOrb dimension="24px" tones={{ base: "oklch(22.64% 0 0)" }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          type="button"
          className="flex h-fit flex-1 items-center justify-end gap-2 rounded-full px-2 !py-0.5"
          variant="ghost"
          onClick={triggerOpen}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="truncate text-sm">{placeholder}</span>
        </Button>
      </div>
    </footer>
  );
}

interface InputFormProps {
  placeholder: string;
  onAfterSubmit?: () => void;
}

const InputForm = React.forwardRef<HTMLTextAreaElement, InputFormProps>(({ placeholder, onAfterSubmit }, ref) => {
  const { triggerClose, showForm, submitPrompt, isSubmitting, responseText, errorMessage } = useFormContext();
  const [message, setMessage] = useState("");
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    await submitPrompt(trimmed);
    if (onAfterSubmit) {
      onAfterSubmit();
    }
  };

  const handleKeys = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      triggerClose();
      return;
    }

    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submitButtonRef.current?.click();
    }
  };

  useEffect(() => {
    if (!isSubmitting) {
      setMessage("");
    }
  }, [isSubmitting]);

  return (
    <form
      onSubmit={handleSubmit}
      className="absolute bottom-0 left-0 right-0"
      style={{
        width: "100%",
        pointerEvents: showForm ? "all" : "none",
      }}
    >
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 550 / SPEED_FACTOR, damping: 45, mass: 0.7 }}
            className="flex flex-col gap-3 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="ml-[38px] flex items-center gap-[6px] select-none text-sm font-medium text-foreground">
                AI Input
              </p>
              <button
                type="submit"
                ref={submitButtonRef}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-foreground"
              >
                <KeyHint>⌘</KeyHint>
                <KeyHint className="w-fit">Enter</KeyHint>
              </button>
            </div>
            <textarea
              ref={ref}
              placeholder={placeholder}
              name="message"
              className="h-28 w-full resize-none rounded-md border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeys}
              spellCheck={false}
            />

            <div className="flex items-center justify-between">
              <Button type="submit" size="sm" disabled={isSubmitting} className="rounded-full px-3">
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2 text-xs">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span className="text-xs">Send to Gemini</span>
                )}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={triggerClose}>
                Close
              </Button>
            </div>

            <AnimatePresence>
              {isSubmitting && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs text-primary"
                >
                  Thinking up a sustainable suggestion...
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {errorMessage && !isSubmitting && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {responseText && !isSubmitting && (
                <motion.div
                  key="response"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs text-foreground"
                >
                  {responseText}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            key="orb-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute left-3 top-2"
          >
            <ColorOrb dimension="24px" tones={{ base: "oklch(22.64% 0 0)" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
});

InputForm.displayName = "InputForm";

const KeyHint = ({ children, className }: { children: string; className?: string }) => (
  <kbd
    className={cx(
      "flex h-6 w-fit items-center justify-center rounded-sm border px-[6px] font-sans text-xs text-foreground",
      className
    )}
  >
    {children}
  </kbd>
);

export default MorphPanel;