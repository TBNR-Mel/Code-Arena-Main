"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XPDisplay } from "@/components/xp-display"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Challenge } from "@/lib/types"

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()

    const initializeData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      // Fetch challenges from API
      try {
        const response = await fetch("/api/challenges")
        if (response.ok) {
          const challengesData = await response.json()
          setChallenges(challengesData)
          setFilteredChallenges(challengesData)
        }
      } catch (error) {
        console.error("Error fetching challenges:", error)
      }

      // Get user's completed challenges if authenticated
      if (user) {
        const { data: submissions } = await supabase
          .from("user_submissions")
          .select("challenge_id")
          .eq("user_id", user.id)
          .eq("status", "passed")

        if (submissions) {
          setCompletedChallenges(submissions.map((s) => s.challenge_id))
        }
      }
    }

    initializeData()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
        initializeData()
      } else {
        setUser(null)
        setCompletedChallenges([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const filtered = challenges.filter((challenge) => {
      const langMatch = selectedLanguage === "all" || true // All challenges support JavaScript for now
      const diffMatch = selectedDifficulty === "all" || challenge.difficulty === selectedDifficulty
      return langMatch && diffMatch
    })
    setFilteredChallenges(filtered)
  }, [challenges, selectedLanguage, selectedDifficulty])

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value)
  }

  const handleDifficultyChange = (value: string) => {
    setSelectedDifficulty(value)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-border border-b mb-">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center hover:text-foreground/25 active:text-foreground/30 transition-colors duration-200"
          >
            <ChevronLeft className="h-7 w-7" />
            <span>Home</span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/codearena/leaderboard"
            className="text-purple-500 hover:text-purple-400 font-semibold transition-colors"
          >
            Leaderboard
          </Link>
          <Link
            href="/codearena/streaks"
            className="text-orange-500 hover:text-orange-400 font-semibold transition-colors"
          >
            Streaks
          </Link>
          <XPDisplay />
        </div>
      </header>

      <div className="flex flex-1 flex-col sm:flex-row">
        {/* Filters (Sidebar on desktop, stacked on mobile) */}
        <aside className="w-full sm:w-80 border-b sm:border-b-0 sm:border-r border-border p-4 sm:p-8 flex flex-col gap-8 min-h-fit sm:min-h-full">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Filters</h2>
            <div className="flex flex-col gap-4">
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger className="w-full bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-6 sm:px-12 sm:py-10">
          <div className="flex items-center justify-between px-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Challenges</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 sm:gap-8">
            {filteredChallenges.map((challenge) => {
              const isCompleted = completedChallenges.includes(challenge.id)
              return (
                <Link key={challenge.id} href={`/codearena/challenge/${challenge.id}`}>
                  <div className="border-b border-border p-6 sm:p-8 hover:bg-accent/40 transition-colors cursor-pointer flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold">{challenge.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-base mb-4">{challenge.description}</p>
                    <div className="flex gap-2 mb-4">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {challenge.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          challenge.difficulty === "easy"
                            ? "bg-green-500/20 text-green-400"
                            : challenge.difficulty === "medium"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {challenge.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-auto flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{challenge.difficulty}</span>
                        {isCompleted && <span className="text-sm text-green-400 font-medium">Completed</span>}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
