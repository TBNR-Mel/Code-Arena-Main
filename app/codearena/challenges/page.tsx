"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XPDisplay } from "@/components/xp-display"
import { getUserProgress, getDailyChallenges, isDailyChallenge } from "@/lib/storage"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    language: "javascript",
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
  {
    id: 11,
    title: "Reverse a String",
    description: "Write a function that takes a string and returns it reversed.",
    difficulty: "Easy",
    tags: ["strings"],
    language: "javascript",
  },
  {
    id: 12,
    title: "Check for Prime Number",
    description: "Write a function that checks if a given number is prime.",
    difficulty: "Medium",
    tags: ["maths", "numbers"],
    language: "javascript",
  },
  {
    id: 13,
    title: "Sum of Array Elements",
    description: "Write a function that returns the sum of all numbers in an array.",
    difficulty: "Easy",
    tags: ["arrays", "maths"],
    language: "javascript",
  },
  {
    id: 14,
    title: "Check for Anagram",
    description: "Write a function that checks if two strings are anagrams of each other.",
    difficulty: "Medium",
    tags: ["strings", "logic"],
    language: "python",
  },
  {
    id: 15,
    title: "Find First Non-Repeated Character",
    description: "Write a function that returns the first non-repeated character in a string.",
    difficulty: "Medium",
    tags: ["strings", "logic"],
    language: "python",
  },
  {
    id: 16,
    title: "Power of a Number",
    description: "Write a function that calculates the power of a number (base raised to exponent).",
    difficulty: "Easy",
    tags: ["maths", "numbers"],
    language: "python",
  },
  {
    id: 17,
    title: "Hello World",
    description: "Write a program that outputs 'Hello, World!' to the console.",
    difficulty: "Very easy",
    tags: ["basics", "output"],
    language: "c++",
  },
  {
    id: 18,
    title: "Simple Calculator",
    description: "Create a basic calculator that can perform addition, subtraction, multiplication, and division.",
    difficulty: "Easy",
    tags: ["maths", "input"],
    language: "c++",
  },
  {
    id: 19,
    title: "Array Manipulation",
    description: "Write a program that finds the largest and smallest elements in an array.",
    difficulty: "Medium",
    tags: ["arrays", "logic"],
    language: "c++",
  },
]

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
    const filtered = challenges.filter((challenge) => {
      const langMatch = selectedLanguage === "all" || challenge.language.toLowerCase() === selectedLanguage
      const diffMatch =
        selectedDifficulty === "all" || challenge.difficulty.toLowerCase() === selectedDifficulty.replace("-", " ")
      return langMatch && diffMatch
    })

    const dailyChallengeIds = dailyChallenges.map((dc) => dc.id)
    const dailyChallengesFromList = challenges.filter((c) => dailyChallengeIds.includes(c.id))
    const nonDailyChallenges = filtered.filter((c) => !dailyChallengeIds.includes(c.id))

    // Put daily challenges first, then regular filtered challenges
    setFilteredChallenges([...dailyChallengesFromList, ...nonDailyChallenges])
  }, [selectedLanguage, selectedDifficulty, dailyChallenges])

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
