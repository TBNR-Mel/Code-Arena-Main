"use client"

import { useEffect, useState } from "react"
import { getUserProgress } from "@/lib/storage"

export function XPDisplay() {
  const [xp, setXP] = useState(0)
  const [level, setLevel] = useState(1)

  useEffect(() => {
    const progress = getUserProgress()
    setXP(progress.xp)
    setLevel(progress.level)

    // Listen for storage changes to update XP in real-time
    const handleStorageChange = () => {
      const updatedProgress = getUserProgress()
      setXP(updatedProgress.xp)
      setLevel(updatedProgress.level)
    }

    window.addEventListener("storage", handleStorageChange)
    // Custom event for same-tab updates
    window.addEventListener("progressUpdate", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("progressUpdate", handleStorageChange)
    }
  }, [])

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="text-sm font-medium">Level {level}</div>
        <div className="text-xs text-muted-foreground">{xp} XP</div>
      </div>
      <div className="w-16 bg-muted rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((xp % 100) / 100) * 100}%` }}
        />
      </div>
    </div>
  )
}
