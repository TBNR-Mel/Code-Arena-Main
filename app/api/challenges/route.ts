import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let query = supabase.from("challenges").select("*").order("id")

    if (status) {
      query = query.eq("status", status)
    } else {
      // Default to only approved challenges for public API
      query = query.eq("status", "approved")
    }

    const { data: challenges, error } = await query

    if (error) {
      console.error("Error fetching challenges:", error)
      return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
    }

    return NextResponse.json(challenges)
  } catch (error) {
    console.error("Error in challenges API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const challenge = await request.json()

    const challengeData = {
      ...challenge,
      status: challenge.status || "approved",
    }

    const { data, error } = await supabase.from("challenges").insert([challengeData]).select().single()

    if (error) {
      console.error("Error creating challenge:", error)
      return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in challenges POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
