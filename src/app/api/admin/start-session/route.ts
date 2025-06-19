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
    const { materialId, bundleType, totalBundles } = body

    if (!materialId || !bundleType || !totalBundles) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const biddingSession = biddingManager.startSession(materialId, bundleType, totalBundles)

    return NextResponse.json({ success: true, session: biddingSession })
  } catch (error) {
    console.error("Error starting session:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
