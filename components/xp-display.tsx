"use client"

import { useEffect, useState } from "react"
import { Flame } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getUserProgress } from "@/lib/challenges"

export function XPDisplay() {
  const [xp, setXP] = useState(0)
  const [level, setLevel] = useState(1)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const progress = await getUserProgress(user.id)
        if (progress) {
          setXP(progress.total_points)
          setLevel(Math.floor(progress.total_points / 100) + 1)
          setCurrentStreak(progress.current_streak)
        }
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
        getUser()
      } else {
        setUser(null)
        setXP(0)
        setLevel(1)
        setCurrentStreak(0)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center gap-4">
      {currentStreak > 0 && (
        <div className="flex items-center gap-1 text-orange-500">
          <Flame className="h-4 w-4" />
          <span className="text-sm font-medium">{currentStreak}</span>
        </div>
      )}
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
    </div>
  )
}
