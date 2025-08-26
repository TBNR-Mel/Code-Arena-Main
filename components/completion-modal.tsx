"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trophy, Star, Zap, ArrowRight, RotateCcw } from "lucide-react"
import Link from "next/link"

interface CompletionModalProps {
  isOpen: boolean
  onClose: () => void
  challengeTitle: string
  xpEarned: number
  totalXp: number
  currentLevel: number
  nextChallenge?: {
    id: number
    title: string
    difficulty: string
  }
  isLevelUp?: boolean
  allowBackgroundScroll?: boolean
}

export function CompletionModal({
  isOpen,
  onClose,
  challengeTitle,
  xpEarned,
  totalXp,
  currentLevel,
  nextChallenge,
  isLevelUp = false,
  allowBackgroundScroll = false,
}: CompletionModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  const isRepeatCompletion = xpEarned === 0

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)

      if (!allowBackgroundScroll) {
        document.body.style.overflow = "hidden"
      }

      return () => {
        clearTimeout(timer)
        if (!allowBackgroundScroll) {
          document.body.style.overflow = "unset"
        }
      }
    }
  }, [isOpen, allowBackgroundScroll])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="text-center space-y-4 flex-shrink-0">
          <div
            className={`mx-auto w-16 h-16 ${isRepeatCompletion ? "bg-blue-500/20" : "bg-green-500/20"} rounded-full flex items-center justify-center`}
          >
            {isRepeatCompletion ? (
              <RotateCcw className="w-8 h-8 text-blue-500" />
            ) : (
              <Trophy className="w-8 h-8 text-green-500" />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold">
            {isRepeatCompletion ? "🎯 Great Practice!" : "🎉 Challenge Complete!"}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">{challengeTitle}</h3>
              {isRepeatCompletion ? (
                <div className="flex items-center justify-center gap-2 text-blue-500">
                  <RotateCcw className="w-5 h-5" />
                  <span className="font-bold">Practice Complete</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-500">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">+{xpEarned} XP</span>
                </div>
              )}
              {isRepeatCompletion && (
                <p className="text-sm text-muted-foreground mt-2">
                  You've already completed this challenge, but practice makes perfect!
                </p>
              )}
            </div>

            {isLevelUp && !isRepeatCompletion && (
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-purple-400">LEVEL UP!</span>
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-sm text-muted-foreground">You've reached Level {currentLevel}!</p>
              </div>
            )}

            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total XP</span>
                <span className="font-semibold">{totalXp} XP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Level</span>
                <span className="font-semibold">Level {currentLevel}</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((totalXp % 100) / 100) * 100}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-center">{100 - (totalXp % 100)} XP to next level</div>
            </div>

            {nextChallenge && (
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Next Challenge</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{nextChallenge.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{nextChallenge.difficulty}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 flex-shrink-0 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Continue
          </Button>
          {nextChallenge && (
            <Link href={`/codearena/challenge/${nextChallenge.id}`} className="flex-1">
              <Button className="w-full">Next Challenge</Button>
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
