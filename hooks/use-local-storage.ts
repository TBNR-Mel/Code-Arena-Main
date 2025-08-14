"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}

export function useUserProgress() {
  const [xp, setXp] = useLocalStorage("c_arena_xp", 0)
  const [completedChallenges, setCompletedChallenges] = useLocalStorage<number[]>("c_arena_completed", [])

  const completeChallenge = (challengeId: number, xpReward = 10) => {
    if (!completedChallenges.includes(challengeId)) {
      setCompletedChallenges([...completedChallenges, challengeId])
      setXp(xp + xpReward)
    }
  }

  const isChallengeCompleted = (challengeId: number) => {
    return completedChallenges.includes(challengeId)
  }

  return {
    xp,
    completedChallenges,
    completeChallenge,
    isChallengeCompleted,
  }
}
