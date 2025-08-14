"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { XPDisplay } from "@/components/xp-display"
import { useUserProgress } from "@/hooks/use-local-storage"

const challengeData = {
  1: {
    title: "Return the Sum of Two Numbers",
    description: "Create a function that takes two numbers as arguments and returns their sum.",
    tags: ["geometry", "maths", "numbers"],
    examples: ["addition(3, 2) → 5", "addition(-3, -6) → -9", "addition(7, 3) → 10"],
    notes: [
      "Don't forget to return the result.",
      "If you get stuck on a challenge, find help by tap on the help button.",
    ],
  },
  2: {
    title: "Area of a Triangle",
    description: "Write a function that takes the base and height of a triangle and return its area.",
    tags: ["geometry", "maths", "numbers"],
    examples: ["triArea(2, 3) → 3", "triArea(7, 4) → 14", "triArea(10, 10) → 50"],
    notes: [
      "The area of a triangle is: (base * height) / 2",
      "Don't forget to return the result.",
      "If you get stuck on a challenge, find help by tap on the help button.",
    ],
  },
}

export default function ChallengePage({ params }: { params: { id: string } }) {
  const { completeChallenge, isChallengeCompleted } = useUserProgress()
  const challengeId = Number.parseInt(params.id)
  const challenge = challengeData[challengeId as keyof typeof challengeData]
  const isCompleted = isChallengeCompleted(challengeId)

  if (!challenge) {
    return <div>Challenge not found</div>
  }

  const handleCompleteChallenge = () => {
    completeChallenge(challengeId, 10)
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Link href="/codearena/challenges" className="text-foreground hover:text-muted-foreground">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <Link href="/codearena" className="text-xl font-medium">
            C_Arena
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <XPDisplay />
          <Link href="/about" className="text-foreground hover:text-muted-foreground underline underline-offset-4">
            About
          </Link>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-border">
        <button className="px-6 py-4 bg-muted text-foreground font-medium border-b-2 border-foreground">
          Instructions
        </button>
        <button className="px-6 py-4 text-muted-foreground hover:text-foreground">Code</button>
        <div className="ml-auto px-6 py-4">
          <XPDisplay />
        </div>
      </div>

      {/* Challenge Content */}
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">{challenge.title}</h1>
            {isCompleted && <span className="text-cyan-400 font-medium">Completed</span>}
          </div>
          <div className="flex gap-2 mb-6">
            {challenge.tags.map((tag) => (
              <span key={tag} className="text-sm bg-muted px-3 py-1 rounded text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <p className="text-foreground leading-relaxed">{challenge.description}</p>

          <div>
            <h2 className="text-xl font-bold mb-4">Examples</h2>
            <div className="bg-muted/30 border-l-4 border-green-500 p-4 space-y-2">
              {challenge.examples.map((example, index) => (
                <div key={index} className="font-mono text-sm text-foreground">
                  {example}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Notes</h2>
            <ul className="space-y-3">
              {challenge.notes.map((note, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-foreground mt-1">•</span>
                  <span className="text-foreground leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6">
        <div className="flex gap-4">
          <Link href="/codearena/challenges" className="flex-1">
            <Button variant="outline" className="w-full bg-muted border-border text-foreground hover:bg-muted/80">
              Skip
            </Button>
          </Link>
          {!isCompleted ? (
            <Button onClick={handleCompleteChallenge} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
              Complete (+10 XP)
            </Button>
          ) : (
            <Button variant="outline" className="flex-1 bg-muted border-border text-foreground hover:bg-muted/80">
              Help
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
