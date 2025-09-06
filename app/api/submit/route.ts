import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { submitSolution, updateUserProgress, getChallengeById } from "@/lib/challenges"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { challengeId, code } = await request.json()

    if (!challengeId || !code) {
      return NextResponse.json({ error: "Challenge ID and code are required" }, { status: 400 })
    }

    // Get challenge details
    const challenge = await getChallengeById(challengeId)
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    // Simple code evaluation (in a real app, you'd want to run this in a sandbox)
    let status: "passed" | "failed" = "failed"
    let score = 0

    try {
      // This is a simplified test runner - in production you'd want proper sandboxing
      const testResults = challenge.test_cases.map((testCase) => {
        try {
          // Create a function from the user's code
          const userFunction = new Function("return " + code)()
          const result = userFunction(...testCase.input)
          return JSON.stringify(result) === JSON.stringify(testCase.expected)
        } catch {
          return false
        }
      })

      const passedTests = testResults.filter(Boolean).length
      const totalTests = challenge.test_cases.length

      if (passedTests === totalTests) {
        status = "passed"
        score = challenge.points
      } else {
        score = Math.floor((passedTests / totalTests) * challenge.points)
      }
    } catch (error) {
      console.error("Error evaluating code:", error)
      status = "failed"
      score = 0
    }

    // Submit the solution
    const submission = await submitSolution(user.id, challengeId, code, status, score)

    if (!submission) {
      return NextResponse.json({ error: "Failed to submit solution" }, { status: 500 })
    }

    // Update user progress
    await updateUserProgress(user.id, score, status === "passed")

    return NextResponse.json({
      status,
      score,
      submission,
    })
  } catch (error) {
    console.error("Error in submit API:", error)
    return NextResponse.json({ error: "Failed to submit solution" }, { status: 500 })
  }
}
