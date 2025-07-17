import express from "express"
import next from "next"
import { WebSocketServer, WebSocket } from "ws"
import { createServer } from "http"
import { RAW_MATERIALS, BID_DURATION, INITIAL_TEAM_TOKENS } from "./lib/constants.js"
import type { BiddingSession, Bid, TeamTokens } from "./types/index.js"

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

// WebSocket Bidding Manager
class WebSocketBiddingManager {
  private currentSession: BiddingSession | null = null
  private currentBids: Bid[] = []
  private timer: NodeJS.Timeout | null = null
  private teamTokens: TeamTokens = {
    "team-123": INITIAL_TEAM_TOKENS,
    "team-456": INITIAL_TEAM_TOKENS,
    "team-789": INITIAL_TEAM_TOKENS,
  }
  private wss: WebSocketServer | null = null

  setWebSocketServer(wss: WebSocketServer) {
    this.wss = wss
    console.log("📡 WebSocket server set in bidding manager")
  }

  private broadcast(message: Record<string, unknown>) {
    if (!this.wss) {
      console.log("⚠️ No WebSocket server available for broadcasting")
      return
    }

    const messageStr = JSON.stringify(message)
    let sentCount = 0

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr)
        sentCount++
      }
    })

    console.log(`📢 Broadcasted ${message.type} to ${sentCount} clients`)
  }

  startSession(materialId: string, bundleType: "large" | "small", totalBundles: number): BiddingSession {
    console.log(`🚀 Starting session: ${materialId}, ${bundleType}, ${totalBundles} bundles`)

    if (this.currentSession) {
      console.log("⏹️ Ending current session before starting new one")
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
    console.log(`⏰ Starting ${BID_DURATION}s timer`)

    this.timer = setInterval(() => {
      remainingTime--

      this.broadcast({
        type: "timer_update",
        data: { remainingTime },
      })

      if (remainingTime <= 0) {
        console.log("⏰ Timer expired, ending session")
        this.endCurrentSession()
      }
    }, 1000)
  }

  placeBid(teamId: string, teamName: string, teamCode: string, amount: number): Bid {
    console.log(`💰 Bid attempt: ${teamName} (${teamCode}) - ₹${amount}`)

    if (!this.currentSession || !this.currentSession.isActive) {
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

    // Mark previous bids as not winning
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

  private endCurrentSession() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    if (this.currentSession) {
      this.currentSession.isActive = false
      const winningBid = this.getCurrentHighestBid()

      // Deduct tokens from winning team
      if (winningBid) {
        this.teamTokens[winningBid.teamId] -= winningBid.amount
        this.currentSession.remainingBundles -= 1
        console.log(`🏆 Winner: ${winningBid.teamName} - ₹${winningBid.amount}`)
        console.log(`💰 ${winningBid.teamName} tokens: ${this.teamTokens[winningBid.teamId]}`)
      } else {
        console.log("⏰ Session ended with no bids")
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

const biddingManager = new WebSocketBiddingManager()

app.prepare().then(() => {
  const server = express()

  // Handle all Next.js routes
  server.get("*", (req, res) => handle(req, res))

  const port = Number.parseInt(process.env.PORT || "3000", 10)
  const httpServer = createServer(server)

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer })
  biddingManager.setWebSocketServer(wss)

  wss.on("connection", (ws, req) => {
    const clientIP = req.socket.remoteAddress
    console.log(`🔌 Client connected from ${clientIP}`)

    // Set up ping/pong for connection health
    let isAlive = true
    ws.on("pong", () => {
      isAlive = true
    })

    // Send ping every 30 seconds
    const pingInterval = setInterval(() => {
      if (!isAlive) {
        console.log(`💀 Terminating dead connection from ${clientIP}`)
        ws.terminate()
        return
      }
      isAlive = false
      ws.ping()
    }, 30000)

    // Send current data to new client
    const currentData = biddingManager.getCurrentData()
    ws.send(
      JSON.stringify({
        type: "initial_data",
        data: currentData,
      }),
    )
    console.log("📤 Sent initial data to new client")

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString())
        console.log("📨 Received message:", data.type)

        switch (data.type) {
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
              console.error("❌ Error starting session:", error)
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
              console.error("❌ Error placing bid:", error)
              ws.send(
                JSON.stringify({
                  type: "bid_place_response",
                  success: false,
                  error: error instanceof Error ? error.message : "Unknown error",
                }),
              )
            }
            break

          case "get_current_data":
            const currentData = biddingManager.getCurrentData()
            ws.send(
              JSON.stringify({
                type: "current_data_response",
                data: currentData,
              }),
            )
            console.log("📤 Sent current data to client")
            break

          case "ping":
            ws.send(JSON.stringify({ type: "pong" }))
            break
        }
      } catch (error) {
        console.error("❌ Error processing WebSocket message:", error)
      }
    })

    ws.on("close", (code, reason) => {
      clearInterval(pingInterval)
      console.log(`🔌 Client disconnected from ${clientIP} (${code}: ${reason})`)
    })

    ws.on("error", (error) => {
      clearInterval(pingInterval)
      console.error("❌ WebSocket error:", error)
    })
  })

  httpServer.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${port}`)
  console.log(`📡 WebSocket server ready on ws://localhost:${port}`)
  console.log(`👨‍💼 Admin portal: http://localhost:${port}/admin/bid`)
  console.log(`👥 User portal: http://localhost:${port}/bid`)
})
})
