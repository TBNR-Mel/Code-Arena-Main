"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XPDisplay } from "@/components/xp-display"
import { CompletionModal } from "@/components/completion-modal"
import { getTodaysDailyChallenge, markChallengeComplete } from "@/lib/storage"
import { ChevronLeft, Play, RotateCcw } from "lucide-react"
import { Editor } from "@monaco-editor/react"

export default function DailyChallengeDetailPage() {
  const [activeTab, setActiveTab] = useState("instructions")
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [completionData, setCompletionData] = useState<any>(null)
  const [dailyChallenge, setDailyChallenge] = useState<any>(null)

  useEffect(() => {
    const challenge = getTodaysDailyChallenge()
    if (challenge) {
      setDailyChallenge(challenge)
      setCode(challenge.starterCode)
    }
  }, [])

  const handleRunCode = async () => {
    if (!dailyChallenge) return

    setIsRunning(true)
    setOutput("")

    try {
      const testResults = []
      let allPassed = true

      for (let i = 0; i < dailyChallenge.testCases.length; i++) {
        const testCase = dailyChallenge.testCases[i]
        try {
          // Create a function from the user's code
          const userFunction = new Function("return " + code)()
          const result = userFunction(...testCase.input)
          const passed = JSON.stringify(result) === JSON.stringify(testCase.expected)

          testResults.push({
            input: testCase.input,
            expected: testCase.expected,
            actual: result,
            passed,
          })

          if (!passed) allPassed = false
        } catch (error) {
          testResults.push({
            input: testCase.input,
            expected: testCase.expected,
            actual: `Error: ${error.message}`,
            passed: false,
          })
          allPassed = false
        }
      }

      // Display results
      let outputText = "Test Results:\n\n"
      testResults.forEach((result, index) => {
        outputText += `Test ${index + 1}: ${result.passed ? "✅ PASSED" : "❌ FAILED"}\n`
        outputText += `Input: ${JSON.stringify(result.input)}\n`
        outputText += `Expected: ${JSON.stringify(result.expected)}\n`
        outputText += `Got: ${JSON.stringify(result.actual)}\n\n`
      })

      if (allPassed) {
        outputText += "🎉 All tests passed! Daily challenge completed!"

        // Mark daily challenge as complete
        const result = markChallengeComplete(dailyChallenge.id, dailyChallenge.difficulty, true)
        setCompletionData({
          xpEarned: result.xpEarned,
          newLevel: result.progress.level,
          currentStreak: result.progress.currentStreak,
          isLevelUp: result.isLevelUp,
          newRewards: result.newRewards,
          isDailyChallenge: true,
        })
        setShowCompletionModal(true)
      } else {
        outputText += "Some tests failed. Keep trying!"
      }

      setOutput(outputText)
    } catch (error) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const handleReset = () => {
    if (dailyChallenge) {
      setCode(dailyChallenge.starterCode)
      setOutput("")
    }
  }

  if (!dailyChallenge) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading Daily Challenge...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-border border-b">
        <div className="flex items-center gap-4">
          <Link
            href="/codearena/daily"
            className="flex items-center hover:text-foreground/75 transition-colors duration-200"
          >
            <ChevronLeft className="h-7 w-7" />
            <span>Daily Challenge</span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <XPDisplay />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <TabsList className="grid w-fit grid-cols-2 bg-muted">
              <TabsTrigger value="instructions" className="data-[state=active]:bg-background">
                Instructions
              </TabsTrigger>
              <TabsTrigger value="code" className="data-[state=active]:bg-background">
                Code
              </TabsTrigger>
            </TabsList>
            <div className="text-yellow-500 font-semibold">{dailyChallenge.xpReward} XP</div>
          </div>

          <TabsContent value="instructions" className="flex-1 p-4 sm:p-6 m-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold">{dailyChallenge.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    dailyChallenge.difficulty === "hard"
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {dailyChallenge.difficulty.charAt(0).toUpperCase() + dailyChallenge.difficulty.slice(1)}
                </span>
              </div>

              <p className="text-base sm:text-lg text-muted-foreground mb-6 leading-relaxed">
                {dailyChallenge.description}
              </p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Examples</h3>
                <div className="bg-muted border-l-4 border-l-green-500 p-4 rounded-r">
                  {dailyChallenge.testCases.map((testCase: any, index: number) => (
                    <div key={index} className="font-mono text-sm mb-2">
                      <div>Input: {JSON.stringify(testCase.input)}</div>
                      <div>Output: {JSON.stringify(testCase.expected)}</div>
                      {index < dailyChallenge.testCases.length - 1 && (
                        <div className="my-2 border-t border-border"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Notes</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>This is a daily challenge with higher difficulty and XP rewards</li>
                  <li>Complete this challenge to maintain your daily streak</li>
                  <li>Your current XP multiplier will be applied to the reward</li>
                  <li>Daily challenges reset every 24 hours</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className="flex-1 flex flex-col m-0">
            <div className="flex-1 flex flex-col lg:flex-row min-h-0">
              {/* Code Editor */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
                  <h3 className="font-semibold">Code Editor</h3>
                  <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 bg-transparent">
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
                <div className="flex-1 min-h-0">
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
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
                    }}
                  />
                </div>
              </div>

              {/* Output Panel */}
              <div className="w-full lg:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-border">
                <div className="p-3 border-b border-border bg-muted/50">
                  <h3 className="font-semibold">Output</h3>
                </div>
                <div className="flex-1 p-4 bg-muted/20 font-mono text-sm overflow-auto">
                  {output ? (
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <div className="text-muted-foreground">Click "Run Code" to test your solution</div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex justify-center">
                <Button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  size="lg"
                  className="gap-2 bg-yellow-600 hover:bg-yellow-700"
                >
                  <Play className="h-4 w-4" />
                  {isRunning ? "Running..." : "Run Code"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        completionData={completionData}
      />
    </div>
  )
}
