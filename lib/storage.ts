// Local storage utilities for user progress tracking with gamification
export interface UserProgress {
  xp: number
  completedChallenges: number[]
  currentStreak: number
  longestStreak: number
  level: number
  achievements: string[]
  lastCompletedDate?: string
  dailyChallengeCompleted?: string // Date string for daily challenge
  totalXpMultiplier: number // For 2x XP rewards
  streakRewards: StreakReward[]
  username?: string // For leaderboard
  joinDate: string
}

export interface StreakReward {
  streakDay: number
  rewardType: "xp_multiplier" | "bonus_xp" | "achievement"
  value: number
  claimed: boolean
  dateEarned: string
}

export interface LeaderboardEntry {
  username: string
  xp: number
  level: number
  currentStreak: number
  completedChallenges: number
  joinDate: string
}

export interface DailyChallenge {
  id: number
  date: string
  title: string
  description: string
  difficulty: "hard" | "expert"
  xpReward: number
  testCases: Array<{ input: any[]; expected: any }>
  starterCode: string
}

const STORAGE_KEY = "codearena_progress"

const DIFFICULTY_XP: Record<string, number> = {
  "very easy": 10,
  easy: 15,
  medium: 25,
  hard: 40,
  expert: 60,
}

const DAILY_CHALLENGE_XP: Record<string, number> = {
  hard: 100,
  expert: 150,
}

const STREAK_REWARDS: Record<number, StreakReward> = {
  3: { streakDay: 3, rewardType: "bonus_xp", value: 50, claimed: false, dateEarned: "" },
  7: { streakDay: 7, rewardType: "xp_multiplier", value: 2, claimed: false, dateEarned: "" },
  14: { streakDay: 14, rewardType: "bonus_xp", value: 200, claimed: false, dateEarned: "" },
  30: { streakDay: 30, rewardType: "xp_multiplier", value: 3, claimed: false, dateEarned: "" },
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1
}

export function getXPForNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp)
  return currentLevel * 100 - currentXp
}

export function getDifficultyXP(difficulty: string): number {
  return DIFFICULTY_XP[difficulty.toLowerCase()] || 10
}

export function getUserProgress(): UserProgress {
  if (typeof window === "undefined") {
    return {
      xp: 0,
      completedChallenges: [],
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      achievements: [],
      totalXpMultiplier: 1,
      streakRewards: [],
      joinDate: new Date().toISOString(),
    }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const progress = JSON.parse(stored)
      return {
        xp: progress.xp || 0,
        completedChallenges: progress.completedChallenges || [],
        currentStreak: progress.currentStreak || 0,
        longestStreak: progress.longestStreak || progress.currentStreak || 0,
        level: progress.level || calculateLevel(progress.xp || 0),
        achievements: progress.achievements || [],
        lastCompletedDate: progress.lastCompletedDate,
        dailyChallengeCompleted: progress.dailyChallengeCompleted,
        totalXpMultiplier: progress.totalXpMultiplier || 1,
        streakRewards: progress.streakRewards || [],
        username: progress.username,
        joinDate: progress.joinDate || new Date().toISOString(),
      }
    }
  } catch (error) {
    console.error("Error reading user progress:", error)
  }

  return {
    xp: 0,
    completedChallenges: [],
    currentStreak: 0,
    longestStreak: 0,
    level: 1,
    achievements: [],
    totalXpMultiplier: 1,
    streakRewards: [],
    joinDate: new Date().toISOString(),
  }
}

export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (error) {
    console.error("Error saving user progress:", error)
  }
}

export function markChallengeComplete(
  challengeId: number,
  difficulty = "very easy",
  isDailyChallenge = false,
): {
  progress: UserProgress
  isLevelUp: boolean
  xpEarned: number
  newRewards: StreakReward[]
} {
  const progress = getUserProgress()
  const previousLevel = progress.level

  if (!progress.completedChallenges.includes(challengeId) || isDailyChallenge) {
    const baseXp = isDailyChallenge ? DAILY_CHALLENGE_XP[difficulty] || 100 : getDifficultyXP(difficulty)
    const xpEarned = Math.floor(baseXp * progress.totalXpMultiplier)
    const today = new Date().toDateString()
    const lastCompleted = progress.lastCompletedDate

    // Update XP and level
    progress.xp += xpEarned
    progress.level = calculateLevel(progress.xp)

    if (!isDailyChallenge) {
      progress.completedChallenges.push(challengeId)
    } else {
      progress.dailyChallengeCompleted = today
    }

    // Update streaks
    if (lastCompleted === today) {
      // Same day, don't increment streak
    } else if (lastCompleted === new Date(Date.now() - 86400000).toDateString()) {
      // Yesterday, continue streak
      progress.currentStreak += 1
    } else {
      // Streak broken or first challenge
      progress.currentStreak = 1
    }

    progress.longestStreak = Math.max(progress.longestStreak, progress.currentStreak)
    progress.lastCompletedDate = today

    // Check for new streak rewards
    const newRewards = checkStreakRewards(progress)

    // Check for achievements
    checkAndAwardAchievements(progress)

    const isLevelUp = progress.level > previousLevel

    saveUserProgress(progress)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("progressUpdate"))
    }

    return { progress, isLevelUp, xpEarned, newRewards }
  }

  return { progress, isLevelUp: false, xpEarned: 0, newRewards: [] }
}

function checkAndAwardAchievements(progress: UserProgress): void {
  const achievements = [...progress.achievements]

  // First challenge
  if (progress.completedChallenges.length === 1 && !achievements.includes("first_steps")) {
    achievements.push("first_steps")
  }

  // Streak achievements
  if (progress.currentStreak >= 3 && !achievements.includes("streak_3")) {
    achievements.push("streak_3")
  }
  if (progress.currentStreak >= 7 && !achievements.includes("streak_7")) {
    achievements.push("streak_7")
  }

  // Challenge count achievements
  if (progress.completedChallenges.length >= 5 && !achievements.includes("challenger")) {
    achievements.push("challenger")
  }
  if (progress.completedChallenges.length >= 10 && !achievements.includes("expert")) {
    achievements.push("expert")
  }

  // Level achievements
  if (progress.level >= 5 && !achievements.includes("level_5")) {
    achievements.push("level_5")
  }

  progress.achievements = achievements
}

function checkStreakRewards(progress: UserProgress): StreakReward[] {
  const newRewards: StreakReward[] = []
  const today = new Date().toISOString()

  Object.values(STREAK_REWARDS).forEach((reward) => {
    if (progress.currentStreak >= reward.streakDay) {
      const existingReward = progress.streakRewards.find((r) => r.streakDay === reward.streakDay)
      if (!existingReward) {
        const newReward = { ...reward, dateEarned: today }
        progress.streakRewards.push(newReward)
        newRewards.push(newReward)
      }
    }
  })

  return newRewards
}

export function claimStreakReward(streakDay: number): boolean {
  const progress = getUserProgress()
  const reward = progress.streakRewards.find((r) => r.streakDay === streakDay && !r.claimed)

  if (reward) {
    reward.claimed = true

    if (reward.rewardType === "xp_multiplier") {
      progress.totalXpMultiplier = Math.max(progress.totalXpMultiplier, reward.value)
    } else if (reward.rewardType === "bonus_xp") {
      progress.xp += reward.value
      progress.level = calculateLevel(progress.xp)
    }

    saveUserProgress(progress)
    return true
  }

  return false
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem("codearena_leaderboard")
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error reading leaderboard:", error)
    return []
  }
}

export function updateLeaderboard(progress: UserProgress): void {
  if (typeof window === "undefined" || !progress.username) return

  try {
    const leaderboard = getLeaderboard()
    const existingIndex = leaderboard.findIndex((entry) => entry.username === progress.username)

    const entry: LeaderboardEntry = {
      username: progress.username,
      xp: progress.xp,
      level: progress.level,
      currentStreak: progress.currentStreak,
      completedChallenges: progress.completedChallenges.length,
      joinDate: progress.joinDate,
    }

    if (existingIndex >= 0) {
      leaderboard[existingIndex] = entry
    } else {
      leaderboard.push(entry)
    }

    // Sort by XP descending
    leaderboard.sort((a, b) => b.xp - a.xp)

    localStorage.setItem("codearena_leaderboard", JSON.stringify(leaderboard))
  } catch (error) {
    console.error("Error updating leaderboard:", error)
  }
}

export function getTodaysDailyChallenge(): DailyChallenge | null {
  const today = new Date().toDateString()
  const challenges: DailyChallenge[] = [
    {
      id: 101,
      date: today,
      title: "Implement Binary Tree Traversal",
      description: "Write a function that performs in-order traversal of a binary tree",
      difficulty: "hard",
      xpReward: 100,
      testCases: [
        { input: [[1, null, 2, 3]], expected: [1, 3, 2] },
        { input: [[]], expected: [] },
      ],
      starterCode: `function inorderTraversal(root) {
  // Your code here
  return [];
}`,
    },
    // More daily challenges can be added here
  ]

  return challenges[0] // For now, return the first challenge
}

export function isDailyChallengeCompleted(): boolean {
  const progress = getUserProgress()
  const today = new Date().toDateString()
  return progress.dailyChallengeCompleted === today
}

export function setUsername(username: string): void {
  const progress = getUserProgress()
  progress.username = username
  saveUserProgress(progress)
  updateLeaderboard(progress)
}

export function isChallengeCompleted(challengeId: number): boolean {
  const progress = getUserProgress()
  return progress.completedChallenges.includes(challengeId)
}

export function getNextChallenge(currentChallengeId: number): { id: number; title: string; difficulty: string } | null {
  const challenges = [
    { id: 1, title: "Return the Sum of Two Numbers", difficulty: "very easy" },
    { id: 2, title: "Area of a Triangle", difficulty: "very easy" },
    { id: 3, title: "Convert Minutes into Seconds", difficulty: "very easy" },
    { id: 4, title: "Find the Maximum Number in an Array", difficulty: "easy" },
    { id: 5, title: "Check if a String is a Palindrome", difficulty: "medium" },
    { id: 6, title: "Factorial of a Number", difficulty: "easy" },
    { id: 7, title: "Fibonacci Sequence", difficulty: "medium" },
    { id: 8, title: "Sort an Array", difficulty: "medium" },
    { id: 9, title: "Binary Search", difficulty: "hard" },
    { id: 10, title: "Count Vowels in a String", difficulty: "very easy" },
  ]

  const nextId = currentChallengeId + 1
  return challenges.find((c) => c.id === nextId) || null
}
