"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XPDisplay } from "@/components/xp-display"
import { getUserProgress, getDailyChallenges, isDailyChallenge } from "@/lib/storage"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

const challenges = [
  // JavaScript - Variables & Basic Operations (Concept 1)
  {
    id: 1,
    title: "Declare and Use Variables",
    description:
      "Variables Concept: Learn how to declare variables using let, const, and var. Understand the differences between them.",
    difficulty: "Very easy",
    tags: ["variables", "basics", "syntax"],
    language: "javascript",
    concept: "variables",
  },
  {
    id: 2,
    title: "Variable Assignment and Types",
    description:
      "Variables Concept: Practice assigning different data types to variables and understanding type coercion.",
    difficulty: "Very easy",
    tags: ["variables", "types", "assignment"],
    language: "javascript",
    concept: "variables",
  },
  {
    id: 3,
    title: "Basic Arithmetic with Variables",
    description:
      "Variables Concept: Perform mathematical operations using variables and understand operator precedence.",
    difficulty: "Easy",
    tags: ["variables", "arithmetic", "operators"],
    language: "javascript",
    concept: "variables",
  },
  {
    id: 4,
    title: "Variable Scope Challenge",
    description: "Variables Concept: Understand block scope, function scope, and global scope with practical examples.",
    difficulty: "Easy",
    tags: ["variables", "scope", "functions"],
    language: "javascript",
    concept: "variables",
  },
  {
    id: 5,
    title: "Complex Variable Operations",
    description:
      "Variables Concept: Master advanced variable manipulation including destructuring and spread operators.",
    difficulty: "Medium",
    tags: ["variables", "destructuring", "advanced"],
    language: "javascript",
    concept: "variables",
  },

  // JavaScript - Functions (Concept 2)
  {
    id: 6,
    title: "Create Your First Function",
    description:
      "Functions Concept: Learn how to declare and call functions. Understand function syntax and basic usage.",
    difficulty: "Very easy",
    tags: ["functions", "basics", "syntax"],
    language: "javascript",
    concept: "functions",
  },
  {
    id: 7,
    title: "Function Parameters and Return",
    description: "Functions Concept: Practice using parameters and return statements to create reusable functions.",
    difficulty: "Easy",
    tags: ["functions", "parameters", "return"],
    language: "javascript",
    concept: "functions",
  },
  {
    id: 8,
    title: "Arrow Functions",
    description:
      "Functions Concept: Master arrow function syntax and understand when to use them over regular functions.",
    difficulty: "Easy",
    tags: ["functions", "arrow-functions", "syntax"],
    language: "javascript",
    concept: "functions",
  },
  {
    id: 9,
    title: "Higher-Order Functions",
    description: "Functions Concept: Learn to create and use functions that take other functions as parameters.",
    difficulty: "Medium",
    tags: ["functions", "higher-order", "callbacks"],
    language: "javascript",
    concept: "functions",
  },
  {
    id: 10,
    title: "Function Closures",
    description: "Functions Concept: Understand closures and how functions can access variables from outer scopes.",
    difficulty: "Hard",
    tags: ["functions", "closures", "scope"],
    language: "javascript",
    concept: "functions",
  },

  // JavaScript - Arrays (Concept 3)
  {
    id: 11,
    title: "Array Basics",
    description: "Arrays Concept: Learn how to create arrays, access elements, and understand array indexing.",
    difficulty: "Very easy",
    tags: ["arrays", "basics", "indexing"],
    language: "javascript",
    concept: "arrays",
  },
  {
    id: 12,
    title: "Array Methods - Push, Pop",
    description: "Arrays Concept: Practice using basic array methods to add and remove elements.",
    difficulty: "Easy",
    tags: ["arrays", "methods", "manipulation"],
    language: "javascript",
    concept: "arrays",
  },
  {
    id: 13,
    title: "Array Iteration",
    description: "Arrays Concept: Learn different ways to loop through arrays using for loops and forEach.",
    difficulty: "Easy",
    tags: ["arrays", "iteration", "loops"],
    language: "javascript",
    concept: "arrays",
  },
  {
    id: 14,
    title: "Array Filtering and Mapping",
    description: "Arrays Concept: Master functional array methods like filter, map, and reduce.",
    difficulty: "Medium",
    tags: ["arrays", "functional", "methods"],
    language: "javascript",
    concept: "arrays",
  },
  {
    id: 15,
    title: "Complex Array Algorithms",
    description: "Arrays Concept: Solve advanced array problems involving sorting, searching, and manipulation.",
    difficulty: "Hard",
    tags: ["arrays", "algorithms", "advanced"],
    language: "javascript",
    concept: "arrays",
  },

  // JavaScript - Objects (Concept 4)
  {
    id: 16,
    title: "Object Creation and Properties",
    description:
      "Objects Concept: Learn how to create objects and access their properties using dot and bracket notation.",
    difficulty: "Easy",
    tags: ["objects", "properties", "basics"],
    language: "javascript",
    concept: "objects",
  },
  {
    id: 17,
    title: "Object Methods",
    description: "Objects Concept: Add methods to objects and understand the 'this' keyword in object context.",
    difficulty: "Easy",
    tags: ["objects", "methods", "this"],
    language: "javascript",
    concept: "objects",
  },
  {
    id: 18,
    title: "Object Destructuring",
    description: "Objects Concept: Master object destructuring to extract properties into variables efficiently.",
    difficulty: "Medium",
    tags: ["objects", "destructuring", "syntax"],
    language: "javascript",
    concept: "objects",
  },
  {
    id: 19,
    title: "Nested Objects",
    description: "Objects Concept: Work with complex nested object structures and deep property access.",
    difficulty: "Medium",
    tags: ["objects", "nested", "complex"],
    language: "javascript",
    concept: "objects",
  },
  {
    id: 20,
    title: "Object-Oriented Programming",
    description: "Objects Concept: Implement classes, inheritance, and encapsulation using JavaScript objects.",
    difficulty: "Hard",
    tags: ["objects", "oop", "classes"],
    language: "javascript",
    concept: "objects",
  },

  // Python - Variables & Basic Operations (Concept 1)
  {
    id: 21,
    title: "Python Variables and Types",
    description: "Variables Concept: Learn Python variable declaration and understand dynamic typing.",
    difficulty: "Very easy",
    tags: ["variables", "types", "basics"],
    language: "python",
    concept: "variables",
  },
  {
    id: 22,
    title: "String Operations",
    description: "Variables Concept: Master string manipulation, concatenation, and formatting in Python.",
    difficulty: "Very easy",
    tags: ["strings", "operations", "formatting"],
    language: "python",
    concept: "variables",
  },
  {
    id: 23,
    title: "Number Operations",
    description: "Variables Concept: Work with integers, floats, and mathematical operations in Python.",
    difficulty: "Easy",
    tags: ["numbers", "math", "operations"],
    language: "python",
    concept: "variables",
  },
  {
    id: 24,
    title: "Type Conversion",
    description: "Variables Concept: Learn how to convert between different data types in Python.",
    difficulty: "Easy",
    tags: ["types", "conversion", "casting"],
    language: "python",
    concept: "variables",
  },
  {
    id: 25,
    title: "Advanced Variable Manipulation",
    description: "Variables Concept: Master complex variable operations including unpacking and multiple assignment.",
    difficulty: "Medium",
    tags: ["variables", "unpacking", "advanced"],
    language: "python",
    concept: "variables",
  },

  // Python - Control Flow (Concept 2)
  {
    id: 26,
    title: "If Statements",
    description: "Control Flow Concept: Learn conditional logic using if, elif, and else statements.",
    difficulty: "Very easy",
    tags: ["conditionals", "if", "logic"],
    language: "python",
    concept: "control-flow",
  },
  {
    id: 27,
    title: "For Loops",
    description: "Control Flow Concept: Master for loops and iteration over sequences in Python.",
    difficulty: "Easy",
    tags: ["loops", "for", "iteration"],
    language: "python",
    concept: "control-flow",
  },
  {
    id: 28,
    title: "While Loops",
    description: "Control Flow Concept: Understand while loops and when to use them for repetitive tasks.",
    difficulty: "Easy",
    tags: ["loops", "while", "repetition"],
    language: "python",
    concept: "control-flow",
  },
  {
    id: 29,
    title: "Nested Loops",
    description: "Control Flow Concept: Work with nested loop structures and understand their complexity.",
    difficulty: "Medium",
    tags: ["loops", "nested", "complexity"],
    language: "python",
    concept: "control-flow",
  },
  {
    id: 30,
    title: "Complex Conditional Logic",
    description:
      "Control Flow Concept: Solve problems requiring advanced conditional statements and logical operators.",
    difficulty: "Hard",
    tags: ["conditionals", "logic", "advanced"],
    language: "python",
    concept: "control-flow",
  },

  // Java - Basic Syntax (Concept 1)
  {
    id: 31,
    title: "Hello World in Java",
    description: "Basics Concept: Write your first Java program and understand the basic structure.",
    difficulty: "Very easy",
    tags: ["basics", "syntax", "hello-world"],
    language: "java",
    concept: "basics",
  },
  {
    id: 32,
    title: "Variables and Data Types",
    description: "Basics Concept: Learn Java's strongly-typed system and variable declarations.",
    difficulty: "Very easy",
    tags: ["variables", "types", "declarations"],
    language: "java",
    concept: "basics",
  },
  {
    id: 33,
    title: "Basic Input/Output",
    description: "Basics Concept: Handle user input and output using Scanner and System.out.",
    difficulty: "Easy",
    tags: ["input", "output", "scanner"],
    language: "java",
    concept: "basics",
  },
  {
    id: 34,
    title: "Method Creation",
    description: "Basics Concept: Create and use methods with parameters and return types.",
    difficulty: "Easy",
    tags: ["methods", "functions", "parameters"],
    language: "java",
    concept: "basics",
  },
  {
    id: 35,
    title: "Class Structure",
    description: "Basics Concept: Understand Java classes, objects, and object-oriented principles.",
    difficulty: "Medium",
    tags: ["classes", "objects", "oop"],
    language: "java",
    concept: "basics",
  },

  // C++ - Fundamentals (Concept 1)
  {
    id: 36,
    title: "Hello World in C++",
    description: "Basics Concept: Write your first C++ program and understand compilation.",
    difficulty: "Very easy",
    tags: ["basics", "hello-world", "compilation"],
    language: "c++",
    concept: "basics",
  },
  {
    id: 37,
    title: "Variables and Constants",
    description: "Basics Concept: Learn C++ variable declarations and the const keyword.",
    difficulty: "Very easy",
    tags: ["variables", "constants", "declarations"],
    language: "c++",
    concept: "basics",
  },
  {
    id: 38,
    title: "Basic I/O Operations",
    description: "Basics Concept: Use cin and cout for input and output operations.",
    difficulty: "Easy",
    tags: ["input", "output", "streams"],
    language: "c++",
    concept: "basics",
  },
  {
    id: 39,
    title: "Functions in C++",
    description: "Basics Concept: Create functions with parameters, return types, and function overloading.",
    difficulty: "Easy",
    tags: ["functions", "parameters", "overloading"],
    language: "c++",
    concept: "basics",
  },
  {
    id: 40,
    title: "Pointers and References",
    description: "Basics Concept: Understand memory management with pointers and reference variables.",
    difficulty: "Medium",
    tags: ["pointers", "references", "memory"],
    language: "c++",
    concept: "basics",
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

    let dailyChallengesFromList: typeof challenges = []
    if (selectedLanguage !== "all" && dailyChallenges.length > 0) {
      const dailyChallenge = dailyChallenges[0]
      if (dailyChallenge.language.toLowerCase() === selectedLanguage) {
        const fullDailyChallenge = challenges.find((c) => c.id === dailyChallenge.id)
        if (fullDailyChallenge) {
          dailyChallengesFromList = [fullDailyChallenge]
        }
      }
    }

    const nonDailyChallenges = filtered.filter((c) => !dailyChallengeIds.includes(c.id))

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
                          Daily Challenge
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
