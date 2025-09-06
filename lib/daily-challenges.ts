import { createClient } from "@/lib/supabase/server"

export async function getDailyChallenge(userId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]

  // Check if user already has a daily challenge for today
  const { data: existingDaily } = await supabase
    .from("daily_challenges")
    .select(`
      *,
      challenges (*)
    `)
    .eq("user_id", userId)
    .eq("assigned_date", today)
    .single()

  if (existingDaily) {
    return existingDaily
  }

  // Get user's completed challenges
  const { data: completedChallenges } = await supabase
    .from("user_progress")
    .select("challenge_id")
    .eq("user_id", userId)

  const completedIds = completedChallenges?.map((c) => c.challenge_id) || []

  // Get available challenges (not completed)
  const { data: availableChallenges } = await supabase
    .from("challenges")
    .select("*")
    .not("id", "in", `(${completedIds.length > 0 ? completedIds.join(",") : "0"})`)

  if (!availableChallenges || availableChallenges.length === 0) {
    return null // No more challenges available
  }

  // Select a random challenge from available ones
  const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)]

  // Create daily challenge assignment
  const { data: newDaily } = await supabase
    .from("daily_challenges")
    .insert({
      user_id: userId,
      challenge_id: randomChallenge.id,
      assigned_date: today,
    })
    .select(`
      *,
      challenges (*)
    `)
    .single()

  return newDaily
}

export async function markDailyChallengeComplete(userId: string, challengeId: number) {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]

  await supabase
    .from("daily_challenges")
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .eq("assigned_date", today)
}
