"use client"

import { useUserProgress } from "@/hooks/use-local-storage"

export function XPDisplay() {
  const { xp } = useUserProgress()

  return <span className="text-foreground">{xp} XP</span>
}
