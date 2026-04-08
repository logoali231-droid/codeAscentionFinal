"use client"

import * as React from "react"

export function useToast() {
  const toast = ({ title, description, variant }: { title: string; description?: string; variant?: "default" | "destructive" }) => {
    console.log(`TOAST: [${variant || 'default'}] ${title}: ${description || ''}`);
    // Minimal mock for execution, usually part of shadcn
    alert(`${title}${description ? ': ' + description : ''}`);
  };

  return { toast };
}
