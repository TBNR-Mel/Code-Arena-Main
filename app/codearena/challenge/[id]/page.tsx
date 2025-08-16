"use client"

import React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronLast, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XPDisplay } from "@/components/xp-display"
import { markChallengeComplete, isChallengeCompleted } from "@/lib/storage"

// Mock challenge data
const challengeData: Record<string, any> = {
  "1": {
    id: 1,
    title: "Return the Sum of Two Numbers",
    description: "Create a function that takes two numbers as arguments and returns their sum.",
    tags: ["geometry", "maths", "numbers"],
    examples: ["addition(3, 2) → 5", "addition(-3, -6) → -9", "addition(7, 3) → 10"],
    notes: [
      "Don't forget to return the result.",
      "If you get stuck on a challenge, find help by tap on the help button.",
    ],
    language: "javascript",
  },
  "2": {
    id: 2,
    title: "Area of a Triangle",
    description: "Write a function that takes the base and height of a triangle and return its area.",
    tags: ["geometry", "maths", "numbers"],
    examples: ["triArea(2, 3) → 3", "triArea(7, 4) → 14", "triArea(10, 10) → 50"],
    notes: [
      "The area of a triangle is: (base * height) / 2",
      "Don't forget to return the result.",
      "If you get stuck on a challenge, find help by tap on the help button.",
    ],
    language: "javascript",
  },
  "3": {
    id: 3,
    title: "Convert Minutes into Seconds",
    description: "Write a function that takes an integer minutes and converts it to seconds.",
    tags: ["maths", "numbers"],
    examples: ["convert(5) → 300", "convert(3) → 180", "convert(2) → 120"],
    notes: [
      "There are 60 seconds in a minute.",
      "Don't forget to return the result.",
      "If you get stuck on a challenge, find help by tap on the help button.",
    ],
    language: "javascript",
  },
  "4": {
    id: 4,
    title: "Find the Maximum Number in an Array",
    description: "Create a function that finds and returns the maximum number in a given array.",
    tags: ["arrays", "maths"],
    examples: ["findMax([1, 2, 3]) → 3", "findMax([-1, 0, 5]) → 5", "findMax([10]) → 10"],
    notes: [
      "You can use Math.max or iterate through the array.",
      "Handle empty arrays if needed, but assume non-empty for simplicity.",
      "If you get stuck on a challenge, find help by tap on the help button.",
    ],
    language: "javascript",
  },
  "5": {
    id: 5,
    title: "Check if a String is a Palindrome",
    description: "Write a function that checks if a given string is a palindrome.",
    tags: ["strings", "logic"],
    examples: ["is_palindrome('racecar') → True", "is_palindrome('hello') → False", "is_palindrome('a') → True"],
    notes: [
      "A palindrome reads the same forwards and backwards.",
      "Ignore case and non-alphanumeric characters if advanced, but keep simple.",
      "If you get stuck on a challenge, find help by tap on the help button.",
    ],
    language: "python",
  },
  "6": {
    id: 6,
    title: "Factorial of a Number",
    description: "Compute the factorial of a given number.",
    tags: ["maths", "recursion"],
    examples: ["factorial(5) → 120", "factorial(0) → 1", "factorial(3) → 6"],
    notes: [
      "Factorial of n is n * (n-1) * ... * 1.",
      "Use recursion or a loop.",
      "If you get stuck on a challenge, find help by tap on the help button.",
    ],
    language: "java",
  },
  "7": {
    id: 7,
    title: "Fibonacci Sequence",
    description: "Generate the Fibonacci sequence up to a given number.",
    tags: ["maths", "sequences"],
    examples: ["fib(5) → [0, 1, 1, 2, 3, 5]", "fib(3) → [0, 1, 1, 2]", "fib(0) → []"],
    notes: [
      "Fibonacci: each number is the sum of the two preceding ones.",
      "Start with 0 and 1.",
      "If you get stuck on a challenge, find help by tap on the help button.",
    ],
    language: "javascript",
  },
  "8": {
    id: 8,
    title: "Sort an Array",
    description: "Implement a function to sort an array in ascending order.",
    tags: ["arrays", "sorting"],
    examples: ["sort_array([3, 1, 2]) → [1, 2, 3]", "sort_array([5]) → [5]", "sort_array([]) → []"],
    notes: [
      "You can use built-in sort or implement bubble/insertion sort.",
      "Handle numbers or strings as needed.",
      "If you get stuck on a challenge, find help by tap on the help button.",
    ],
    language: "python",
  },
  "9": {
    id: 9,
    title: "Binary Search",
    description: "Implement binary search on a sorted array.",
    tags: ["arrays", "searching"],
    examples: ["binarySearch([1,2,3,4], 3) → 2", "binarySearch([1,2], 5) → -1", "binarySearch([], 1) → -1"],
    notes: [
      "Binary search halves the search interval each time.",
      "Assume the array is sorted.",
      "If you get stuck on a challenge, find help by tap on the help button.",
    ],
    language: "java",
  },
  "10": {
    id: 10,
    title: "Count Vowels in a String",
    description: "Count the number of vowels in a given string.",
    tags: ["strings"],
    examples: ["countVowels('hello') → 2", "countVowels('why') → 0", "countVowels('aeiou') → 5"],
    notes: [
      "Vowels are a, e, i, o, u (lowercase and uppercase).",
      "Iterate through the string and count.",
      "If you get stuck on a challenge, find help by tap on the help button.",
    ],
    language: "javascript",
  },
}

interface ChallengePageProps {
  params: {
    id: string
  }
}

export default function ChallengePage({ params }: ChallengePageProps) {
  const resolvedParams = React.use(params)
  const [isCompleted, setIsCompleted] = useState(false)
  const challenge = challengeData[resolvedParams.id]

  useEffect(() => {
    if (challenge) {
      setIsCompleted(isChallengeCompleted(challenge.id))
    }
  }, [challenge])

  // const handleMarkComplete = () => {
  //   if (challenge && !isCompleted) {
  //     markChallengeComplete(challenge.id)
  //     setIsCompleted(true)
  //     window.dispatchEvent(new Event("progressUpdate"))
  //   }
  // }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Challenge Not Found</h1>
          <Link href="/codearena/challenges">
            <Button>Back to Challenges</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-border border-b mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/codearena/challenges"
            className="flex items-center hover:text-foreground/25 active:text-foreground/30 transition-colors duration-200"
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
      <main className="pb-8">
        <Tabs defaultValue="instructions" className="w-full px-4">
          {/* Tab Navigation */}
          <div className="w-full flex justify-center items-center">
            <TabsList className="grid w-full grid-cols-2 mb-8 gap-1 sm:max-w-[24rem]">
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
          </div>

          {/* Instructions Tab */}
          <TabsContent value="instructions" className="space-y-6 min-h-[70vh] sm:min-h-[60vh] md:max-w-4xl m-auto">
            {/* Challenge Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-semibold">{challenge.title}</h1>
              </div>
              <div className="mb-4">
                <div className="flex gap-2 mb-2">
                  {challenge.tags.map((tag: string) => (
                    <span key={tag} className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                {isCompleted && <span className="text-sm text-green-400 font-medium">✓ Completed</span>}
              </div>
              <p className="text-foreground leading-relaxed">{challenge.description}</p>
            </div>

            {/* Examples Section */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Examples</h2>
              <div className="bg-muted border-l-4 border-l-green-500 p-4 rounded-r-md">
                <div className="space-y-1 text-sm">
                  {challenge.examples.map((example: string, index: number) => (
                    <div key={index}>{example}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Notes</h2>
              <ul className="space-y-2">
                {challenge.notes.map((note: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span className="text-foreground">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Code Tab (Placeholder) */}
          <TabsContent value="code" className="space-y-6 min-h-[70vh] sm:min-h-[60vh]">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Code Editor</h2>
              <p className="text-muted-foreground">This will be implemented in our Saturday session.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-border px-6">
          <Button variant="outline" size="lg">
            Skip
          </Button>
          <div className="flex gap-4">
            <Button variant="ghost" size="lg">
              Help
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}