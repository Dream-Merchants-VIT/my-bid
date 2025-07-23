import { NextResponse } from "next/server"
import { db } from "@db/index"
import { teams } from "@db/schema"

export async function GET() {
  try {
    const result = await db.select({
      id: teams.id,
      tokens: teams.tokens,
      name: teams.name,
    }).from(teams)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch team tokens:", error)
    return new NextResponse("Error fetching team tokens", { status: 500 })
  }
}
