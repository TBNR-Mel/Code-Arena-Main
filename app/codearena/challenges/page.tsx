"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XPDisplay } from "@/components/xp-display"
import { getUserProgress, getTodaysDailyChallenge, isDailyChallengeCompleted } from "@/lib/storage"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Mock challenge data
const challenges = [
  {
    id: 1,
    title: "Return the Sum of Two Numbers",
    description: "Create a function that takes two numbers as arguments and returns their sum.",
    difficulty: "Very easy",
    tags: ["geometry", "maths", "numbers"],
    language: "javascript",
  },
  {
    id: 2,
    title: "Area of a Triangle",
    description: "Write a function that takes the base and height of a triangle and return its area.",
    difficulty: "Very easy",
    tags: ["geometry", "maths", "numbers"],
    language: "javascript",
  },
  {
    id: 3,
    title: "Convert Minutes into Seconds",
    description: "Write a function that takes an integer minutes and converts it to seconds.",
    difficulty: "Very easy",
    tags: ["maths", "numbers"],
    language: "javascript",
  },
  {
    id: 4,
    title: "Find the Maximum Number in an Array",
    description: "Create a function that finds and returns the maximum number in a given array.",
    difficulty: "Easy",
    tags: ["arrays", "maths"],
    language: "java",
  },
  {
    id: 5,
    title: "Check if a String is a Palindrome",
    description: "Write a function that checks if a given string is a palindrome.",
    difficulty: "Medium",
    tags: ["strings", "logic"],
    language: "python",
  },
  {
    id: 6,
    title: "Factorial of a Number",
    description: "Compute the factorial of a given number.",
    difficulty: "Easy",
    tags: ["maths", "recursion"],
    language: "java",
  },
  {
    id: 7,
    title: "Fibonacci Sequence",
    description: "Generate the Fibonacci sequence up to a given number.",
    difficulty: "Medium",
    tags: ["maths", "sequences"],
    language: "javascript",
  },
  {
    id: 8,
    title: "Sort an Array",
    description: "Implement a function to sort an array in ascending order.",
    difficulty: "Medium",
    tags: ["arrays", "sorting"],
    language: "python",
  },
  {
    id: 9,
    title: "Binary Search",
    description: "Implement binary search on a sorted array.",
    difficulty: "Hard",
    tags: ["arrays", "searching"],
    language: "java",
  },
  {
    id: 10,
    title: "Count Vowels in a String",
    description: "Count the number of vowels in a given string.",
    difficulty: "Very easy",
    tags: ["strings"],
    language: "javascript",
  },
]

export default function ChallengesPage() {
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([])
  const [dailyChallenge, setDailyChallenge] = useState<any>(null)
  const [isDailyCompleted, setIsDailyCompleted] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [selectedDifficulty, setSelectedDifficulty] = useState("very-easy")
  const [filteredChallenges, setFilteredChallenges] = useState(challenges)

  useEffect(() => {
    const storedLanguage =
      typeof window !== "undefined" ? localStorage.getItem("challengeLanguage") || "javascript" : "javascript"
    const storedDifficulty =
      typeof window !== "undefined" ? localStorage.getItem("challengeDifficulty") || "very-easy" : "very-easy"

    setSelectedLanguage(storedLanguage)
    setSelectedDifficulty(storedDifficulty)

    const progress = getUserProgress()
    setCompletedChallenges(progress.completedChallenges)

    const daily = getTodaysDailyChallenge()
    const dailyCompleted = isDailyChallengeCompleted()
    setDailyChallenge(daily)
    setIsDailyCompleted(dailyCompleted)

    const handleProgressUpdate = () => {
      const updatedProgress = getUserProgress()
      setCompletedChallenges(updatedProgress.completedChallenges)
      const updatedDailyCompleted = isDailyChallengeCompleted()
      setIsDailyCompleted(updatedDailyCompleted)
    }

    window.addEventListener("progressUpdate", handleProgressUpdate)
    return () => window.removeEventListener("progressUpdate", handleProgressUpdate)
  }, [])

  useEffect(() => {
    const filtered = challenges.filter((challenge) => {
      const langMatch = selectedLanguage === "all" || challenge.language.toLowerCase() === selectedLanguage
      const diffMatch =
        selectedDifficulty === "all" || challenge.difficulty.toLowerCase() === selectedDifficulty.replace("-", " ")
      return langMatch && diffMatch
    })
    setFilteredChallenges(filtered)
  }, [selectedLanguage, selectedDifficulty])

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
                  <SelectItem value="all">All</SelectItem>
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
                  <SelectItem value="all">All</SelectItem>
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
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 sm:gap-8">
            {dailyChallenge && (
              <Link href="/codearena/daily/challenge">
                <div className="border-b border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-6 sm:p-8 hover:from-yellow-500/20 hover:to-orange-500/20 transition-all cursor-pointer flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-yellow-400 font-mono">{dailyChallenge.title}</h3>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded font-semibold">
                      DAILY CHALLENGE
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        dailyChallenge.difficulty === "hard"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {dailyChallenge.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-auto flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-yellow-400 font-semibold">{dailyChallenge.difficulty}</span>
                      {isDailyCompleted && <span className="text-sm text-green-400 font-medium">Completed Today</span>}
                    </div>
                    <ChevronRight className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>
              </Link>
            )}

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
