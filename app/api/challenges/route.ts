import { NextResponse } from "next/server"
import { getChallenges } from "@/lib/challenges"

export async function GET() {
  try {
    const challenges = await getChallenges()
    return NextResponse.json(challenges)
  } catch (error) {
    console.error("Error in challenges API:", error)
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
  }
}
