import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: challenges, error } = await supabase.from("challenges").select("*").order("id")

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

    const { data, error } = await supabase.from("challenges").insert([challenge]).select().single()

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
