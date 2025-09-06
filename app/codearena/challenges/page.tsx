"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XPDisplay } from "@/components/xp-display"
import { ChevronLeft, ChevronRight, Calendar, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface Challenge {
  id: number
  title: string
  description: string
  difficulty: string
  tags: string[]
  language: string
}

interface DailyChallenge {
  id: string
  challenge_id: number
  assigned_date: string
  completed: boolean
  challenges: Challenge
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null)
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        await Promise.all([fetchChallenges(), fetchDailyChallenge(), fetchUserProgress(user.id)])
      } else {
        // If no user, just fetch challenges
        await fetchChallenges()
      }
      setLoading(false)
    }

    checkUser()
  }, [])

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase.from("challenges").select("*").order("id")

      if (error) throw error
      setChallenges(data || [])
    } catch (error) {
      console.error("Error fetching challenges:", error)
    }
  }

  const fetchDailyChallenge = async () => {
    try {
      const response = await fetch("/api/daily-challenge")
      if (response.ok) {
        const { dailyChallenge } = await response.json()
        setDailyChallenge(dailyChallenge)
      }
    } catch (error) {
      console.error("Error fetching daily challenge:", error)
    }
  }

  const fetchUserProgress = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("user_progress").select("challenge_id").eq("user_id", userId)

      if (error) throw error
      const completed = data?.map((p) => p.challenge_id) || []
      setCompletedChallenges(completed)
    } catch (error) {
      console.error("Error fetching user progress:", error)
    }
  }

  useEffect(() => {
    const filtered = challenges.filter((challenge) => {
      const langMatch = selectedLanguage === "all" || challenge.language.toLowerCase() === selectedLanguage
      const diffMatch =
        selectedDifficulty === "all" || challenge.difficulty.toLowerCase() === selectedDifficulty.replace("-", " ")
      // Exclude daily challenge from main list
      const notDailyChallenge = !dailyChallenge || challenge.id !== dailyChallenge.challenge_id
      return langMatch && diffMatch && notDailyChallenge
    })
    setFilteredChallenges(filtered)
  }, [selectedLanguage, selectedDifficulty, challenges, dailyChallenge])

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
      {/* Header */}
      <header className="flex items-center justify-between p-4 py-4 pr-4 pl-2 md:p-4 border-border border-b">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center hover:text-foreground/25 active:text-foreground/30 transition-colors duration-200"
          >
            <ChevronLeft className="h-8 w-8 sm:h-7 sm:w-7" />
            <span>Home</span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <XPDisplay />
        </div>
      </header>

      <div className="flex flex-1 flex-col sm:flex-row">
        {/* Filters */}
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
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger className="w-full bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="very-easy">Very easy</SelectItem>
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
            {!user && (
              <Link href="/auth/login">
                <Button>Sign In to Track Progress</Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 sm:gap-8">
            {user && dailyChallenge && (
              <Link href={`/codearena/challenge/${dailyChallenge.challenge_id}`}>
                <div className="border-b border-border p-6 sm:p-8 hover:bg-accent/40 transition-colors cursor-pointer flex flex-col h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-blue-500">Daily Challenge</span>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{dailyChallenge.challenges.title}</h3>
                  <p className="text-muted-foreground text-base mb-4">{dailyChallenge.challenges.description}</p>
                  <div className="flex gap-2 mb-4">
                    {dailyChallenge.challenges.tags.map((tag) => (
                      <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{dailyChallenge.challenges.difficulty}</span>
                      {dailyChallenge.completed && (
                        <span className="text-sm text-green-400 font-medium">Completed</span>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            )}

            {/* Regular Challenges */}
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
                      {challenge.tags.map((tag) => (
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
