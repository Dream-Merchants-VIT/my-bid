"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import type { BiddingSession, Bid, TeamTokens } from "../../types"

interface BiddingInterfaceProps {
  currentSession: BiddingSession | null
  highestBid: Bid | null
  teamTokens: TeamTokens
  placeBid: (teamId: string, teamName: string, teamCode: string, amount: number) => Promise<void>
}

export default function BiddingInterface({ currentSession, highestBid, teamTokens, placeBid }: BiddingInterfaceProps) {
  const { data: session } = useSession()
  const [bidAmount, setBidAmount] = useState("")
  const [isPlacingBid, setIsPlacingBid] = useState(false)

  // Mock team data - replace with actual team data from your auth/database
  const currentTeam = {
    id: "team-123",
    name: "Sample Team",
    code: "ST001",
    tokens: teamTokens["team-123"] || 1500,
  }

  const handlePlaceBid = async () => {
    if (!bidAmount || !currentSession) return

    const amount = Number.parseInt(bidAmount)
    const minimumBid = highestBid ? highestBid.amount + 1 : currentSession.basePrice

    if (amount < minimumBid) {
      alert(`Your bid must be at least ₹${minimumBid}`)
      return
    }

    if (amount > currentTeam.tokens) {
      alert(`Insufficient tokens! You have ₹${currentTeam.tokens} remaining`)
      return
    }

    setIsPlacingBid(true)

    try {
      await placeBid(currentTeam.id, currentTeam.name, currentTeam.code, amount)
      setBidAmount("")
      console.log("✅ Bid placed successfully")
    } catch (error) {
      console.error("❌ Error placing bid:", error)
      alert("Error placing bid: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsPlacingBid(false)
    }
  }

  if (!currentSession) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-semibold text-black mb-2">No Active Auction</h2>
          <p className="text-gray-600">Wait for the admin to start a new bidding session</p>
        </div>
      </div>
    )
  }

  const minimumBid = highestBid ? highestBid.amount + 1 : currentSession.basePrice

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-black mb-6">🎯 Place Your Bid</h2>

      {/* Current Team Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-blue-800">{currentTeam.name}</h3>
            <p className="text-blue-600 text-sm">Code: {currentTeam.code}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-900">₹{currentTeam.tokens}</p>
            <p className="text-blue-600 text-sm">Available Tokens</p>
          </div>
        </div>
      </div>

      {/* Current Highest Bid */}
      {highestBid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">🏆 Current Highest Bid</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-3xl font-bold text-green-900">₹{highestBid.amount}</p>
              <p className="text-green-700">
                by {highestBid.teamName} ({highestBid.teamCode})
              </p>
            </div>
            <div className="text-green-600">
              {highestBid.teamId === currentTeam.id && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                  🎯 Your Bid!
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bidding Form */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-black mb-2">Your Bid Amount (Minimum: ₹{minimumBid})</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">₹</span>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`${minimumBid}`}
              min={minimumBid}
              max={currentTeam.tokens}
              className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black text-xl font-semibold bg-white"
            />
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-600">Minimum: ₹{minimumBid}</span>
            <span className="text-gray-600">Maximum: ₹{currentTeam.tokens}</span>
          </div>
        </div>

        {/* Quick Bid Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setBidAmount(minimumBid.toString())}
            className="py-2 px-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Min Bid
          </button>
          <button
            onClick={() => setBidAmount((minimumBid + 50).toString())}
            className="py-2 px-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 text-sm font-medium"
            disabled={minimumBid + 50 > currentTeam.tokens}
          >
            +₹50
          </button>
          <button
            onClick={() => setBidAmount((minimumBid + 100).toString())}
            className="py-2 px-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 text-sm font-medium"
            disabled={minimumBid + 100 > currentTeam.tokens}
          >
            +₹100
          </button>
        </div>

        <button
          onClick={handlePlaceBid}
          disabled={
            isPlacingBid || !bidAmount || !currentSession?.isActive || Number.parseInt(bidAmount) > currentTeam.tokens
          }
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all duration-200 shadow-lg"
        >
          {isPlacingBid ? "⏳ Placing Bid..." : "🚀 Place Bid"}
        </button>
      </div>

      {/* Rules */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-black mb-2">📋 Bidding Rules</h4>
        <ul className="text-sm text-black space-y-1">
          <li>• Only team leaders can place bids</li>
          <li>• Each team starts with 1,500 tokens</li>
          <li>• Bids must be higher than current highest bid</li>
          <li>• You have 30 seconds per auction</li>
          <li>• Winning bid deducts tokens from your balance</li>
        </ul>
      </div>
    </div>
  )
}
