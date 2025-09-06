"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XPDisplay } from "@/components/xp-display"
import { getUserProgress } from "@/lib/storage"
import { ChevronLeft, Flame, Calendar, Target, Award, TrendingUp } from "lucide-react"

export default function StreaksPage() {
  const [userProgress, setUserProgress] = useState<any>(null)
  const [streakCalendar, setStreakCalendar] = useState<any[]>([])

  useEffect(() => {
    const progress = getUserProgress()
    setUserProgress(progress)

    // Generate streak calendar for the last 30 days
    const calendar = generateStreakCalendar(progress)
    setStreakCalendar(calendar)

    const handleProgressUpdate = () => {
      const updatedProgress = getUserProgress()
      setUserProgress(updatedProgress)
      const updatedCalendar = generateStreakCalendar(updatedProgress)
      setStreakCalendar(updatedCalendar)
    }

    window.addEventListener("progressUpdate", handleProgressUpdate)
    return () => window.removeEventListener("progressUpdate", handleProgressUpdate)
  }, [])

  const generateStreakCalendar = (progress: any) => {
    const calendar = []
    const today = new Date()
    const lastCompletedDate = progress.lastCompletedDate ? new Date(progress.lastCompletedDate) : null

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)

      const dateString = date.toDateString()
      const isCompleted =
        lastCompletedDate &&
        (dateString === lastCompletedDate.toDateString() ||
          (progress.currentStreak > 1 &&
            date <= lastCompletedDate &&
            date >= new Date(lastCompletedDate.getTime() - (progress.currentStreak - 1) * 86400000)))

      calendar.push({
        date: date,
        dateString: dateString,
        isCompleted: isCompleted,
        isToday: dateString === today.toDateString(),
      })
    }

    return calendar
  }

  const getStreakMilestones = () => {
    return [
      { days: 3, title: "Getting Started", reward: "50 Bonus XP", achieved: userProgress?.longestStreak >= 3 },
      { days: 7, title: "Week Warrior", reward: "2x XP Multiplier", achieved: userProgress?.longestStreak >= 7 },
      { days: 14, title: "Fortnight Fighter", reward: "200 Bonus XP", achieved: userProgress?.longestStreak >= 14 },
      { days: 30, title: "Monthly Master", reward: "3x XP Multiplier", achieved: userProgress?.longestStreak >= 30 },
      { days: 50, title: "Streak Legend", reward: "500 Bonus XP", achieved: userProgress?.longestStreak >= 50 },
      {
        days: 100,
        title: "Century Champion",
        reward: "5x XP Multiplier",
        achieved: userProgress?.longestStreak >= 100,
      },
    ]
  }

  const getStreakStatus = () => {
    if (!userProgress?.lastCompletedDate) return "Start your streak today!"

    const today = new Date().toDateString()
    const lastCompleted = userProgress.lastCompletedDate
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    if (lastCompleted === today) {
      return "Great! You've completed today's challenge"
    } else if (lastCompleted === yesterday) {
      return "Complete a challenge today to continue your streak"
    } else {
      return "Your streak has ended. Start a new one today!"
    }
  }

  if (!userProgress) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading Streak Data...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-border border-b">
        <div className="flex items-center gap-4">
          <Link
            href="/codearena/challenges"
            className="flex items-center hover:text-foreground/75 transition-colors duration-200"
          >
            <ChevronLeft className="h-7 w-7" />
            <span>Challenges</span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <XPDisplay />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Streak Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl sm:text-4xl font-bold">Daily Streaks</h1>
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-muted-foreground text-lg">Keep your coding momentum going every day!</p>
        </div>

        {/* Current Streak Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="bg-orange-500/20 p-3 rounded-full w-fit mx-auto mb-4">
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-orange-500 mb-2">{userProgress.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
            <div className="text-xs text-muted-foreground mt-1">days in a row</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="bg-purple-500/20 p-3 rounded-full w-fit mx-auto mb-4">
              <Target className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-500 mb-2">{userProgress.longestStreak}</div>
            <div className="text-sm text-muted-foreground">Longest Streak</div>
            <div className="text-xs text-muted-foreground mt-1">personal best</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="bg-green-500/20 p-3 rounded-full w-fit mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-500 mb-2">{userProgress.totalXpMultiplier}x</div>
            <div className="text-sm text-muted-foreground">XP Multiplier</div>
            <div className="text-xs text-muted-foreground mt-1">from streak rewards</div>
          </div>
        </div>

        {/* Streak Status */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Today's Status</h2>
          </div>
          <p className="text-muted-foreground mb-4">{getStreakStatus()}</p>
          <div className="flex gap-3">
            <Link href="/codearena/challenges">
              <Button className="bg-blue-600 hover:bg-blue-700">Browse Challenges</Button>
            </Link>
            <Link href="/codearena/daily">
              <Button
                variant="outline"
                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 bg-transparent"
              >
                Daily Challenge
              </Button>
            </Link>
          </div>
        </div>

        {/* Streak Calendar */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Last 30 Days</h2>
          <div className="grid grid-cols-10 gap-2">
            {streakCalendar.map((day, index) => (
              <div
                key={index}
                className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all ${
                  day.isCompleted
                    ? "bg-green-500/20 border-green-500 text-green-400"
                    : day.isToday
                      ? "bg-blue-500/20 border-blue-500 text-blue-400"
                      : "bg-muted border-border text-muted-foreground"
                }`}
                title={`${day.date.toLocaleDateString()} ${day.isCompleted ? "- Completed" : ""}`}
              >
                {day.date.getDate()}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border-2 border-green-500"></div>
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/20 border-2 border-blue-500"></div>
              <span className="text-muted-foreground">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted border-2 border-border"></div>
              <span className="text-muted-foreground">Missed</span>
            </div>
          </div>
        </div>

        {/* Streak Milestones */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Award className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">Streak Milestones</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getStreakMilestones().map((milestone, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all ${
                  milestone.achieved
                    ? "border-green-500 bg-green-500/10"
                    : userProgress.currentStreak >= milestone.days * 0.8
                      ? "border-yellow-500 bg-yellow-500/10"
                      : "border-border bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{milestone.title}</h3>
                  <div className="flex items-center gap-2">
                    {milestone.achieved ? (
                      <Award className="h-5 w-5 text-green-500" />
                    ) : (
                      <span className="text-sm text-muted-foreground">{milestone.days} days</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{milestone.reward}</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      milestone.achieved ? "bg-green-500" : "bg-yellow-500"
                    }`}
                    style={{
                      width: `${Math.min((userProgress.longestStreak / milestone.days) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
