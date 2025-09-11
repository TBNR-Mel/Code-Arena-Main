"use client"

import type React from "react"

import { CompletionModal } from "@/components/completion-modal"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, HelpCircle, Play, RotateCcw, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XPDisplay } from "@/components/xp-display"
import { isChallengeCompleted, markChallengeComplete } from "@/lib/storage"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { useMediaQuery } from "react-responsive"
import dynamic from "next/dynamic"
import { getNextChallenge } from "@/lib/storage"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-80 md:h-96 bg-muted rounded-md flex items-center justify-center">
      <div className="text-muted-foreground">Loading editor...</div>
    </div>
  ),
})

// ---------- Types ----------
type Language = "javascript" | "python" | "java"

type Challenge = {
  id: number
  title: string
  description: string
  tags: string[]
  examples: string[]
  notes: string[]
  language: Language
  concept?: string
  difficulty?: string
  help: {
    quickTips: string[]
    resources: { title: string; url: string; description: string }[]
    furtherAssistance: string
  }
}

type TestCase = {
  functionName: string
  tests: { inputs: any[]; expected: any }[]
}

// Updated interface to match Next.js 15 requirements
interface ChallengePageProps {
  params: Promise<{ id: string }>
}

// ---------- Mock challenge data ----------
const challengeData: Record<string, any> = {
  // JavaScript - Variables & Basic Operations (Concept 1)
  "1": {
    id: 1,
    title: "Declare and Use Variables",
    description:
      "Variables Concept: Learn how to declare variables using let, const, and var. Understand the differences between them.",
    tags: ["variables", "basics", "syntax"],
    examples: [
      "let name = 'John'; → Creates a variable that can be changed",
      "const age = 25; → Creates a constant that cannot be changed",
      "var city = 'NYC'; → Creates a variable with function scope",
    ],
    notes: [
      "Use 'let' for variables that will change",
      "Use 'const' for values that won't change",
      "Avoid 'var' in modern JavaScript",
    ],
    language: "javascript",
    concept: "variables",
    difficulty: "Very easy",
    help: {
      quickTips: [
        "Use 'let' to declare variables that can be reassigned",
        "Use 'const' for values that won't change",
        "Variable names should be descriptive",
        "Follow camelCase naming convention",
      ],
      resources: [
        {
          title: "JavaScript Variables",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#Variables",
          description: "Learn about variable declarations in JavaScript",
        },
      ],
      furtherAssistance: "Practice declaring different types of variables and understanding their scope.",
    },
  },
  "2": {
    id: 2,
    title: "Variable Assignment and Types",
    description:
      "Variables Concept: Practice assigning different data types to variables and understanding type coercion.",
    tags: ["variables", "types", "assignment"],
    examples: ["let num = 42; → Number type", "let text = 'Hello'; → String type", "let isTrue = true; → Boolean type"],
    notes: [
      "JavaScript is dynamically typed",
      "Variables can hold different types of values",
      "Type coercion happens automatically",
    ],
    language: "javascript",
    concept: "variables",
    difficulty: "Very easy",
    help: {
      quickTips: [
        "JavaScript automatically determines variable types",
        "Use typeof operator to check variable types",
        "Understand how different types are converted",
        "Practice with numbers, strings, and booleans",
      ],
      resources: [
        {
          title: "JavaScript Data Types",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures",
          description: "Understanding JavaScript's data types",
        },
      ],
      furtherAssistance: "Experiment with different data types and see how they behave.",
    },
  },
  "3": {
    id: 3,
    title: "Basic Arithmetic with Variables",
    description:
      "Variables Concept: Perform mathematical operations using variables and understand operator precedence.",
    tags: ["variables", "arithmetic", "operators"],
    examples: [
      "let sum = a + b; → Addition",
      "let product = x * y; → Multiplication",
      "let result = (a + b) * c; → Using parentheses for precedence",
    ],
    notes: [
      "Follow order of operations (PEMDAS)",
      "Use parentheses to control precedence",
      "Store results in variables for reuse",
    ],
    language: "javascript",
    concept: "variables",
    difficulty: "Easy",
    help: {
      quickTips: [
        "Use +, -, *, / for basic arithmetic",
        "Parentheses control order of operations",
        "Store intermediate results in variables",
        "Be careful with division by zero",
      ],
      resources: [
        {
          title: "JavaScript Operators",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators",
          description: "Learn about arithmetic and other operators",
        },
      ],
      furtherAssistance: "Practice combining variables with different arithmetic operations.",
    },
  },
  "4": {
    id: 4,
    title: "Variable Scope Challenge",
    description: "Variables Concept: Understand block scope, function scope, and global scope with practical examples.",
    tags: ["variables", "scope", "functions"],
    examples: [
      "Global: var global = 'accessible everywhere';",
      "Function: function test() { let local = 'only here'; }",
      "Block: { let block = 'only in this block'; }",
    ],
    notes: ["let and const have block scope", "var has function scope", "Global variables are accessible everywhere"],
    language: "javascript",
    concept: "variables",
    difficulty: "Easy",
    help: {
      quickTips: [
        "Understand the difference between let, const, and var scope",
        "Block scope is limited to { } brackets",
        "Function scope is limited to the function",
        "Avoid global variables when possible",
      ],
      resources: [
        {
          title: "JavaScript Scope",
          url: "https://developer.mozilla.org/en-US/docs/Glossary/Scope",
          description: "Understanding variable scope in JavaScript",
        },
      ],
      furtherAssistance: "Practice with nested functions and blocks to understand scope.",
    },
  },
  "5": {
    id: 5,
    title: "Complex Variable Operations",
    description:
      "Variables Concept: Master advanced variable manipulation including destructuring and spread operators.",
    tags: ["variables", "destructuring", "advanced"],
    examples: [
      "let [a, b] = [1, 2]; → Array destructuring",
      "let {name, age} = person; → Object destructuring",
      "let newArray = [...oldArray]; → Spread operator",
    ],
    notes: [
      "Destructuring extracts values from arrays/objects",
      "Spread operator copies array/object elements",
      "These are ES6+ features",
    ],
    language: "javascript",
    concept: "variables",
    difficulty: "Medium",
    help: {
      quickTips: [
        "Use destructuring to extract multiple values at once",
        "Spread operator creates shallow copies",
        "Practice with both arrays and objects",
        "These features make code more concise",
      ],
      resources: [
        {
          title: "Destructuring Assignment",
          url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment",
          description: "Learn about destructuring in JavaScript",
        },
      ],
      furtherAssistance: "Experiment with complex data structures and destructuring patterns.",
    },
  },
}

// ---------- Test cases ----------
const testCases: Record<string, TestCase> = {
  "1": {
    functionName: "declareVariables",
    tests: [
      { inputs: [], expected: "Variables declared successfully" },
      { inputs: [], expected: "Variables declared successfully" },
      { inputs: [], expected: "Variables declared successfully" },
    ],
  },
  "2": {
    functionName: "assignTypes",
    tests: [
      { inputs: [], expected: "Types assigned correctly" },
      { inputs: [], expected: "Types assigned correctly" },
      { inputs: [], expected: "Types assigned correctly" },
    ],
  },
  "3": {
    functionName: "calculateArithmetic",
    tests: [
      { inputs: [5, 3], expected: 8 },
      { inputs: [10, 2], expected: 12 },
      { inputs: [7, 4], expected: 11 },
    ],
  },
  "4": {
    functionName: "testScope",
    tests: [
      { inputs: [], expected: "Scope understood" },
      { inputs: [], expected: "Scope understood" },
      { inputs: [], expected: "Scope understood" },
    ],
  },
  "5": {
    functionName: "advancedOperations",
    tests: [
      { inputs: [[1, 2, 3]], expected: [1, 2, 3] },
      { inputs: [{ name: "John", age: 25 }], expected: { name: "John", age: 25 } },
      { inputs: [[4, 5, 6]], expected: [4, 5, 6] },
    ],
  },
}

// ---------- Component ----------
export default function ChallengePage({ params }: ChallengePageProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [challengeId, setChallengeId] = useState<string>("")
  const [isCompleted, setIsCompleted] = useState(false)
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completionData, setCompletionData] = useState<{
    xpEarned: number
    totalXp: number
    currentLevel: number
    isLevelUp: boolean
    nextChallenge?: { id: number; title: string; difficulty: string }
    allChallengesCompleted: boolean
  } | null>(null)
  const [activeTab, setActiveTab] = useState<"instructions" | "code">("instructions")
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  const [isMediumScreen, setIsMediumScreen] = useState(false)

  // Handle responsive breakpoints
  useEffect(() => {
    const updateScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640)
      setIsMediumScreen(window.innerWidth >= 640 && window.innerWidth < 768)
    }

    updateScreenSize()
    window.addEventListener("resize", updateScreenSize)
    return () => window.removeEventListener("resize", updateScreenSize)
  }, [])

  // Handle async params
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params
      const id = resolvedParams.id
      setChallengeId(id)

      const challengeData_challenge = challengeData[id]
      setChallenge(challengeData_challenge || null)

      if (challengeData_challenge) {
        setIsCompleted(isChallengeCompleted(challengeData_challenge.id))
        setCode(getStarterCode(challengeData_challenge))
      }
    }

    loadParams()
  }, [params])

  const getStarterCode = (c: Challenge): string => {
    switch (c.language) {
      case "javascript":
        if (c.id === 1) return `function declareVariables() {\n  // Write your code here\n}`
        if (c.id === 2) return `function assignTypes() {\n  // Write your code here\n}`
        if (c.id === 3) return `function calculateArithmetic(a, b) {\n  // Write your code here\n}`
        if (c.id === 4) return `function testScope() {\n  // Write your code here\n}`
        if (c.id === 5) return `function advancedOperations(arr) {\n  // Write your code here\n}`
        if (c.id === 7) return `function fib(n) {\n  // Write your code here\n}`
        if (c.id === 10) return `function countVowels(str) {\n  // Write your code here\n}`
        if (c.id === 11) return `function reverseString(str) {\n  // Write your code here\n}`
        if (c.id === 12) return `function isPrime(num) {\n  // Write your code here\n}`
        if (c.id === 13) return `function arraySum(arr) {\n  // Write your code here\n}`
        return `function solution() {\n  // Write your code here\n}`
      case "python":
        if (c.id === 5) return `def is_palindrome(s):\n    # Write your code here\n    pass`
        if (c.id === 8) return `def sort_array(arr):\n    # Write your code here\n    pass`
        if (c.id === 14) return `def isAnagram(s1, s2):\n    # Write your code here\n    pass`
        if (c.id === 15) return `def firstNonRepeated(s):\n    # Write your code here\n    pass`
        if (c.id === 16) return `def power(base, exponent):\n    # Write your code here\n    pass`
        return `def solution():\n    # Write your code here\n    pass`
      case "java":
        if (c.id === 6)
          return `public class Solution {\n    public static int factorial(int n) {\n        // Write your code here\n        return 0;\n    }\n}`
        if (c.id === 9)
          return `public class Solution {\n    public static int binarySearch(int[] arr, int target) {\n        // Write your code here\n        return -1;\n    }\n}`
        return `public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`
      default:
        return "// Write your code here"
    }
  }

  const handleRunCode = () => {
    if (!challenge) return

    setIsRunning(true)
    setOutput("Running code...")

    setTimeout(() => {
      try {
        if (challenge.language === "javascript") {
          const challengeTests = testCases[challengeId]
          if (!challengeTests) {
            setOutput("❌ No test cases available for this challenge yet.")
            setIsRunning(false)
            return
          }

          const fnName = challengeTests.functionName

          let userFunction: (...args: any[]) => any
          try {
            // If the user defined the named function, return it; otherwise treat the code as an expression returning a function
            if (new RegExp(`\\bfunction\\s+${fnName}\\b`).test(code) || code.includes(`${fnName} =`)) {
              userFunction = new Function(`${code}; return ${fnName};`)() as (...a: any[]) => any
            } else {
              userFunction = new Function(`return (${code});`)() as (...a: any[]) => any
            }
          } catch (e) {
            setOutput(`❌ Syntax Error: ${e instanceof Error ? e.message : "Invalid code syntax"}`)
            setIsRunning(false)
            return
          }

          if (typeof userFunction !== "function") {
            setOutput("❌ Your code should define and return a function.")
            setIsRunning(false)
            return
          }

          const results: { inputs: any[]; expected: any; actual: any; passed: boolean }[] = []
          let passedTests = 0

          for (const t of challengeTests.tests) {
            try {
              const actual = userFunction(...t.inputs)
              const passed = JSON.stringify(actual) === JSON.stringify(t.expected)
              if (passed) passedTests++
              results.push({ inputs: t.inputs, expected: t.expected, actual, passed })
            } catch (err) {
              results.push({
                inputs: t.inputs,
                expected: t.expected,
                actual: `Error: ${err instanceof Error ? err.message : String(err)}`,
                passed: false,
              })
            }
          }

          let out = `Test Results: ${passedTests}/${challengeTests.tests.length} passed\n\n`
          results.forEach((r, idx) => {
            const inputStr = r.inputs.map((v) => (typeof v === "string" ? `"${v}"` : JSON.stringify(v))).join(", ")
            out += `${r.passed ? "✅" : "❌"} Test ${idx + 1}: ${fnName}(${inputStr})\n`
            out += `   Expected: ${JSON.stringify(r.expected)}\n`
            out += `   Got:      ${JSON.stringify(r.actual)}\n\n`
          })

          if (passedTests === challengeTests.tests.length) {
            out += "🎉 All tests passed! Challenge completed!"
            console.log("[v0] All tests passed, triggering modal")
            const result = markChallengeComplete(challenge.id, getDifficultyFromId(challenge.id))

            // Update completion status if it wasn't completed before
            if (!isCompleted) {
              setIsCompleted(true)
            }

            // Get the selected language from localStorage
            const selectedLanguage =
              typeof window !== "undefined"
                ? localStorage.getItem("challengeLanguage") || challenge.language
                : challenge.language
            const nextChallenge = getNextChallenge(challenge.id, selectedLanguage)
            const completionDataObj: {
              xpEarned: number
              totalXp: number
              currentLevel: number
              isLevelUp: boolean
              nextChallenge?: { id: number; title: string; difficulty: string }
              allChallengesCompleted: boolean
            } = {
              xpEarned: isCompleted ? 0 : result.xpEarned,
              totalXp: result.progress.xp,
              currentLevel: result.progress.level,
              isLevelUp: !isCompleted && result.isLevelUp,
              nextChallenge: nextChallenge || undefined,
              allChallengesCompleted:
                !nextChallenge &&
                result.progress.completedChallenges.length ===
                  Object.values(challengeData).filter((c: { language: string }) => c.language === selectedLanguage)
                    .length,
            }

            console.log("[v0] Setting completion data:", completionDataObj)
            setCompletionData(completionDataObj)

            console.log("[v0] Setting showCompletionModal to true")
            setShowCompletionModal(true)

            if (typeof window !== "undefined" && !isCompleted) {
              window.dispatchEvent(new Event("progressUpdate"))
            }
          } else {
            out += `💡 ${challengeTests.tests.length - passedTests} test(s) failed. Review your logic and try again.`
          }

          setOutput(out)
        } else {
          // Non-JS languages: basic feedback only
          if (code.trim().length < 10) {
            setOutput("❌ Please write more code to implement the solution.")
          } else if (challenge.language === "python" && !code.includes("def ")) {
            setOutput("❌ Python code should define a function using 'def'.")
          } else if (challenge.language === "java" && !code.includes("public ")) {
            setOutput("❌ Java code should include a public method or class.")
          } else {
            setOutput(
              `✅ Code syntax looks good!\n\nNote: Full execution for ${challenge.language} will be available soon.\n\nExpected behavior:\n${challenge.examples.join(
                "\n",
              )}`,
            )
          }
        }
      } catch (error) {
        setOutput(`❌ Unexpected error: ${error instanceof Error ? error.message : "Something went wrong"}`)
      } finally {
        setIsRunning(false)
      }
    }, 500)
  }

  const handleResetCode = () => {
    if (challenge) {
      setCode(getStarterCode(challenge))
      setOutput("")
    }
  }

  // Show loading state while params are being resolved
  if (!challenge && !challengeId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading challenge...</div>
        </div>
      </div>
    )
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
      <header className="flex items-center justify-between py-4 pr-4 pl-2 md:p-4 border-border border-b mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/codearena/challenges"
            className="flex items-center hover:text-foreground/25 active:text-foreground/30 transition-colors duration-200"
          >
            <ChevronLeft className="h-8 w-8 sm:h-7 sm:w-7" />
            <span>Challenges</span>
          </Link>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <XPDisplay />
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-6 sm:pb-8">
        <Tabs
          defaultValue="instructions"
          onValueChange={(value) => setActiveTab(value as "instructions" | "code")}
          className="w-full px-3 sm:px-4"
        >
          {/* Tab Navigation */}
          <div className="w-full flex justify-center items-center">
            <TabsList className="grid w-full grid-cols-2 mb-8 gap-1 sm:max-w-[24rem]">
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
          </div>

          {/* Instructions Tab */}
          <TabsContent value="instructions" className="space-y-6 min-h-[70vh] sm:min-h-[60vh] md:max-w-7xl m-auto">
            {/* Challenge Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl font-semibold">{challenge.title}</h1>
              </div>
              <div className="mb-4">
                {isCompleted && <span className="text-sm text-green-400 font-medium">✓ Completed</span>}
              </div>
              <p className="text-foreground leading-relaxed text-base">{challenge.description}</p>
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

            {/* Tags Section */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Tags</h2>
              <div className="flex gap-2 mb-2">
                {challenge.tags.map((tag: string) => (
                  <span key={tag} className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="space-y-4 sm:space-y-6 min-h-[60vh] sm:min-h-[60vh] max-w-7xl mx-auto">
            {/* Code Editor Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-semibold">Code Editor</h2>
                <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-1 rounded capitalize">
                  {challenge.language}
                </span>
              </div>
              <div className="grid grid-cols-[100px_minmax(200px,_1fr)] gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetCode}
                  className="flex items-center gap-2 bg-transparent flex-1 sm:flex-none h-11 sm:h-9"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </Button>
                <Button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="flex items-center gap-2 flex-1 sm:flex-none h-11 sm:h-9"
                >
                  <Play className="h-4 w-4" />
                  <span>{isRunning ? "Running..." : "Run Code"}</span>
                </Button>
              </div>
            </div>
            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-[minmax(0,1fr)]
                md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]
                lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]
                gap-4
              "
            >
              {/* Monaco Editor */}
              <div className="border-border border rounded-sm p-2 md:p-4">
                <MonacoEditor
                  height={isSmallScreen ? "300px" : isMediumScreen ? "350px" : "400px"}
                  language={challenge.language === "javascript" ? "javascript" : challenge.language}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  options={{
                    minimap: { enabled: !isSmallScreen },
                    fontSize: isSmallScreen ? 16 : 16,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: "off",
                    folding: !isSmallScreen,
                    lineDecorationsWidth: isSmallScreen ? 10 : 20,
                    lineNumbersMinChars: isSmallScreen ? 2 : 3,
                  }}
                />
              </div>

              {/* Output */}
              <div className="border-border border rounded-sm p-2 md:p-4">
                {output ? (
                  <div className="space-y-2 h-full">
                    <div className="bg-muted border border-border min-h-full p-3 sm:p-4 max-h-64 sm:max-h-80 overflow-y-auto">
                      <pre className="text-base whitespace-pre-wrap font-mono break-words">{output}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 min-h-full bg-muted flex justify-center items-center">
                    <div className="p-3 sm:p-4 max-h-64 min-h-full overflow-y-auto">
                      <p className="text-base text-center sm:text-sm text-foreground/25">
                        Run Code: <br />
                        You will see test outputs here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        {/* Bottom Actions */}
        <BottomActions activeTab={activeTab} challenge={challenge} />
      </main>

      {completionData && (
        <CompletionModal
          isOpen={showCompletionModal}
          onClose={() => {
            setShowCompletionModal(false)
          }}
          challengeTitle={challenge.title}
          xpEarned={completionData.xpEarned}
          totalXp={completionData.totalXp}
          currentLevel={completionData.currentLevel}
          isLevelUp={completionData.isLevelUp}
          nextChallenge={completionData.nextChallenge}
          allChallengesCompleted={completionData.allChallengesCompleted}
          allowBackgroundScroll={true}
        />
      )}
    </div>
  )
}

const getDifficultyFromId = (id: number): string => {
  const difficultyMap: Record<number, string> = {
    1: "very easy",
    2: "very easy",
    3: "very easy",
    10: "very easy",
    4: "easy",
    6: "easy",
    5: "medium",
    7: "medium",
    8: "medium",
    9: "hard",
  }
  return difficultyMap[id] || "very easy"
}

// Bottom Actions Component
const BottomActions: React.FC<{ activeTab: string; challenge: any }> = ({ activeTab, challenge }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" })
  const handleHelpClick = () => {
    setIsHelpOpen(true)
  }

  return (
    <div className="flex justify-between gap-3 mt-8 pt-6 border-t border-border max-w-7xl m-auto">
      <div className="flex justify-between gap-3 w-full">
        <Button
          variant="ghost"
          size="lg"
          className="text-base text-foreground/50 hover:text-foreground hover:bg-accent/90 flex items-center gap-2"
        >
          <SkipForward className="w-5 h-5" />
          Skip
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="text-base text-foreground/50 hover:text-foreground flex items-center gap-2 bg-transparent"
          onClick={handleHelpClick}
        >
          <HelpCircle className="w-5 h-5" />
          Help
        </Button>
      </div>

      {/* Desktop: Dialog */}
      {isDesktop ? (
        <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <DialogContent className="sm:max-w-[825px]">
            <DialogHeader className="sr-only">
              <DialogTitle>Help: {challenge.title}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="quick-tips" className="w-full">
              <TabsList className="flex gap-10 h-12 w-full grid-cols-3 justify-center items-center text-base rounded-none bg-transparent border-b border-border">
                <TabsTrigger
                  className="rounded-none relative data-[state=active]:text-foreground pb-2 px-0 w-full data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[4px] data-[state=active]:after:bg-primary data-[state=active]:after:rounded-full"
                  value="quick-tips"
                >
                  Quick Tips
                </TabsTrigger>
                <TabsTrigger
                  className="rounded-none relative data-[state=active]:text-foreground pb-2 px-0 w-full data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[4px] data-[state=active]:after:bg-primary data-[state=active]:after:rounded-full"
                  value="resources"
                >
                  Resources
                </TabsTrigger>
                <TabsTrigger
                  className="rounded-none relative data-[state=active]:text-foreground pb-2 px-0 w-full data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[4px] data-[state=active]:after:bg-primary data-[state=active]:after:rounded-full"
                  value="further-assistance"
                >
                  Assistance
                </TabsTrigger>
              </TabsList>
              <TabsContent value="quick-tips" className="mt-4 min-h-[65vh] text-base">
                <ul className="space-y-2 text-foreground">
                  {challenge.help?.quickTips.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="resources" className="mt-4 min-h-[65vh] text-base">
                <div className="space-y-4 text-foreground">
                  {challenge.help?.resources.map((resource: any, index: number) => (
                    <div key={index}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {resource.title}
                      </a>
                      <p className="text-muted-foreground">{resource.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="further-assistance" className="mt-4 min-h-[65vh] text-base">
                <p className="text-foreground">{challenge.help?.furtherAssistance}</p>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      ) : (
        /* Mobile: Drawer */
        <Drawer open={isHelpOpen} onOpenChange={setIsHelpOpen}>
          <DrawerContent>
            <DialogHeader className="sr-only">
              <DialogTitle>Help: {challenge.title}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="quick-tips" className="w-full pb-4">
              <TabsList className="flex gap-10 h-12 w-full grid-cols-3 justify-center items-center text-base rounded-none bg-transparent border-b border-border">
                <TabsTrigger
                  className="rounded-none relative data-[state=active]:text-foreground pb-2 px-0 w-min data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[4px] data-[state=active]:after:bg-primary data-[state=active]:after:rounded-full"
                  value="quick-tips"
                >
                  Quick Tips
                </TabsTrigger>
                <TabsTrigger
                  className="rounded-none relative data-[state=active]:text-foreground pb-2 px-0 w-min data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[4px] data-[state=active]:after:bg-primary data-[state=active]:after:rounded-full"
                  value="resources"
                >
                  Resources
                </TabsTrigger>
                <TabsTrigger
                  className="rounded-none relative data-[state=active]:text-foreground pb-2 px-0 w-min data-[state=active]:shadow-none data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-[4px] data-[state=active]:after:bg-primary data-[state=active]:after:rounded-full"
                  value="further-assistance"
                >
                  Assistance
                </TabsTrigger>
              </TabsList>
              <TabsContent value="quick-tips" className="mt-4 min-h-[80vh] text-base">
                <ul className="space-y-2 text-foreground px-4">
                  {challenge.help?.quickTips.map((tip: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="resources" className="mt-4 min-h-[94vh] text-base">
                <div className="space-y-4 text-foreground px-4">
                  {challenge.help?.resources.map((resource: any, index: number) => (
                    <div key={index}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {resource.title}
                      </a>
                      <p className="text-muted-foreground">{resource.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="further-assistance" className="mt-4 min-h-[80vh] text-base">
                <div className="px-4">
                  <p className="text-foreground">{challenge.help?.furtherAssistance}</p>
                </div>
              </TabsContent>
            </Tabs>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}
