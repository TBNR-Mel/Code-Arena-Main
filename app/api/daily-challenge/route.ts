import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getDailyChallenge } from "@/lib/daily-challenges"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dailyChallenge = await getDailyChallenge(user.id)

    return NextResponse.json({ dailyChallenge })
  } catch (error) {
    console.error("Error fetching daily challenge:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
