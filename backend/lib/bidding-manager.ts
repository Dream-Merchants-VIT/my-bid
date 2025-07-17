import type { BiddingSession, Bid, TeamTokens } from "../../types"
import { RAW_MATERIALS, BID_DURATION, LOW_STOCK_NOTIFICATIONS, INITIAL_TEAM_TOKENS } from "../lib/constants"
import { broadcastToRoom } from "../lib/socket"

class BiddingManager {
  private currentSession: BiddingSession | null = null
  private currentBids: Bid[] = []
  private timer: NodeJS.Timeout | null = null
  private teamTokens: TeamTokens = {}

  initializeTeamTokens(teams: Array<{ id: string; tokens?: number }>) {
    teams.forEach((team) => {
      this.teamTokens[team.id] = team.tokens || INITIAL_TEAM_TOKENS
    })
  }

  getTeamTokens(teamId: string): number {
    return this.teamTokens[teamId] || INITIAL_TEAM_TOKENS
  }

  startSession(materialId: string, bundleType: "large" | "small", totalBundles: number): BiddingSession {
    if (this.currentSession) {
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
    const endTime = new Date(now.getTime() + BID_DURATION * 1000)

    this.currentSession = {
      id: `session_${Date.now()}`,
      materialId,
      materialName: material.name,
      bundleType,
      basePrice,
      startTime: now,
      endTime,
      isActive: true,
      totalBundles,
      remainingBundles: totalBundles,
    }

    this.currentBids = []

    broadcastToRoom("bidding", {
      type: "session_started",
      data: {
        session: this.currentSession,
        material: material,
        teamTokens: this.teamTokens,
      },
    })

    this.startTimer()
    return this.currentSession
  }

  private startTimer() {
    if (this.timer) {
      clearInterval(this.timer)
    }

    let remainingTime = BID_DURATION

    this.timer = setInterval(() => {
      remainingTime--

      broadcastToRoom("bidding", {
        type: "timer_update",
        data: { remainingTime },
      })

      if (remainingTime <= 0) {
        this.endCurrentSession()
      }
    }, 1000)
  }

  placeBid(teamId: string, teamName: string, teamCode: string, amount: number): Bid {
    if (!this.currentSession || !this.currentSession.isActive) {
      throw new Error("No active bidding session")
    }

    // Check if team has enough tokens
    const teamTokens = this.getTeamTokens(teamId)
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

    broadcastToRoom("bidding", {
      type: "new_bid",
      data: {
        bid,
        session: this.currentSession,
        teamTokens: this.teamTokens,
      },
    })

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
      }

      broadcastToRoom("bidding", {
        type: "session_ended",
        data: {
          session: this.currentSession,
          winningBid,
          allBids: this.currentBids,
          teamTokens: this.teamTokens,
        },
      })

      // Check for low stock
      if (
        this.currentSession.remainingBundles > 0 &&
        LOW_STOCK_NOTIFICATIONS.includes(this.currentSession.remainingBundles)
      ) {
        broadcastToRoom("bidding", {
          type: "low_stock_alert",
          data: { remainingBundles: this.currentSession.remainingBundles },
        })
      }
    }
  }

  getCurrentSession(): BiddingSession | null {
    return this.currentSession
  }

  getCurrentBids(): Bid[] {
    return [...this.currentBids]
  }

  getAllTeamTokens(): TeamTokens {
    return { ...this.teamTokens }
  }
}

export const biddingManager = new BiddingManager()
