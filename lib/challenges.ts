import { createClient } from "@/lib/supabase/server"
import type { Challenge, UserSubmission, UserProgress } from "@/lib/types"

export async function getChallenges(): Promise<Challenge[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("challenges").select("*").order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching challenges:", error)
    return []
  }

  return data || []
}

export async function getChallengeById(id: string): Promise<Challenge | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("challenges").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching challenge:", error)
    return null
  }

  return data
}

export async function getChallengesByDifficulty(difficulty: string): Promise<Challenge[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("difficulty", difficulty)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching challenges by difficulty:", error)
    return []
  }

  return data || []
}

export async function submitSolution(
  userId: string,
  challengeId: string,
  code: string,
  status: "passed" | "failed",
  score: number,
): Promise<UserSubmission | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("user_submissions")
    .upsert({
      user_id: userId,
      challenge_id: challengeId,
      code,
      status,
      score,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error submitting solution:", error)
    return null
  }

  return data
}

export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("user_progress").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found"
    console.error("Error fetching user progress:", error)
    return null
  }

  return data
}

export async function updateUserProgress(
  userId: string,
  pointsEarned: number,
  challengeCompleted = false,
): Promise<UserProgress | null> {
  const supabase = await createClient()

  // Get current progress or create new one
  const currentProgress = await getUserProgress(userId)

  if (!currentProgress) {
    // Create new progress record
    const { data, error } = await supabase
      .from("user_progress")
      .insert({
        user_id: userId,
        total_points: pointsEarned,
        challenges_completed: challengeCompleted ? 1 : 0,
        current_streak: challengeCompleted ? 1 : 0,
        longest_streak: challengeCompleted ? 1 : 0,
        last_submission_date: challengeCompleted ? new Date().toISOString().split("T")[0] : null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user progress:", error)
      return null
    }

    return data
  } else {
    // Update existing progress
    const today = new Date().toISOString().split("T")[0]
    const lastSubmissionDate = currentProgress.last_submission_date

    let newStreak = currentProgress.current_streak
    if (challengeCompleted) {
      if (lastSubmissionDate === today) {
        // Same day, don't update streak
      } else if (
        lastSubmissionDate &&
        new Date(lastSubmissionDate).getTime() === new Date(today).getTime() - 86400000
      ) {
        // Consecutive day, increment streak
        newStreak = currentProgress.current_streak + 1
      } else {
        // Not consecutive, reset streak
        newStreak = 1
      }
    }

    const { data, error } = await supabase
      .from("user_progress")
      .update({
        total_points: currentProgress.total_points + pointsEarned,
        challenges_completed: currentProgress.challenges_completed + (challengeCompleted ? 1 : 0),
        current_streak: newStreak,
        longest_streak: Math.max(currentProgress.longest_streak, newStreak),
        last_submission_date: challengeCompleted ? today : currentProgress.last_submission_date,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating user progress:", error)
      return null
    }

    return data
  }
}
