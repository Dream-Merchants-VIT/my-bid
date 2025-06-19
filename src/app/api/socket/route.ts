import { type NextRequest, NextResponse } from "next/server"
import { getSocketIOServer } from "@/lib/socket"

export async function GET(request: NextRequest) {
  try {
    getSocketIOServer()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Socket initialization error:", error)
    return NextResponse.json({ error: "Failed to initialize socket" }, { status: 500 })
  }
}
