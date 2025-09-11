export interface Challenge {
  id: number
  title: string
  description: string
  difficulty: "very easy" | "easy" | "medium" | "hard" | "expert"
  language: "javascript" | "python" | "java" | "c++"
  tags: string[]
  concept?: string
  starter_code?: string
  solution?: string
  test_cases?: any[]
  created_at?: string
  updated_at?: string
}

export interface UserProgress {
  id: string
  user_id: string
  xp: number
  level: number
  current_streak: number
  longest_streak: number
  last_completed_date?: string
  created_at?: string
  updated_at?: string
}

export interface UserChallengeCompletion {
  id: string
  user_id: string
  challenge_id: number
  completed_at: string
  xp_earned: number
}
