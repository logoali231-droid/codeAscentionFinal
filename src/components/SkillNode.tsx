
"use client";

import { motion } from "framer-motion";
import { Check, Star, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SkillNodeProps {
  id: string;
  title: string;
  status: "locked" | "available" | "completed";
  type: "core" | "bonus" | "checkpoint";
  index: number;
}

export function SkillNode({ id, title, status, type, index }: SkillNodeProps) {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  
  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative group">
        {/* Connection line placeholder logic can go in parent, here we just render the node */}
        <div
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 border-4",
            isLocked && "bg-secondary border-border grayscale cursor-not-allowed",
            !isLocked && !isCompleted && "bg-card border-primary glow-blue cursor-pointer hover:scale-105",
            isCompleted && "bg-primary border-accent glow-green cursor-pointer hover:scale-105"
          )}
        >
          {isLocked ? (
            <Lock className="w-8 h-8 text-muted-foreground" />
          ) : isCompleted ? (
            <Check className="w-10 h-10 text-accent" />
          ) : type === "checkpoint" ? (
            <Star className="w-10 h-10 text-primary fill-primary" />
          ) : (
            <div className="w-8 h-8 rounded-md border-2 border-primary/50" />
          )}

          {/* Progress ring for available nodes */}
          {!isLocked && !isCompleted && (
            <svg className="absolute -inset-1 w-22 h-22 transform -rotate-90">
              <circle
                cx="44"
                cy="44"
                r="40"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-primary/20"
              />
              <circle
                cx="44"
                cy="44"
                r="40"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 * 0.4}
                className="text-primary"
              />
            </svg>
          )}
        </div>
      </div>
      <span className={cn(
        "font-headline text-xs font-bold uppercase tracking-widest text-center max-w-[100px]",
        isLocked ? "text-muted-foreground" : "text-foreground"
      )}>
        {title}
      </span>
    </motion.div>
  );

  if (isLocked) {
    return content;
  }

  return (
    <Link href={`/exercise/${id}`}>
      {content}
    </Link>
  );
}
