"use client"

import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XPDisplay } from "@/components/xp-display"
import { useUserProgress } from "@/hooks/use-local-storage"

const challenges = [
  {
    id: 1,
    title: "Return the Sum of Two Numbers",
    description: "Create a function that takes two numbers as arguments and returns their sum.",
    difficulty: "Very easy",
    tags: ["geometry", "maths", "numbers"],
  },
  {
    id: 2,
    title: "Area of a Triangle",
    description: "Write a function that takes the base and height of a triangle and return its area.",
    difficulty: "Very easy",
    tags: ["geometry", "maths", "numbers"],
  },
  {
    id: 3,
    title: "Convert Minutes into Seconds",
    description: "Write a function that takes an integer minutes and converts it to seconds.",
    difficulty: "Very easy",
    tags: ["maths", "numbers"],
  },
]

export default function ChallengesPage() {
  const { isChallengeCompleted } = useUserProgress()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-border">
        <Link href="/codearena" className="text-xl font-medium">
          C_Arena
        </Link>
        <div className="flex items-center gap-6">
          <XPDisplay />
          <Link href="/about" className="text-foreground hover:text-muted-foreground underline underline-offset-4">
            About
          </Link>
        </div>
      </header>

      <div className="p-6">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Challenges</h1>
          <XPDisplay />
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <Select defaultValue="javascript">
            <SelectTrigger className="w-48 bg-muted border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-muted border-border">
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="very-easy">
            <SelectTrigger className="w-48 bg-muted border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-muted border-border">
              <SelectItem value="very-easy">Very easy</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Challenge List */}
        <div className="space-y-6">
          {challenges.map((challenge) => {
            const isCompleted = isChallengeCompleted(challenge.id)

            return (
              <Link key={challenge.id} href={`/codearena/challenge/${challenge.id}`}>
                <div className="border-b border-border pb-6 hover:bg-muted/20 transition-colors rounded-lg p-4 -m-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-foreground">{challenge.title}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      {isCompleted && <span className="text-cyan-400 font-medium">Completed</span>}
                      <span className="text-muted-foreground">{challenge.difficulty}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{challenge.description}</p>
                  <div className="flex gap-2">
                    {challenge.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
