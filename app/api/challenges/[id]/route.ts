import { NextResponse } from "next/server"
import { getChallengeById } from "@/lib/challenges"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const challenge = await getChallengeById(id)

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    return NextResponse.json(challenge)
  } catch (error) {
    console.error("Error in challenge API:", error)
    return NextResponse.json({ error: "Failed to fetch challenge" }, { status: 500 })
  }
}
