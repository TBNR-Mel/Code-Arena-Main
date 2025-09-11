import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const challengeId = Number.parseInt(params.id)

    const { data: challenge, error } = await supabase.from("challenges").select("*").eq("id", challengeId).single()

    if (error) {
      console.error("Error fetching challenge:", error)
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    return NextResponse.json(challenge)
  } catch (error) {
    console.error("Error in challenge API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const challengeId = Number.parseInt(params.id)

    const { error } = await supabase.from("challenges").delete().eq("id", challengeId)

    if (error) {
      console.error("Error deleting challenge:", error)
      return NextResponse.json({ error: "Failed to delete challenge" }, { status: 500 })
    }

    return NextResponse.json({ message: "Challenge deleted successfully" })
  } catch (error) {
    console.error("Error in challenge DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
