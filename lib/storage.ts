// Local storage utilities for user progress tracking with gamification
export interface UserProgress {
  xp: number
  completedChallenges: number[]
  currentStreak: number
  longestStreak: number
  level: number
  achievements: string[]
  lastCompletedDate?: string
}

const STORAGE_KEY = "codearena_progress"

const DIFFICULTY_XP: Record<string, number> = {
  "very easy": 10,
  easy: 15,
  medium: 25,
  hard: 40,
  expert: 60,
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
): {
  progress: UserProgress
  isLevelUp: boolean
  xpEarned: number
} {
  const progress = getUserProgress()
  const previousLevel = progress.level

  if (!progress.completedChallenges.includes(challengeId)) {
    const xpEarned = getDifficultyXP(difficulty)
    const today = new Date().toDateString()
    const lastCompleted = progress.lastCompletedDate

    // Update XP and level
    progress.xp += xpEarned
    progress.level = calculateLevel(progress.xp)
    progress.completedChallenges.push(challengeId)

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

    // Check for achievements
    checkAndAwardAchievements(progress)

    const isLevelUp = progress.level > previousLevel

    saveUserProgress(progress)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("progressUpdate"))
    }

    return { progress, isLevelUp, xpEarned }
  }

  return { progress, isLevelUp: false, xpEarned: 0 }
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
    { id: 11, title: "Reverse a String", difficulty: "easy" },
    { id: 12, title: "Check for Prime Number", difficulty: "medium" },
    { id: 13, title: "Sum of Array Elements", difficulty: "easy" },
  ]

  const nextId = currentChallengeId + 1
  return challenges.find((c) => c.id === nextId) || null
}
