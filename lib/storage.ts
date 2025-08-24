// Local storage utilities for user progress tracking
export interface UserProgress {
  xp: number
  completedChallenges: number[]
  currentStreak: number
}

const STORAGE_KEY = "codearena_progress"

export function getUserProgress(): UserProgress {
  if (typeof window === "undefined") {
    return { xp: 0, completedChallenges: [], currentStreak: 0 }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Error reading user progress:", error)
  }

  return { xp: 0, completedChallenges: [], currentStreak: 0 }
}

export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (error) {
    console.error("Error saving user progress:", error)
  }
}

export function markChallengeComplete(challengeId: number): UserProgress {
  const progress = getUserProgress()

  if (!progress.completedChallenges.includes(challengeId)) {
    progress.completedChallenges.push(challengeId)
    progress.xp += 10
    progress.currentStreak += 1
  }

  saveUserProgress(progress)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event("progressUpdate"))
  }
  return progress
}

export function isChallengeCompleted(challengeId: number): boolean {
  const progress = getUserProgress()
  return progress.completedChallenges.includes(challengeId)
}
