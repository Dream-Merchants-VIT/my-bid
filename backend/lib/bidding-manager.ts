import type { BiddingSession, Bid, TeamTokens } from "../../packages/common/src/types"
import { RAW_MATERIALS, BID_DURATION, LOW_STOCK_NOTIFICATIONS, INITIAL_TEAM_TOKENS } from "@common/constants"
import { broadcastToRoom } from "../lib/socket"
import { teams, wonItems } from '@db/schema';
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { eq } from "drizzle-orm"

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }));

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
    if (basePrice == null) {
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

  private async endCurrentSession() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    if (this.currentSession) {
      this.currentSession.isActive = false
      const winningBid = this.getCurrentHighestBid()

      // Deduct tokens from winning team
      if (winningBid) {
        const newTokenValue = this.getTeamTokens(winningBid.teamId) - winningBid.amount
        this.teamTokens[winningBid.teamId] = newTokenValue
        this.currentSession.remainingBundles -= 1

        // Update tokens in DB
        await db.update(teams)
          .set({ tokens: newTokenValue })
          .where(eq(teams.id, winningBid.teamId))

        // Insert into wonItems table
        await db.insert(wonItems).values({
          teamId: winningBid.teamId,
          itemId: this.currentSession.materialId,
          amountPurchased: winningBid.amount,
          baseAmount: this.currentSession.basePrice,
          quantity: 1, // Each session gives only 1 bundle per win
        });

        console.log("WonItems updated");
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
