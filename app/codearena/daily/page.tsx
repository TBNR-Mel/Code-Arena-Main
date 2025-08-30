"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XPDisplay } from "@/components/xp-display"
import { getTodaysDailyChallenge, isDailyChallengeCompleted, getUserProgress } from "@/lib/storage"
import { ChevronLeft, Calendar, Trophy, Zap } from "lucide-react"

export default function DailyChallengeePage() {
  const [dailyChallenge, setDailyChallenge] = useState<any>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [userProgress, setUserProgress] = useState<any>(null)

  useEffect(() => {
    const challenge = getTodaysDailyChallenge()
    const completed = isDailyChallengeCompleted()
    const progress = getUserProgress()

    setDailyChallenge(challenge)
    setIsCompleted(completed)
    setUserProgress(progress)

    const handleProgressUpdate = () => {
      const updatedCompleted = isDailyChallengeCompleted()
      const updatedProgress = getUserProgress()
      setIsCompleted(updatedCompleted)
      setUserProgress(updatedProgress)
    }

    window.addEventListener("progressUpdate", handleProgressUpdate)
    return () => window.removeEventListener("progressUpdate", handleProgressUpdate)
  }, [])

  if (!dailyChallenge) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No Daily Challenge Available</h2>
          <p className="text-muted-foreground">Check back tomorrow for a new challenge!</p>
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
        {/* Daily Challenge Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl sm:text-4xl font-bold">Daily Challenge</h1>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-muted-foreground text-lg">Complete today's challenge for bonus XP!</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-yellow-500 font-semibold">{dailyChallenge.xpReward} XP Reward</span>
          </div>
        </div>

        {/* Challenge Card */}
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{dailyChallenge.title}</h2>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    dailyChallenge.difficulty === "hard"
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {dailyChallenge.difficulty.charAt(0).toUpperCase() + dailyChallenge.difficulty.slice(1)}
                </span>
                {isCompleted && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
                    Completed Today
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Today's Date</div>
              <div className="font-semibold">{new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <p className="text-muted-foreground text-lg mb-6 leading-relaxed">{dailyChallenge.description}</p>

          {/* Challenge Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-background border border-border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">{dailyChallenge.xpReward}</div>
              <div className="text-sm text-muted-foreground">XP Reward</div>
            </div>
            <div className="bg-background border border-border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{userProgress?.currentStreak || 0}</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
            <div className="bg-background border border-border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">{userProgress?.level || 1}</div>
              <div className="text-sm text-muted-foreground">Your Level</div>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <Link href={`/codearena/daily/challenge`}>
              <Button
                size="lg"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 text-lg font-semibold"
                disabled={isCompleted}
              >
                {isCompleted ? "Completed Today" : "Start Daily Challenge"}
              </Button>
            </Link>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Daily Challenge Tips</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              Daily challenges are harder than regular challenges but offer much more XP
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              Complete daily challenges to maintain your streak and unlock rewards
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              New daily challenges are available every 24 hours
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-1">•</span>
              Your XP multiplier from streak rewards applies to daily challenges too!
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
