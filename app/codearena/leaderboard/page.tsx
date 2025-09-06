"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { XPDisplay } from "@/components/xp-display"
import { getLeaderboard, getUserProgress, setUsername } from "@/lib/storage"
import { ChevronLeft, Trophy, Medal, Award, User, Crown } from "lucide-react"

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [userProgress, setUserProgress] = useState<any>(null)
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)
  const [usernameInput, setUsernameInput] = useState("")
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    const progress = getUserProgress()
    const leaderboardData = getLeaderboard()

    setUserProgress(progress)
    setLeaderboard(leaderboardData)

    // Check if user needs to set username
    if (!progress.username && progress.xp > 0) {
      setShowUsernameDialog(true)
    }

    // Find user's rank
    if (progress.username) {
      const rank = leaderboardData.findIndex((entry) => entry.username === progress.username) + 1
      setUserRank(rank > 0 ? rank : null)
    }

    const handleProgressUpdate = () => {
      const updatedProgress = getUserProgress()
      const updatedLeaderboard = getLeaderboard()
      setUserProgress(updatedProgress)
      setLeaderboard(updatedLeaderboard)

      if (updatedProgress.username) {
        const rank = updatedLeaderboard.findIndex((entry) => entry.username === updatedProgress.username) + 1
        setUserRank(rank > 0 ? rank : null)
      }
    }

    window.addEventListener("progressUpdate", handleProgressUpdate)
    return () => window.removeEventListener("progressUpdate", handleProgressUpdate)
  }, [])

  const handleSetUsername = () => {
    if (usernameInput.trim() && userProgress) {
      setUsername(usernameInput.trim())
      setShowUsernameDialog(false)

      // Refresh leaderboard
      const updatedLeaderboard = getLeaderboard()
      setLeaderboard(updatedLeaderboard)

      const rank = updatedLeaderboard.findIndex((entry) => entry.username === usernameInput.trim()) + 1
      setUserRank(rank > 0 ? rank : null)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-border border-b">
        <div className="flex items-center gap-4">
          <Link
            href="/codearena/challenges"
            className="flex items-center hover:text-foreground/75 transition-colors duration-200"
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
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Leaderboard Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl sm:text-4xl font-bold">Leaderboard</h1>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-muted-foreground text-lg">Compete with other coders and climb the ranks!</p>
        </div>

        {/* User Stats Card */}
        {userProgress?.username && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <User className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{userProgress.username}</h3>
                  <p className="text-muted-foreground">Your Stats</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-500">{userRank ? `#${userRank}` : "Unranked"}</div>
                <div className="text-sm text-muted-foreground">Current Rank</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{userProgress.xp}</div>
                <div className="text-sm text-muted-foreground">Total XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{userProgress.level}</div>
                <div className="text-sm text-muted-foreground">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{userProgress.completedChallenges.length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">{userProgress.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Streak</div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">Top Players</h2>
            <p className="text-muted-foreground">Rankings based on total XP earned</p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-8 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Players Yet</h3>
              <p className="text-muted-foreground">Be the first to join the leaderboard!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {leaderboard.map((player, index) => {
                const rank = index + 1
                const isCurrentUser = player.username === userProgress?.username

                return (
                  <div
                    key={player.username}
                    className={`p-6 flex items-center justify-between hover:bg-accent/50 transition-colors ${
                      isCurrentUser ? "bg-blue-500/10 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getRankBadge(rank)}`}>
                        {rank <= 3 ? getRankIcon(rank) : <span className="font-bold">#{rank}</span>}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{player.username}</h3>
                          {isCurrentUser && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">You</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Level {player.level}</span>
                          <span>•</span>
                          <span>{player.completedChallenges} challenges</span>
                          <span>•</span>
                          <span>{player.currentStreak} day streak</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-yellow-500">{player.xp.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">XP</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Join Leaderboard CTA */}
        {!userProgress?.username && userProgress?.xp > 0 && (
          <div className="mt-8 text-center">
            <Button onClick={() => setShowUsernameDialog(true)} size="lg" className="bg-yellow-600 hover:bg-yellow-700">
              Join Leaderboard
            </Button>
          </div>
        )}
      </main>

      {/* Username Setup Dialog */}
      <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Join the Leaderboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Choose a username to compete with other players and track your progress on the leaderboard.
            </p>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetUsername()}
                maxLength={20}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUsernameDialog(false)} className="flex-1">
                Skip
              </Button>
              <Button
                onClick={handleSetUsername}
                disabled={!usernameInput.trim()}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                Join Leaderboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
