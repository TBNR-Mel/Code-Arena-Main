// Local storage utilities for user progress tracking with gamification
export interface UserProgress {
  xp: number
  completedChallenges: number[]
  currentStreak: number
  longestStreak: number
  level: number
  achievements: string[]
  lastCompletedDate?: string
  dailyChallenge?: {
    challengeId: number
    date: string
  }
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
        dailyChallenge: progress.dailyChallenge,
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

/**
 * Filter challenges by the language of the current challenge and prioritize those with the same or similar difficulty. Also ensure that completed challenges are skipped, ensuring a smoother progression.
 * @param currentChallengeId
 * @returns
 */

export function getNextChallenge(
  currentChallengeId: number,
  language = "javascript",
): { id: number; title: string; difficulty: string } | null {
  const challenges = [
    { id: 1, title: "Return the Sum of Two Numbers", difficulty: "very easy", language: "javascript" },
    { id: 2, title: "Area of a Triangle", difficulty: "very easy", language: "javascript" },
    { id: 3, title: "Convert Minutes into Seconds", difficulty: "very easy", language: "javascript" },
    { id: 4, title: "Find the Maximum Number in an Array", difficulty: "easy", language: "javascript" },
    { id: 5, title: "Check if a String is a Palindrome", difficulty: "medium", language: "python" },
    { id: 6, title: "Factorial of a Number", difficulty: "easy", language: "java" },
    { id: 7, title: "Fibonacci Sequence", difficulty: "medium", language: "javascript" },
    { id: 8, title: "Sort an Array", difficulty: "medium", language: "python" },
    { id: 9, title: "Binary Search", difficulty: "hard", language: "java" },
    { id: 10, title: "Count Vowels in a String", difficulty: "very easy", language: "javascript" },
    { id: 11, title: "Reverse a String", difficulty: "easy", language: "javascript" },
    { id: 12, title: "Check for Prime Number", difficulty: "medium", language: "javascript" },
    { id: 13, title: "Sum of Array Elements", difficulty: "easy", language: "javascript" },
    { id: 14, title: "Check for Anagram", difficulty: "medium", language: "python" },
    { id: 15, title: "Find First Non-Repeated Character", difficulty: "medium", language: "python" },
    { id: 16, title: "Power of a Number", difficulty: "easy", language: "python" },
  ]

  // Get completed challenges from user progress
  const progress = getUserProgress()
  const completedChallenges = progress.completedChallenges

  // Define difficulty hierarchy for fallback
  const difficultyOrder = ["very easy", "easy", "medium", "hard"]

  // Find the current challenge
  const currentChallenge = challenges.find((c) => c.id === currentChallengeId)
  if (!currentChallenge) return null

  const currentDifficulty = currentChallenge.difficulty
  const currentDifficultyIndex = difficultyOrder.indexOf(currentDifficulty)

  // Filter challenges by the provided language and exclude completed challenges
  const languageFilteredChallenges = challenges.filter(
    (c) => c.language === language && !completedChallenges.includes(c.id),
  )

  // Step 1: Find next challenge with the same difficulty and language
  const sameDifficultyChallenge = languageFilteredChallenges.find(
    (c) => c.id > currentChallengeId && c.difficulty === currentDifficulty,
  )
  if (sameDifficultyChallenge) return sameDifficultyChallenge

  // Step 2: Find next challenge with closest difficulty and same language
  for (let i = 1; i < difficultyOrder.length; i++) {
    const nextDifficultyUp = difficultyOrder[currentDifficultyIndex + i]
    const nextDifficultyDown = difficultyOrder[currentDifficultyIndex - i]

    const nextChallenge = languageFilteredChallenges.find(
      (c) => c.id > currentChallengeId && (c.difficulty === nextDifficultyUp || c.difficulty === nextDifficultyDown),
    )
    if (nextChallenge) return nextChallenge
  }

  // Step 3: Fallback to next sequential challenge in the same language
  const nextId = currentChallengeId + 1
  return languageFilteredChallenges.find((c) => c.id === nextId) || null
}

export function getDailyChallenge(): { id: number; title: string; difficulty: string; language: string } | null {
  const challenges = [
    { id: 1, title: "Return the Sum of Two Numbers", difficulty: "very easy", language: "javascript" },
    { id: 2, title: "Area of a Triangle", difficulty: "very easy", language: "javascript" },
    { id: 3, title: "Convert Minutes into Seconds", difficulty: "very easy", language: "javascript" },
    { id: 4, title: "Find the Maximum Number in an Array", difficulty: "easy", language: "javascript" },
    { id: 5, title: "Check if a String is a Palindrome", difficulty: "medium", language: "python" },
    { id: 6, title: "Factorial of a Number", difficulty: "easy", language: "java" },
    { id: 7, title: "Fibonacci Sequence", difficulty: "medium", language: "javascript" },
    { id: 8, title: "Sort an Array", difficulty: "medium", language: "python" },
    { id: 9, title: "Binary Search", difficulty: "hard", language: "java" },
    { id: 10, title: "Count Vowels in a String", difficulty: "very easy", language: "javascript" },
    { id: 11, title: "Reverse a String", difficulty: "easy", language: "javascript" },
    { id: 12, title: "Check for Prime Number", difficulty: "medium", language: "javascript" },
    { id: 13, title: "Sum of Array Elements", difficulty: "easy", language: "javascript" },
    { id: 14, title: "Check for Anagram", difficulty: "medium", language: "python" },
    { id: 15, title: "Find First Non-Repeated Character", difficulty: "medium", language: "python" },
    { id: 16, title: "Power of a Number", difficulty: "easy", language: "python" },
  ]

  const progress = getUserProgress()
  const today = new Date().toDateString()

  // Check if we already have a daily challenge for today
  if (progress.dailyChallenge && progress.dailyChallenge.date === today) {
    const challenge = challenges.find((c) => c.id === progress.dailyChallenge!.challengeId)
    return challenge || null
  }

  // Select a new daily challenge from uncompleted challenges
  const uncompletedChallenges = challenges.filter((challenge) => !progress.completedChallenges.includes(challenge.id))

  if (uncompletedChallenges.length === 0) {
    return null // All challenges completed
  }

  // Use date as seed for consistent daily selection
  const dateNumber = new Date().getDate() + new Date().getMonth() * 31 + new Date().getFullYear() * 365
  const selectedChallenge = uncompletedChallenges[dateNumber % uncompletedChallenges.length]

  // Save the daily challenge
  const updatedProgress = {
    ...progress,
    dailyChallenge: {
      challengeId: selectedChallenge.id,
      date: today,
    },
  }
  saveUserProgress(updatedProgress)

  return selectedChallenge
}

export function isDailyChallenge(challengeId: number): boolean {
  const progress = getUserProgress()
  const today = new Date().toDateString()

  return progress.dailyChallenge?.challengeId === challengeId && progress.dailyChallenge?.date === today
}
