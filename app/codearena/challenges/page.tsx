"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XPDisplay } from "@/components/xp-display"
import { getUserProgress, getDailyChallenges, isDailyChallenge } from "@/lib/storage"
import { ChevronLeft, ChevronRight, Calendar, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Challenge } from "@/lib/supabase/database.types"

export default function ChallengesPage() {
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([])
  const [dailyChallenges, setDailyChallenges] = useState<
    {
      id: number
      title: string
      difficulty: string
      language: string
    }[]
  >([])
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [selectedDifficulty, setSelectedDifficulty] = useState("very-easy")
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch("/api/challenges")
        const data = await response.json()
        setChallenges(data)
      } catch (error) {
        console.error("Error fetching challenges:", error)
        // Fallback to empty array if API fails
        setChallenges([])
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [])

  useEffect(() => {
    const storedLanguage =
      typeof window !== "undefined" ? localStorage.getItem("challengeLanguage") || "javascript" : "javascript"
    const storedDifficulty =
      typeof window !== "undefined" ? localStorage.getItem("challengeDifficulty") || "very-easy" : "very-easy"

    setSelectedLanguage(storedLanguage)
    setSelectedDifficulty(storedDifficulty)

    const progress = getUserProgress()
    setCompletedChallenges(progress.completedChallenges)

    const dailies = getDailyChallenges()
    setDailyChallenges(dailies)

    const handleProgressUpdate = () => {
      const updatedProgress = getUserProgress()
      setCompletedChallenges(updatedProgress.completedChallenges)
      const updatedDailies = getDailyChallenges()
      setDailyChallenges(updatedDailies)
    }

    window.addEventListener("progressUpdate", handleProgressUpdate)
    return () => window.removeEventListener("progressUpdate", handleProgressUpdate)
  }, [])

  useEffect(() => {
    if (challenges.length === 0) return

    const filtered = challenges.filter((challenge) => {
      const langMatch = selectedLanguage === "all" || challenge.language.toLowerCase() === selectedLanguage
      const diffMatch =
        selectedDifficulty === "all" || challenge.difficulty.toLowerCase() === selectedDifficulty.replace("-", " ")
      return langMatch && diffMatch
    })

    const dailyChallengeIds = dailyChallenges.map((dc) => dc.id)

    let dailyChallengesFromList: Challenge[] = []
    if (selectedLanguage !== "all") {
      dailyChallengesFromList = challenges.filter(
        (c) => dailyChallengeIds.includes(c.id) && c.language.toLowerCase() === selectedLanguage,
      )
    }

    const nonDailyChallenges = filtered.filter((c) => !dailyChallengeIds.includes(c.id))

    // Put daily challenges first (only when specific language selected), then regular filtered challenges
    setFilteredChallenges([...dailyChallengesFromList, ...nonDailyChallenges])
  }, [selectedLanguage, selectedDifficulty, dailyChallenges, challenges])

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value)
    if (typeof window !== "undefined") {
      localStorage.setItem("challengeLanguage", value)
    }
  }

  const handleDifficultyChange = (value: string) => {
    setSelectedDifficulty(value)
    if (typeof window !== "undefined") {
      localStorage.setItem("challengeDifficulty", value)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-lg">Loading challenges...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between p-4 py-4 pr-4 pl-2 md:p-4 border-border border-b">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center hover:text-foreground/25 active:text-foreground/30 transition-colors duration-200"
          >
            <ChevronLeft className="h-8 w-8 sm:h-7 sm:w-7sm:h-7 sm:w-7" />
            <span>Home</span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <XPDisplay />
        </div>
      </header>

      <div className="flex flex-1 flex-col sm:flex-row">
        <aside className="w-full sm:w-80 border-b sm:border-b-0 sm:border-r border-border p-4 sm:p-8 flex flex-col gap-8 min-h-fit sm:min-h-full">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Filters</h2>
            <div className="flex flex-col gap-4">
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="c++">C++</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger className="w-full bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="very-easy">Very easy</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-auto">
            <Link href="/submit-challenge">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Submit Challenge
              </Button>
            </Link>
          </div>
        </aside>

        <main className="flex-1 py-6 sm:px-12 sm:py-10">
          <div className="flex items-center justify-between px-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Challenges</h1>
            <Button>Get Started</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 sm:gap-8">
            {filteredChallenges.map((challenge) => {
              const isCompleted = completedChallenges.includes(challenge.id)
              const isDaily = isDailyChallenge(challenge.id)

              return (
                <Link key={challenge.id} href={`/codearena/challenge/${challenge.id}`}>
                  <div
                    className={`border-b border-border p-6 sm:p-8 hover:bg-accent/40 transition-colors cursor-pointer flex flex-col h-full ${
                      isDaily ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {isDaily && (
                        <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                          <Calendar className="w-3 h-3" />
                          Daily Challenge - {challenge.language.toUpperCase()}
                        </div>
                      )}
                      <h3 className="text-lg sm:text-xl font-semibold">
                        {challenge.concept ? `${challenge.concept}: ${challenge.title}` : challenge.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-base mb-4">{challenge.description}</p>
                    <div className="flex gap-2 mb-4">
                      {challenge.tags?.map((tag) => (
                        <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
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
