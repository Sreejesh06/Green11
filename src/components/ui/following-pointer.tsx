import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { Navigation } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FollowerPointerCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string | React.ReactNode;
}

export const FollowerPointerCard: React.FC<FollowerPointerCardProps> = ({
  children,
  className,
  title,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isInside, setIsInside] = useState(false);

  useEffect(() => {
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect());
    }
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (rect) {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      x.set(event.clientX - rect.left + scrollX);
      y.set(event.clientY - rect.top + scrollY);
    }
  };

  const handleMouseLeave = () => setIsInside(false);
  const handleMouseEnter = () => setIsInside(true);

  return (
    <div
      ref={ref}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      style={{ cursor: "none" }}
      className={cn("relative", className)}
    >
      <AnimatePresence>
        {isInside && <FollowPointer x={x} y={y} title={title} />}
      </AnimatePresence>
      {children}
    </div>
  );
};

interface FollowPointerProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  title?: string | React.ReactNode;
}

export const FollowPointer: React.FC<FollowPointerProps> = ({ x, y, title }) => {
  const colors = [
    "rgb(14 165 233)",
    "rgb(115 115 115)",
    "rgb(20 184 166)",
    "rgb(34 197 94)",
    "rgb(59 130 246)",
    "rgb(239 68 68)",
    "rgb(234 179 8)",
  ];

  const backgroundColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      className="absolute z-50 h-4 w-4 rounded-full"
      style={{
        top: y,
        left: x,
        pointerEvents: "none",
      }}
      initial={{ scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      <Navigation className="h-6 w-6 -translate-x-[12px] -translate-y-[10px] rotate-[-70deg] text-sky-500 drop-shadow" />
      <motion.div
        style={{ backgroundColor }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="min-w-max rounded-full px-2 py-2 text-xs text-white shadow-lg"
      >
        {title || "William Shakespeare"}
      </motion.div>
    </motion.div>
  );
};
