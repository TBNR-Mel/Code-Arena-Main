"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XPDisplay } from "@/components/xp-display"
import { getTodaysDailyChallenge, markChallengeComplete } from "@/lib/storage"
import dynamic from "next/dynamic"
import { CompletionModal } from "@/components/completion-modal"

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-80 md:h-96 bg-muted rounded-md flex items-center justify-center">
      <div className="text-muted-foreground">Loading editor...</div>
    </div>
  ),
})

export default function DailyChallengeDetailPage() {
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
  const [dailyChallenge, setDailyChallenge] = useState<any>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const challenge = getTodaysDailyChallenge()
    if (challenge) {
      setDailyChallenge(challenge)
      setCode(challenge.starterCode)
      // Check if already completed today
      const progress = JSON.parse(localStorage.getItem("codearena_progress") || "{}")
      const today = new Date().toDateString()
      setIsCompleted(progress.dailyChallengeCompleted === today)
    }
  }, [])

  const handleRunCode = () => {
    if (!dailyChallenge) return

    setIsRunning(true)
    setOutput("Running code...")

    setTimeout(() => {
      try {
        const testResults = []
        let passedTests = 0

        for (const testCase of dailyChallenge.testCases) {
          try {
            // Create a function from the user's code
            let userFunction: (...args: any[]) => any
            try {
              // If the user defined a named function, extract it; otherwise treat the code as an expression returning a function
              if (code.includes("function ")) {
                userFunction = new Function(`${code}; return ${dailyChallenge.starterCode.match(/function (\w+)/)?.[1] || 'solution'};`)() as (...a: any[]) => any
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

            const actual = userFunction(...testCase.input)
            const passed = JSON.stringify(actual) === JSON.stringify(testCase.expected)
            if (passed) passedTests++
            testResults.push({ inputs: testCase.input, expected: testCase.expected, actual, passed })
          } catch (err) {
            testResults.push({
              inputs: testCase.input,
              expected: testCase.expected,
              actual: `Error: ${err instanceof Error ? err.message : String(err)}`,
              passed: false,
            })
          }
        }

        let out = `Test Results: ${passedTests}/${dailyChallenge.testCases.length} passed\n\n`
        testResults.forEach((r, idx) => {
          const inputStr = r.inputs.map((v) => (typeof v === "string" ? `"${v}"` : JSON.stringify(v))).join(", ")
          const functionName = dailyChallenge.starterCode.match(/function (\w+)/)?.[1] || 'solution'
          out += `${r.passed ? "✅" : "❌"} Test ${idx + 1}: ${functionName}(${inputStr})\n`
          out += `   Expected: ${JSON.stringify(r.expected)}\n`
          out += `   Got:      ${JSON.stringify(r.actual)}\n\n`
        })

        if (passedTests === dailyChallenge.testCases.length) {
          out += "🎉 All tests passed! Daily challenge completed!"
          
          const result = markChallengeComplete(dailyChallenge.id, dailyChallenge.difficulty, true)

          // Update completion status if it wasn't completed before
          if (!isCompleted) {
            setIsCompleted(true)
          }

          const completionDataObj = {
            xpEarned: isCompleted ? 0 : result.xpEarned, // No XP for already completed challenges
            totalXp: result.progress.xp,
            currentLevel: result.progress.level,
            isLevelUp: !isCompleted && result.isLevelUp, // Only level up if not previously completed
          }

          setCompletionData(completionDataObj)
          setShowCompletionModal(true)

          if (typeof window !== "undefined" && !isCompleted) {
            window.dispatchEvent(new Event("progressUpdate"))
          }
        } else {
          out += `💡 ${dailyChallenge.testCases.length - passedTests} test(s) failed. Review your logic and try again.`
        }

        setOutput(out)
      } catch (error) {
        setOutput(`❌ Unexpected error: ${error instanceof Error ? error.message : "Something went wrong"}`)
      } finally {
        setIsRunning(false)
      }
    }, 500)
  }

  const handleResetCode = () => {
    if (dailyChallenge) {
      setCode(dailyChallenge.starterCode)
      setOutput("")
    }
  }

  if (!dailyChallenge) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading daily challenge...</div>
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
            href="/codearena/daily"
            className="flex items-center hover:text-foreground/80 transition-colors duration-200 min-h-[44px] min-w-[44px] justify-center sm:justify-start"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
            <span className="hidden sm:inline">Daily Challenge</span>
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
                <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">{dailyChallenge.title}</h1>
              </div>
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                    daily challenge
                  </span>
                  <span className={`text-xs sm:text-sm px-2 py-1 rounded ${
                    dailyChallenge.difficulty === "hard"
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {dailyChallenge.difficulty}
                  </span>
                  <span className="text-xs sm:text-sm text-yellow-500 bg-yellow-500/20 px-2 py-1 rounded">
                    {dailyChallenge.xpReward} XP
                  </span>
                </div>
                {isCompleted && <span className="text-sm text-green-400 font-medium">✓ Completed Today</span>}
              </div>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">{dailyChallenge.description}</p>
            </div>

            {/* Examples */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3">Examples</h2>
              <div className="bg-muted border-l-4 border-l-green-500 p-3 sm:p-4 rounded-r-md overflow-x-auto">
                <div className="space-y-1 text-xs sm:text-sm font-mono">
                  {dailyChallenge.testCases.map((testCase: any, idx: number) => (
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
                  <span className="text-sm sm:text-base text-foreground">This is a daily challenge with higher difficulty and XP rewards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1 text-sm">•</span>
                  <span className="text-sm sm:text-base text-foreground">Complete this challenge to maintain your daily streak</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1 text-sm">•</span>
                  <span className="text-sm sm:text-base text-foreground">Your current XP multiplier will be applied to the reward</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1 text-sm">•</span>
                  <span className="text-sm sm:text-base text-foreground">If you get stuck on a challenge, find help by tap on the help button.</span>
                </li>
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
                    javascript
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
                    className="flex items-center gap-2 flex-1 sm:flex-none h-11 sm:h-9 bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Play className="h-4 w-4" />
                    <span className="text-sm">{isRunning ? "Running..." : "Run Code"}</span>
                  </Button>
                </div>
              </div>

              {/* Split Layout: Code Editor + Output */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[500px]">
                {/* Code Editor Panel */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <MonacoEditor
                    height="500px"
                    language="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: "on",
                      folding: true,
                      lineDecorationsWidth: 20,
                      lineNumbersMinChars: 3,
                    }}
                  />
                </div>

                {/* Output Panel */}
                <div className="border border-border rounded-lg bg-muted/30 flex flex-col">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold">Output</h3>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto">
                    {output ? (
                      <pre className="text-sm whitespace-pre-wrap font-mono break-words">{output}</pre>
                    ) : (
                      <div className="text-muted-foreground text-sm">
                        Run code: You will see test outputs here.
                      </div>
                    )}
                  </div>
                </div>
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
          challengeTitle={dailyChallenge?.title || ""}
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