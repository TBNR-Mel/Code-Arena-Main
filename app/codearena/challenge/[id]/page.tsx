"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XPDisplay } from "@/components/xp-display"
import dynamic from "next/dynamic"
import { CompletionModal } from "@/components/completion-modal"
import { createClient } from "@/lib/supabase/client"
import type { Challenge } from "@/lib/types"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-80 md:h-96 bg-muted rounded-md flex items-center justify-center">
      <div className="text-muted-foreground">Loading editor...</div>
    </div>
  ),
})

// Updated interface to match Next.js 15 requirements
interface ChallengePageProps {
  params: Promise<{ id: string }>
}

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
  } | null>(null)
  const [user, setUser] = useState<any>(null)
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

  useEffect(() => {
    const supabase = createClient()

    const loadParams = async () => {
      const resolvedParams = await params
      const id = resolvedParams.id
      setChallengeId(id)

      // Get user authentication status
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      // Fetch challenge from API
      try {
        const response = await fetch(`/api/challenges/${id}`)
        if (response.ok) {
          const challengeData = await response.json()
          setChallenge(challengeData)
          setCode(getStarterCode(challengeData))

          // Check if user has completed this challenge
          if (user) {
            const { data: submission } = await supabase
              .from("user_submissions")
              .select("status")
              .eq("user_id", user.id)
              .eq("challenge_id", id)
              .eq("status", "passed")
              .single()

            setIsCompleted(!!submission)
          }
        } else {
          console.error("Challenge not found")
        }
      } catch (error) {
        console.error("Error fetching challenge:", error)
      }
    }

    loadParams()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setIsCompleted(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [params])

  const getStarterCode = (c: Challenge): string => {
    if (c.starter_code) {
      return c.starter_code
    }

    // Fallback starter code based on challenge title
    if (c.title.toLowerCase().includes("sum")) {
      return `function twoSum(nums, target) {\n  // Your code here\n}`
    }
    if (c.title.toLowerCase().includes("reverse")) {
      return `function reverseString(s) {\n  // Your code here\n}`
    }
    if (c.title.toLowerCase().includes("parentheses")) {
      return `function isValid(s) {\n  // Your code here\n}`
    }

    return `function solution() {\n  // Your code here\n}`
  }

  const handleRunCode = async () => {
    if (!challenge || !user) {
      setOutput("❌ Please sign in to run code and submit solutions.")
      return
    }

    setIsRunning(true)
    setOutput("Running code...")

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          code: code,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setOutput(`❌ Error: ${result.error}`)
        return
      }

      // Display test results
      let output = `Test Results: ${result.status === "passed" ? "All tests passed!" : "Some tests failed"}\n\n`

      if (result.status === "passed") {
        output += "🎉 All tests passed! Challenge completed!"

        // Update completion status if it wasn't completed before
        if (!isCompleted) {
          setIsCompleted(true)
        }

        // Show completion modal
        const completionDataObj = {
          xpEarned: isCompleted ? 0 : result.score, // No XP for already completed challenges
          totalXp: result.score, // This would come from user progress in a real implementation
          currentLevel: Math.floor(result.score / 100) + 1,
          isLevelUp: !isCompleted && result.score >= 100,
        }

        setCompletionData(completionDataObj)
        setShowCompletionModal(true)
      } else {
        output += `💡 Score: ${result.score}/${challenge.points} points. Review your logic and try again.`
      }

      setOutput(output)
    } catch (error) {
      setOutput(`❌ Unexpected error: ${error instanceof Error ? error.message : "Something went wrong"}`)
    } finally {
      setIsRunning(false)
    }
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
      <header className="flex items-center justify-between p-3 sm:p-4 border-border border-b mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/codearena/challenges"
            className="flex items-center hover:text-foreground/80 transition-colors duration-200 min-h-[44px] min-w-[44px] justify-center sm:justify-start"
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
            <div>
              <div className="flex items-start gap-3 mb-3">
                <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">{challenge.title}</h1>
              </div>
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    {challenge.category}
                  </span>
                  <span
                    className={`text-xs sm:text-sm px-2 py-1 rounded font-medium ${
                      challenge.difficulty === "easy"
                        ? "bg-green-500/20 text-green-400"
                        : challenge.difficulty === "medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {challenge.difficulty.toUpperCase()}
                  </span>
                  <span className="text-xs sm:text-sm text-blue-500 bg-blue-500/20 px-2 py-1 rounded">
                    {challenge.points} points
                  </span>
                </div>
                {isCompleted && <span className="text-sm text-green-400 font-medium">✓ Completed</span>}
              </div>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">{challenge.description}</p>
            </div>

            {/* Examples */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Examples</h2>
              <div className="bg-muted border-l-4 border-l-green-500 p-3 sm:p-4 rounded-r-md overflow-x-auto">
                <div className="space-y-1 text-xs sm:text-sm font-mono">
                  {challenge.test_cases.slice(0, 3).map((testCase, idx) => (
                    <div key={idx} className="whitespace-nowrap">
                      Input: {JSON.stringify(testCase.input)} → Output: {JSON.stringify(testCase.expected)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Notes</h2>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1 text-sm">•</span>
                  <span className="text-sm sm:text-base text-foreground">
                    Write a function that solves the problem described above
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1 text-sm">•</span>
                  <span className="text-sm sm:text-base text-foreground">
                    Your solution will be tested against multiple test cases
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1 text-sm">•</span>
                  <span className="text-sm sm:text-base text-foreground">
                    You need to be signed in to submit solutions and earn points
                  </span>
                </li>
              </ul>
            </div>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="space-y-4 sm:space-y-6 min-h-[60vh] sm:min-h-[60vh] max-w-7xl mx-auto">
            {/* Code Editor Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-semibold">Code Editor</h2>
                <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-1 rounded capitalize">
                  JavaScript
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
                  disabled={isRunning || !user}
                  className="flex items-center gap-2 flex-1 sm:flex-none h-11 sm:h-9"
                >
                  <Play className="h-4 w-4" />
                  <span>{isRunning ? "Running..." : !user ? "Sign In to Run" : "Run Code"}</span>
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
                  language="javascript"
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
        <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border px-3 sm:px-6">
          <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 sm:h-10 bg-transparent">
            Skip
          </Button>
          <Button variant="ghost" size="lg" className="w-full sm:w-auto h-12 sm:h-10">
            Help
          </Button>
        </div>
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
          allowBackgroundScroll={true}
        />
      )}
    </div>
  )
}
