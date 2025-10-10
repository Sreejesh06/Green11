import type { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

export function getLucideIcon(name: string): LucideIcon {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  if (icon) {
    return icon;
  }

  return Icons.Sparkles;
}
