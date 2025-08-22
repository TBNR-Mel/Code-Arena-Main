"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XPDisplay } from "@/components/xp-display"
import { isChallengeCompleted, markChallengeComplete } from "@/lib/storage"
import dynamic from "next/dynamic"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-80 md:h-96 bg-muted rounded-md flex items-center justify-center">
      <div className="text-muted-foreground">Loading editor...</div>
    </div>
  ),
})

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
  const [isCompleted, setIsCompleted] = useState(false)
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const challenge = challengeData[params.id]

  useEffect(() => {
    if (challenge) {
      setIsCompleted(isChallengeCompleted(challenge.id))

      // Set starter code based on challenge and language
      const getStarterCode = () => {
        switch (challenge.language) {
          case "javascript":
            if (challenge.id === 1) {
              return `function addition(a, b) {
  // Write your code here
  
}`
            } else if (challenge.id === 2) {
              return `function triArea(base, height) {
  // Write your code here
  
}`
            } else if (challenge.id === 3) {
              return `function convert(minutes) {
  // Write your code here
  
}`
            } else if (challenge.id === 7) {
              return `function fib(n) {
  // Write your code here
  
}`
            } else if (challenge.id === 10) {
              return `function countVowels(str) {
  // Write your code here
  
}`
            }
            return `function solution() {
  // Write your code here
  
}`
          case "python":
            if (challenge.id === 5) {
              return `def is_palindrome(s):
    # Write your code here
    pass`
            } else if (challenge.id === 8) {
              return `def sort_array(arr):
    # Write your code here
    pass`
            }
            return `def solution():
    # Write your code here
    pass`
          case "java":
            if (challenge.id === 6) {
              return `public class Solution {
    public static int factorial(int n) {
        // Write your code here
        
    }
}`
            } else if (challenge.id === 9) {
              return `public class Solution {
    public static int binarySearch(int[] arr, int target) {
        // Write your code here
        
    }
}`
            }
            return `public class Solution {
    public static void main(String[] args) {
        // Write your code here
        
    }
}`
          default:
            return "// Write your code here"
        }
      }

      setCode(getStarterCode())
    }
  }, [challenge])

  const handleRunCode = async () => {
    setIsRunning(true)
    setOutput("Running code...")

    // Simulate code execution
    setTimeout(() => {
      try {
        // Basic validation for JavaScript
        if (challenge.language === "javascript") {
          if (code.includes("return") && code.trim().length > 20) {
            setOutput(
              `✅ Code executed successfully!\n\nExample test cases:\n${challenge.examples.join("\n")}\n\n✨ Great job! Your solution looks good.`,
            )

            // Mark challenge as complete if not already
            if (!isCompleted) {
              markChallengeComplete(challenge.id)
              setIsCompleted(true)
              window.dispatchEvent(new Event("progressUpdate"))
            }
          } else {
            setOutput("❌ Make sure your function returns a value and implements the solution.")
          }
        } else {
          setOutput(
            `✅ Code syntax looks good!\n\nNote: Full execution for ${challenge.language} will be available soon.\n\nExample test cases:\n${challenge.examples.join("\n")}`,
          )
        }
      } catch (error) {
        setOutput("❌ There seems to be an error in your code. Please check your syntax.")
      }
      setIsRunning(false)
    }, 1500)
  }

  const handleResetCode = () => {
    const getStarterCode = () => {
      switch (challenge.language) {
        case "javascript":
          if (challenge.id === 1) {
            return `function addition(a, b) {
  // Write your code here
  
}`
          } else if (challenge.id === 2) {
            return `function triArea(base, height) {
  // Write your code here
  
}`
          }
          return `function solution() {
  // Write your code here
  
}`
        case "python":
          return `def solution():
    # Write your code here
    pass`
        case "java":
          return `public class Solution {
    public static void main(String[] args) {
        // Write your code here
        
    }
}`
        default:
          return "// Write your code here"
      }
    }
    setCode(getStarterCode())
    setOutput("")
  }

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
      <header className="flex items-center justify-between p-3 sm:p-4 border-border border-b mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/codearena/challenges"
            className="flex items-center hover:text-foreground/25 active:text-foreground/30 transition-colors duration-200 min-h-[44px] min-w-[44px] justify-center sm:justify-start"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
            <span className="hidden sm:inline">Challenges</span>
          </Link>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <XPDisplay />
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-6 sm:pb-8">
        <Tabs defaultValue="instructions" className="w-full px-3 sm:px-4">
          {/* Tab Navigation */}
          <div className="w-full flex justify-center items-center mb-4 sm:mb-8">
            <TabsList className="grid w-full grid-cols-2 gap-1 max-w-sm sm:max-w-md h-12 sm:h-10">
              <TabsTrigger value="instructions" className="text-sm sm:text-base h-full">
                Instructions
              </TabsTrigger>
              <TabsTrigger value="code" className="text-sm sm:text-base h-full">
                Code
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Instructions Tab */}
          <TabsContent
            value="instructions"
            className="space-y-4 sm:space-y-6 min-h-[60vh] sm:min-h-[70vh] md:max-w-4xl mx-auto"
          >
            {/* Challenge Header */}
            <div>
              <div className="flex items-start gap-3 mb-3">
                <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">{challenge.title}</h1>
              </div>
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {challenge.tags.map((tag: string) => (
                    <span key={tag} className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                {isCompleted && <span className="text-sm text-green-400 font-medium">✓ Completed</span>}
              </div>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">{challenge.description}</p>
            </div>

            {/* Examples Section */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Examples</h2>
              <div className="bg-muted border-l-4 border-l-green-500 p-3 sm:p-4 rounded-r-md overflow-x-auto">
                <div className="space-y-1 text-xs sm:text-sm font-mono">
                  {challenge.examples.map((example: string, index: number) => (
                    <div key={index} className="whitespace-nowrap">
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Notes</h2>
              <ul className="space-y-2">
                {challenge.notes.map((note: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-1 text-sm">•</span>
                    <span className="text-sm sm:text-base text-foreground">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="space-y-4 sm:space-y-6 min-h-[60vh] sm:min-h-[70vh] max-w-7xl mx-auto">
            <div className="space-y-4">
              {/* Code Editor Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold">Code Editor</h2>
                  <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-1 rounded capitalize">
                    {challenge.language}
                  </span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetCode}
                    className="flex items-center gap-2 bg-transparent flex-1 sm:flex-none h-11 sm:h-9"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="text-sm">Reset</span>
                  </Button>
                  <Button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="flex items-center gap-2 flex-1 sm:flex-none h-11 sm:h-9"
                  >
                    <Play className="h-4 w-4" />
                    <span className="text-sm">{isRunning ? "Running..." : "Run Code"}</span>
                  </Button>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="border border-border rounded-lg overflow-hidden">
                <MonacoEditor
                  height={
                    typeof window !== "undefined" && window.innerWidth < 640
                      ? "300px"
                      : typeof window !== "undefined" && window.innerWidth < 768
                        ? "350px"
                        : "400px"
                  }
                  language={challenge.language === "javascript" ? "javascript" : challenge.language}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: typeof window !== "undefined" && window.innerWidth >= 768 },
                    fontSize: typeof window !== "undefined" && window.innerWidth < 640 ? 12 : 14,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: "on",
                    folding: typeof window !== "undefined" && window.innerWidth >= 640,
                    lineDecorationsWidth: typeof window !== "undefined" && window.innerWidth < 640 ? 10 : 20,
                    lineNumbersMinChars: typeof window !== "undefined" && window.innerWidth < 640 ? 2 : 3,
                  }}
                />
              </div>

              {/* Output Section */}
              {output && (
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-semibold">Output</h3>
                  <div className="bg-muted border border-border rounded-lg p-3 sm:p-4 max-h-64 sm:max-h-80 overflow-y-auto">
                    <pre className="text-xs sm:text-sm whitespace-pre-wrap font-mono break-words">{output}</pre>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border px-3 sm:px-6">
          <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 sm:h-10 bg-transparent">
            Skip
          </Button>
          <Button variant="ghost" size="lg" className="w-full sm:w-auto h-12 sm:h-10">
            Help
          </Button>
        </div>
      </main>
    </div>
  )
}
