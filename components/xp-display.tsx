"use client"

import { useEffect, useState } from "react"
import { getUserProgress } from "@/lib/storage"

export function XPDisplay() {
  const [xp, setXP] = useState(0)

  useEffect(() => {
    const progress = getUserProgress()
    setXP(progress.xp)

    // Listen for storage changes to update XP in real-time
    const handleStorageChange = () => {
      const updatedProgress = getUserProgress()
      setXP(updatedProgress.xp)
    }

    window.addEventListener("storage", handleStorageChange)
    // Custom event for same-tab updates
    window.addEventListener("progressUpdate", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("progressUpdate", handleStorageChange)
    }
  }, [])

  return <span className="text-muted-foreground">{xp} XP</span>
}
