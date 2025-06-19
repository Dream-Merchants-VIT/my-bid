import { NextResponse } from "next/server"
import { biddingManager } from "@/lib/bidding-manager"

export async function GET() {
  try {
    const currentSession = biddingManager.getCurrentSession()
    const currentBids = biddingManager.getCurrentBids()
    const highestBid = biddingManager.getCurrentHighestBid()
    const teamTokens = biddingManager.getAllTeamTokens()

    return NextResponse.json({
      session: currentSession,
      bids: currentBids,
      highestBid,
      teamTokens,
    })
  } catch (error) {
    console.error("Error fetching current bid data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
