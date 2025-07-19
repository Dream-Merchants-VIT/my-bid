import { WebSocketServer, WebSocket } from "ws"
import { createServer } from "http"
import { RAW_MATERIALS, BID_DURATION, INITIAL_TEAM_TOKENS } from "./lib/constants.js"
import type { BiddingSession, Bid, TeamTokens } from "../types/index.js"
import dotenv from "dotenv";
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { eq, sql} from "drizzle-orm"
import { teams as teamsTable } from "./lib/db/schema"

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)

// WebSocket Bidding Manager
class BiddingManager {
  private currentSession: BiddingSession | null = null
  private currentBids: Bid[] = []
  private timer: NodeJS.Timeout | null = null
  private teamTokens: TeamTokens = {
    "team-123": INITIAL_TEAM_TOKENS,
    "team-456": INITIAL_TEAM_TOKENS,
    "team-789": INITIAL_TEAM_TOKENS,
  }
  private clients: Set<WebSocket> = new Set()

  addClient(ws: WebSocket) {
    this.clients.add(ws)
    console.log(`📊 Total clients: ${this.clients.size}`)
  }

  removeClient(ws: WebSocket) {
    this.clients.delete(ws)
    console.log(`📊 Total clients: ${this.clients.size}`)
  }

  private broadcast(message: Record<string, unknown>, excludeClient?: WebSocket) {
    const messageStr = JSON.stringify(message)
    let sentCount = 0

    this.clients.forEach((client) => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr)
          sentCount++
        } catch (error) {
          console.error("Error sending message to client:", error)
          this.clients.delete(client)
        }
      }
    })

    console.log(`📢 Broadcasted ${message.type} to ${sentCount} clients`)
  }

  startSession(materialId: string, bundleType: "large" | "small", totalBundles: number): BiddingSession {
    console.log(`🚀 Starting session: ${materialId}, ${bundleType}, ${totalBundles} bundles`)

    if (this.currentSession?.isActive) {
      this.endCurrentSession()
    }

    const material = RAW_MATERIALS.find((m) => m.id === materialId)
    if (!material) {
      throw new Error("Invalid material ID")
    }

    const basePrice = bundleType === "large" ? material.largeBundlePrice : material.smallBundlePrice
    if (!basePrice) {
      throw new Error("Invalid bundle type for this material")
    }

    const now = new Date()
    this.currentSession = {
      id: `session_${Date.now()}`,
      materialId,
      materialName: material.name,
      bundleType,
      basePrice,
      startTime: now,
      endTime: new Date(now.getTime() + BID_DURATION * 1000),
      isActive: true,
      totalBundles,
      remainingBundles: totalBundles,
    }

    this.currentBids = []

    this.broadcast({
      type: "session_started",
      data: {
        session: this.currentSession,
        teamTokens: this.teamTokens,
      },
    })

    this.startTimer()
    console.log(`✅ Session started: ${this.currentSession.id}`)
    return this.currentSession
  }

  private startTimer() {
    if (this.timer) {
      clearInterval(this.timer)
    }

    let remainingTime = BID_DURATION

    this.timer = setInterval(() => {
      remainingTime--

      this.broadcast({
        type: "timer_update",
        data: { remainingTime },
      })

      if (remainingTime <= 0) {
        this.endCurrentSession()
      }
    }, 1000)
  }

  placeBid(teamId: string, teamName: string, teamCode: string, amount: number): Bid {
    if (!this.currentSession?.isActive) {
      throw new Error("No active bidding session")
    }

    const teamTokens = this.teamTokens[teamId] || INITIAL_TEAM_TOKENS
    if (amount > teamTokens) {
      throw new Error("Insufficient tokens")
    }

    const currentHighestBid = this.getCurrentHighestBid()
    const minimumBid = currentHighestBid ? currentHighestBid.amount + 1 : this.currentSession.basePrice

    if (amount < minimumBid) {
      throw new Error(`Bid must be at least ₹${minimumBid}`)
    }

    this.currentBids.forEach((bid) => {
      bid.isWinning = false
    })

    const bid: Bid = {
      id: `bid_${Date.now()}`,
      sessionId: this.currentSession.id,
      teamId,
      teamName,
      teamCode,
      amount,
      timestamp: new Date(),
      isWinning: true,
    }

    this.currentBids.push(bid)

    this.broadcast({
      type: "new_bid",
      data: {
        bid,
        session: this.currentSession,
        teamTokens: this.teamTokens,
      },
    })

    console.log(`✅ Bid placed: ${teamName} - ₹${amount}`)
    return bid
  }

  getCurrentHighestBid(): Bid | null {
    if (this.currentBids.length === 0) return null
    return this.currentBids.reduce((highest, current) => (current.amount > highest.amount ? current : highest))
  }

  private async endCurrentSession() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    if (this.currentSession) {
      this.currentSession.isActive = false
      const winningBid = this.getCurrentHighestBid()

      if (winningBid) {
        // 1. Update in-memory token balance
        this.teamTokens[winningBid.teamId] -= winningBid.amount
        this.currentSession.remainingBundles -= 1

        // 2. Update token balance in database
        await db
          .update(teamsTable)
          .set({
            tokens: sql`${teamsTable.tokens} - ${winningBid.amount}`,
          })
          .where(eq(teamsTable.id, winningBid.teamId))
      }

      this.broadcast({
        type: "session_ended",
        data: {
          session: this.currentSession,
          winningBid,
          allBids: this.currentBids,
          teamTokens: this.teamTokens,
        },
      })

      console.log(`⏹️ Session ended: ${this.currentSession.id}`)
    }
  }

  getCurrentData() {
    return {
      session: this.currentSession,
      bids: this.currentBids,
      highestBid: this.getCurrentHighestBid(),
      teamTokens: this.teamTokens,
    }
  }
}

const biddingManager = new BiddingManager()

// Create dedicated WebSocket server
const WS_PORT = 3001
const server = createServer()
const wss = new WebSocketServer({ server })

wss.on("connection", (ws, req) => {
  const clientIP = req.socket.remoteAddress
  console.log(`🔌 WebSocket client connected from ${clientIP}`)

  biddingManager.addClient(ws)

  // Send current data immediately
  try {
    const currentData = biddingManager.getCurrentData()
    ws.send(
      JSON.stringify({
        type: "initial_data",
        data: currentData,
      }),
    )
  } catch (error) {
    console.error("Error sending initial data:", error)
  }

  // Handle incoming messages
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString())
      console.log(`📨 Received from ${clientIP}:`, data.type)

      switch (data.type) {
        case "ping":
          ws.send(JSON.stringify({ type: "pong" }))
          break

        case "get_current_data":
          const currentData = biddingManager.getCurrentData()
          ws.send(
            JSON.stringify({
              type: "current_data_response",
              data: currentData,
            }),
          )
          break

        case "start_session":
          try {
            const session = biddingManager.startSession(data.materialId, data.bundleType, data.totalBundles)
            ws.send(
              JSON.stringify({
                type: "session_start_response",
                success: true,
                session,
              }),
            )
          } catch (error) {
            ws.send(
              JSON.stringify({
                type: "session_start_response",
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              }),
            )
          }
          break

        case "place_bid":
          try {
            const bid = biddingManager.placeBid(data.teamId, data.teamName, data.teamCode, data.amount)
            ws.send(
              JSON.stringify({
                type: "bid_place_response",
                success: true,
                bid,
              }),
            )
          } catch (error) {
            ws.send(
              JSON.stringify({
                type: "bid_place_response",
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              }),
            )
          }
          break
      }
    } catch (error) {
      console.error("Error processing message:", error)
    }
  })

  // Handle connection close
  ws.on("close", (code, reason) => {
    console.log(`🔌 WebSocket client disconnected from ${clientIP} (${code}: ${reason})`)
    biddingManager.removeClient(ws)
  })

  // Handle errors
  ws.on("error", (error) => {
    console.error(`❌ WebSocket error from ${clientIP}:`, error)
    biddingManager.removeClient(ws)
  })
})

server.listen(WS_PORT, () => {
  console.log(`📡 WebSocket server running on ws://localhost:${WS_PORT}`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Shutting down WebSocket server...")
  wss.close(() => {
    server.close(() => {
      process.exit(0)
    })
  })
})
