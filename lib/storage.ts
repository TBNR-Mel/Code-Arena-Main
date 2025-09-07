// Local storage utilities for user progress tracking with gamification
export interface UserProgress {
  xp: number
  completedChallenges: number[]
  currentStreak: number
  longestStreak: number
  level: number
  achievements: string[]
  lastCompletedDate?: string
  dailyChallenges?: {
    javascript?: {
      challengeId: number
      date: string
    }
    python?: {
      challengeId: number
      date: string
    }
    java?: {
      challengeId: number
      date: string
    }
    "c++"?: {
      challengeId: number
      date: string
    }
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
        dailyChallenges: progress.dailyChallenges || {},
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
    // JavaScript - Variables & Basic Operations (Concept 1)
    {
      id: 1,
      title: "Variables Concept: Declare and Use Variables",
      difficulty: "very easy",
      language: "javascript",
      concept: "variables",
    },
    {
      id: 2,
      title: "Variables Concept: Variable Assignment and Types",
      difficulty: "very easy",
      language: "javascript",
      concept: "variables",
    },
    {
      id: 3,
      title: "Variables Concept: Basic Arithmetic with Variables",
      difficulty: "easy",
      language: "javascript",
      concept: "variables",
    },
    {
      id: 4,
      title: "Variables Concept: Variable Scope Challenge",
      difficulty: "easy",
      language: "javascript",
      concept: "variables",
    },
    {
      id: 5,
      title: "Variables Concept: Complex Variable Operations",
      difficulty: "medium",
      language: "javascript",
      concept: "variables",
    },

    // JavaScript - Functions (Concept 2)
    {
      id: 6,
      title: "Functions Concept: Create Your First Function",
      difficulty: "very easy",
      language: "javascript",
      concept: "functions",
    },
    {
      id: 7,
      title: "Functions Concept: Function Parameters and Return",
      difficulty: "easy",
      language: "javascript",
      concept: "functions",
    },
    {
      id: 8,
      title: "Functions Concept: Arrow Functions",
      difficulty: "easy",
      language: "javascript",
      concept: "functions",
    },
    {
      id: 9,
      title: "Functions Concept: Higher-Order Functions",
      difficulty: "medium",
      language: "javascript",
      concept: "functions",
    },
    {
      id: 10,
      title: "Functions Concept: Function Closures",
      difficulty: "hard",
      language: "javascript",
      concept: "functions",
    },

    // JavaScript - Arrays (Concept 3)
    {
      id: 11,
      title: "Arrays Concept: Array Basics",
      difficulty: "very easy",
      language: "javascript",
      concept: "arrays",
    },
    {
      id: 12,
      title: "Arrays Concept: Array Methods - Push, Pop",
      difficulty: "easy",
      language: "javascript",
      concept: "arrays",
    },
    { id: 13, title: "Arrays Concept: Array Iteration", difficulty: "easy", language: "javascript", concept: "arrays" },
    {
      id: 14,
      title: "Arrays Concept: Array Filtering and Mapping",
      difficulty: "medium",
      language: "javascript",
      concept: "arrays",
    },
    {
      id: 15,
      title: "Arrays Concept: Complex Array Algorithms",
      difficulty: "hard",
      language: "javascript",
      concept: "arrays",
    },

    // JavaScript - Objects (Concept 4)
    {
      id: 16,
      title: "Objects Concept: Object Creation and Properties",
      difficulty: "easy",
      language: "javascript",
      concept: "objects",
    },
    {
      id: 17,
      title: "Objects Concept: Object Methods",
      difficulty: "easy",
      language: "javascript",
      concept: "objects",
    },
    {
      id: 18,
      title: "Objects Concept: Object Destructuring",
      difficulty: "medium",
      language: "javascript",
      concept: "objects",
    },
    {
      id: 19,
      title: "Objects Concept: Nested Objects",
      difficulty: "medium",
      language: "javascript",
      concept: "objects",
    },
    {
      id: 20,
      title: "Objects Concept: Object-Oriented Programming",
      difficulty: "hard",
      language: "javascript",
      concept: "objects",
    },

    // Python - Variables & Basic Operations (Concept 1)
    {
      id: 21,
      title: "Variables Concept: Python Variables and Types",
      difficulty: "very easy",
      language: "python",
      concept: "variables",
    },
    {
      id: 22,
      title: "Variables Concept: String Operations",
      difficulty: "very easy",
      language: "python",
      concept: "variables",
    },
    {
      id: 23,
      title: "Variables Concept: Number Operations",
      difficulty: "easy",
      language: "python",
      concept: "variables",
    },
    {
      id: 24,
      title: "Variables Concept: Type Conversion",
      difficulty: "easy",
      language: "python",
      concept: "variables",
    },
    {
      id: 25,
      title: "Variables Concept: Advanced Variable Manipulation",
      difficulty: "medium",
      language: "python",
      concept: "variables",
    },

    // Python - Control Flow (Concept 2)
    {
      id: 26,
      title: "Control Flow Concept: If Statements",
      difficulty: "very easy",
      language: "python",
      concept: "control-flow",
    },
    {
      id: 27,
      title: "Control Flow Concept: For Loops",
      difficulty: "easy",
      language: "python",
      concept: "control-flow",
    },
    {
      id: 28,
      title: "Control Flow Concept: While Loops",
      difficulty: "easy",
      language: "python",
      concept: "control-flow",
    },
    {
      id: 29,
      title: "Control Flow Concept: Nested Loops",
      difficulty: "medium",
      language: "python",
      concept: "control-flow",
    },
    {
      id: 30,
      title: "Control Flow Concept: Complex Conditional Logic",
      difficulty: "hard",
      language: "python",
      concept: "control-flow",
    },

    // Java - Basic Syntax (Concept 1)
    {
      id: 31,
      title: "Basics Concept: Hello World in Java",
      difficulty: "very easy",
      language: "java",
      concept: "basics",
    },
    {
      id: 32,
      title: "Basics Concept: Variables and Data Types",
      difficulty: "very easy",
      language: "java",
      concept: "basics",
    },
    { id: 33, title: "Basics Concept: Basic Input/Output", difficulty: "easy", language: "java", concept: "basics" },
    { id: 34, title: "Basics Concept: Method Creation", difficulty: "easy", language: "java", concept: "basics" },
    { id: 35, title: "Basics Concept: Class Structure", difficulty: "medium", language: "java", concept: "basics" },

    // C++ - Fundamentals (Concept 1)
    {
      id: 36,
      title: "Basics Concept: Hello World in C++",
      difficulty: "very easy",
      language: "c++",
      concept: "basics",
    },
    {
      id: 37,
      title: "Basics Concept: Variables and Constants",
      difficulty: "very easy",
      language: "c++",
      concept: "basics",
    },
    { id: 38, title: "Basics Concept: Basic I/O Operations", difficulty: "easy", language: "c++", concept: "basics" },
    { id: 39, title: "Basics Concept: Functions in C++", difficulty: "easy", language: "c++", concept: "basics" },
    {
      id: 40,
      title: "Basics Concept: Pointers and References",
      difficulty: "medium",
      language: "c++",
      concept: "basics",
    },
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

export function getDailyChallenge(
  language: string,
): { id: number; title: string; difficulty: string; language: string } | null {
  const challenges = [
    // JavaScript - Variables & Basic Operations (Concept 1)
    {
      id: 1,
      title: "Variables Concept: Declare and Use Variables",
      difficulty: "very easy",
      language: "javascript",
      concept: "variables",
    },
    {
      id: 2,
      title: "Variables Concept: Variable Assignment and Types",
      difficulty: "very easy",
      language: "javascript",
      concept: "variables",
    },
    {
      id: 3,
      title: "Variables Concept: Basic Arithmetic with Variables",
      difficulty: "easy",
      language: "javascript",
      concept: "variables",
    },
    {
      id: 4,
      title: "Variables Concept: Variable Scope Challenge",
      difficulty: "easy",
      language: "javascript",
      concept: "variables",
    },
    {
      id: 5,
      title: "Variables Concept: Complex Variable Operations",
      difficulty: "medium",
      language: "javascript",
      concept: "variables",
    },

    // JavaScript - Functions (Concept 2)
    {
      id: 6,
      title: "Functions Concept: Create Your First Function",
      difficulty: "very easy",
      language: "javascript",
      concept: "functions",
    },
    {
      id: 7,
      title: "Functions Concept: Function Parameters and Return",
      difficulty: "easy",
      language: "javascript",
      concept: "functions",
    },
    {
      id: 8,
      title: "Functions Concept: Arrow Functions",
      difficulty: "easy",
      language: "javascript",
      concept: "functions",
    },
    {
      id: 9,
      title: "Functions Concept: Higher-Order Functions",
      difficulty: "medium",
      language: "javascript",
      concept: "functions",
    },
    {
      id: 10,
      title: "Functions Concept: Function Closures",
      difficulty: "hard",
      language: "javascript",
      concept: "functions",
    },

    // JavaScript - Arrays (Concept 3)
    {
      id: 11,
      title: "Arrays Concept: Array Basics",
      difficulty: "very easy",
      language: "javascript",
      concept: "arrays",
    },
    {
      id: 12,
      title: "Arrays Concept: Array Methods - Push, Pop",
      difficulty: "easy",
      language: "javascript",
      concept: "arrays",
    },
    { id: 13, title: "Arrays Concept: Array Iteration", difficulty: "easy", language: "javascript", concept: "arrays" },
    {
      id: 14,
      title: "Arrays Concept: Array Filtering and Mapping",
      difficulty: "medium",
      language: "javascript",
      concept: "arrays",
    },
    {
      id: 15,
      title: "Arrays Concept: Complex Array Algorithms",
      difficulty: "hard",
      language: "javascript",
      concept: "arrays",
    },

    // JavaScript - Objects (Concept 4)
    {
      id: 16,
      title: "Objects Concept: Object Creation and Properties",
      difficulty: "easy",
      language: "javascript",
      concept: "objects",
    },
    {
      id: 17,
      title: "Objects Concept: Object Methods",
      difficulty: "easy",
      language: "javascript",
      concept: "objects",
    },
    {
      id: 18,
      title: "Objects Concept: Object Destructuring",
      difficulty: "medium",
      language: "javascript",
      concept: "objects",
    },
    {
      id: 19,
      title: "Objects Concept: Nested Objects",
      difficulty: "medium",
      language: "javascript",
      concept: "objects",
    },
    {
      id: 20,
      title: "Objects Concept: Object-Oriented Programming",
      difficulty: "hard",
      language: "javascript",
      concept: "objects",
    },

    // Python - Variables & Basic Operations (Concept 1)
    {
      id: 21,
      title: "Variables Concept: Python Variables and Types",
      difficulty: "very easy",
      language: "python",
      concept: "variables",
    },
    {
      id: 22,
      title: "Variables Concept: String Operations",
      difficulty: "very easy",
      language: "python",
      concept: "variables",
    },
    {
      id: 23,
      title: "Variables Concept: Number Operations",
      difficulty: "easy",
      language: "python",
      concept: "variables",
    },
    {
      id: 24,
      title: "Variables Concept: Type Conversion",
      difficulty: "easy",
      language: "python",
      concept: "variables",
    },
    {
      id: 25,
      title: "Variables Concept: Advanced Variable Manipulation",
      difficulty: "medium",
      language: "python",
      concept: "variables",
    },

    // Python - Control Flow (Concept 2)
    {
      id: 26,
      title: "Control Flow Concept: If Statements",
      difficulty: "very easy",
      language: "python",
      concept: "control-flow",
    },
    {
      id: 27,
      title: "Control Flow Concept: For Loops",
      difficulty: "easy",
      language: "python",
      concept: "control-flow",
    },
    {
      id: 28,
      title: "Control Flow Concept: While Loops",
      difficulty: "easy",
      language: "python",
      concept: "control-flow",
    },
    {
      id: 29,
      title: "Control Flow Concept: Nested Loops",
      difficulty: "medium",
      language: "python",
      concept: "control-flow",
    },
    {
      id: 30,
      title: "Control Flow Concept: Complex Conditional Logic",
      difficulty: "hard",
      language: "python",
      concept: "control-flow",
    },

    // Java - Basic Syntax (Concept 1)
    {
      id: 31,
      title: "Basics Concept: Hello World in Java",
      difficulty: "very easy",
      language: "java",
      concept: "basics",
    },
    {
      id: 32,
      title: "Basics Concept: Variables and Data Types",
      difficulty: "very easy",
      language: "java",
      concept: "basics",
    },
    { id: 33, title: "Basics Concept: Basic Input/Output", difficulty: "easy", language: "java", concept: "basics" },
    { id: 34, title: "Basics Concept: Method Creation", difficulty: "easy", language: "java", concept: "basics" },
    { id: 35, title: "Basics Concept: Class Structure", difficulty: "medium", language: "java", concept: "basics" },

    // C++ - Fundamentals (Concept 1)
    {
      id: 36,
      title: "Basics Concept: Hello World in C++",
      difficulty: "very easy",
      language: "c++",
      concept: "basics",
    },
    {
      id: 37,
      title: "Basics Concept: Variables and Constants",
      difficulty: "very easy",
      language: "c++",
      concept: "basics",
    },
    { id: 38, title: "Basics Concept: Basic I/O Operations", difficulty: "easy", language: "c++", concept: "basics" },
    { id: 39, title: "Basics Concept: Functions in C++", difficulty: "easy", language: "c++", concept: "basics" },
    {
      id: 40,
      title: "Basics Concept: Pointers and References",
      difficulty: "medium",
      language: "c++",
      concept: "basics",
    },
  ]

  const progress = getUserProgress()
  const today = new Date().toDateString()

  // Check if we already have a daily challenge for this language today
  const existingDaily = progress.dailyChallenges?.[language as keyof typeof progress.dailyChallenges]
  if (existingDaily && existingDaily.date === today) {
    const challenge = challenges.find((c) => c.id === existingDaily.challengeId)
    if (challenge) {
      return challenge
    }
  }

  // Select a new daily challenge from uncompleted challenges for this language
  const languageChallenges = challenges.filter(
    (challenge) => challenge.language === language && !progress.completedChallenges.includes(challenge.id),
  )

  if (languageChallenges.length > 0) {
    // Use date and language as seed for consistent daily selection
    const daysSinceEpoch = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24))
    const languageHash = language.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const seedValue = (daysSinceEpoch + languageHash) % languageChallenges.length
    const selectedChallenge = languageChallenges[seedValue]

    // Save the daily challenge for this language
    const updatedProgress = {
      ...progress,
      dailyChallenges: {
        ...progress.dailyChallenges,
        [language]: {
          challengeId: selectedChallenge.id,
          date: today,
        },
      },
    }
    saveUserProgress(updatedProgress)
    return selectedChallenge
  }

  return null
}

export function getDailyChallenges(): { id: number; title: string; difficulty: string; language: string }[] {
  const languages = ["javascript", "python", "java", "c++"]
  const dailyChallenges: { id: number; title: string; difficulty: string; language: string }[] = []

  languages.forEach((language) => {
    const dailyChallenge = getDailyChallenge(language)
    if (dailyChallenge) {
      dailyChallenges.push(dailyChallenge)
    }
  })

  return dailyChallenges
}

export function isDailyChallenge(challengeId: number): boolean {
  const progress = getUserProgress()
  const today = new Date().toDateString()

  if (!progress.dailyChallenges) return false

  // Check if this challenge ID matches any of the daily challenges for today
  const languages = ["javascript", "python", "java", "c++"]
  return languages.some((language) => {
    const dailyChallenge = progress.dailyChallenges?.[language as keyof typeof progress.dailyChallenges]
    return dailyChallenge?.challengeId === challengeId && dailyChallenge?.date === today
  })
}
