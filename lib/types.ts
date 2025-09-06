export interface Challenge {
  id: string
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  category: string
  starter_code?: string
  solution?: string
  test_cases: TestCase[]
  points: number
  created_at: string
  updated_at: string
}

export interface TestCase {
  input: any[]
  expected: any
}

export interface UserSubmission {
  id: string
  user_id: string
  challenge_id: string
  code: string
  status: "pending" | "passed" | "failed"
  score: number
  submitted_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  total_points: number
  challenges_completed: number
  current_streak: number
  longest_streak: number
  last_submission_date?: string
  created_at: string
  updated_at: string
}
