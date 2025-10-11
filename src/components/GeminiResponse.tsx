import { cn } from "@/lib/utils";
import { Fragment, type JSX } from "react";
import type { ReactNode } from "react";

interface GeminiResponseProps {
  text: string;
  className?: string;
}

type Segment =
  | { type: "paragraph"; value: string }
  | { type: "ordered"; items: string[] }
  | { type: "unordered"; items: string[] };

function renderInline(value: string): ReactNode {
  const tokens = value.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return tokens.map((token, index) => {
    if (!token) {
      return null;
    }

    if (/^\*\*[^*]+\*\*$/.test(token)) {
      const content = token.slice(2, -2).trim();
      return (
        <strong key={`strong-${index}`} className="text-foreground">
          {content}
        </strong>
      );
    }

    if (/^\*[^*]+\*$/.test(token)) {
      const content = token.slice(1, -1).trim();
      return (
        <em key={`em-${index}`} className="text-foreground">
          {content}
        </em>
      );
    }

    if (/^`[^`]+`$/.test(token)) {
      const content = token.slice(1, -1);
      return (
        <code key={`code-${index}`} className="rounded bg-muted px-1 py-0.5 text-xs">
          {content}
        </code>
      );
    }

    return <Fragment key={`text-${index}`}>{token}</Fragment>;
  });
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

function stripMarker(value: string, pattern: RegExp): string {
  return value.replace(pattern, "").trim();
}

function asParagraph(value: string): Segment {
  const condensed = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");

  return { type: "paragraph", value: condensed };
}

function parseSegment(value: string): Segment {
  const normalized = normalizeNewlines(value);
  const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);

  if (!lines.length) {
    return { type: "paragraph", value: "" };
  }

  const ordered = lines.every((line) => /^\d+\.\s+/.test(line));
  if (ordered) {
    return {
      type: "ordered",
      items: lines.map((line) => stripMarker(line, /^\d+\.\s+/)),
    };
  }

  const unordered = lines.every((line) => /^[-*]\s+/.test(line));
  if (unordered) {
    return {
      type: "unordered",
      items: lines.map((line) => stripMarker(line, /^[-*]\s+/)),
    };
  }

  return asParagraph(normalized);
}

function parseResponse(text: string): Segment[] {
  const normalized = normalizeNewlines(text);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n{2,}/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map(parseSegment);
}

export function GeminiResponse({ text, className }: GeminiResponseProps): JSX.Element | null {
  const segments = parseResponse(text);

  if (!segments.length) {
    return null;
  }

  return (
    <div className={cn("space-y-3 leading-relaxed", className)}>
      {segments.map((segment, index) => {
        if (segment.type === "ordered") {
          return (
            <ol key={`ordered-${index}`} className="list-decimal space-y-1 pl-5 text-foreground">
              {segment.items.map((item, itemIndex) => (
                <li key={`ordered-${index}-${itemIndex}`}>
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          );
        }

        if (segment.type === "unordered") {
          return (
            <ul key={`unordered-${index}`} className="list-disc space-y-1 pl-5 text-foreground">
              {segment.items.map((item, itemIndex) => (
                <li key={`unordered-${index}-${itemIndex}`}>
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="text-foreground">
            {renderInline(segment.value)}
          </p>
        );
      })}
    </div>
  );
}
