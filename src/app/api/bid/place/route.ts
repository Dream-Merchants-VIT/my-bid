import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { biddingManager } from "@/lib/bidding-manager"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { teamId, teamName, teamCode, amount } = body

    if (!teamId || !teamName || !teamCode || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const bid = biddingManager.placeBid(teamId, teamName, teamCode, amount)

    return NextResponse.json({ success: true, bid })
  } catch (error) {
    console.error("Error placing bid:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
