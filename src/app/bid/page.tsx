"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { io, type Socket } from "socket.io-client"
import BiddingInterface from "../../../components/BiddingInterface"
import Timer from  "../../../components/Timer"
import BidHistory from  "../../../components/BidHistory"
import TokenTracker from  "../../../components/TokenTracker"
import type { BiddingSession, Bid, WebSocketMessage, TeamTokens } from "../../../types"

export default function BidPage() {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentSession, setCurrentSession] = useState<BiddingSession | null>(null)
  const [currentBids, setCurrentBids] = useState<Bid[]>([])
  const [highestBid, setHighestBid] = useState<Bid | null>(null)
  const [remainingTime, setRemainingTime] = useState(0)
  const [notifications, setNotifications] = useState<string[]>([])
  const [teamTokens, setTeamTokens] = useState<TeamTokens>({})
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!session) return

    const initSocket = async () => {
      await fetch("/api/socket")
      const newSocket = io()

      newSocket.on("connect", () => {
        console.log("Connected to server")
        setIsConnected(true)
        setSocket(newSocket)
        newSocket.emit("join-room", "bidding")
      })

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server")
        setIsConnected(false)
      })

      newSocket.on("message", (message: WebSocketMessage) => {
        console.log("Received message:", message)

        switch (message.type) {
          case "session_started":
            setCurrentSession(message.data.session)
            setCurrentBids([])
            setHighestBid(null)
            setRemainingTime(30)
            setTeamTokens(message.data.teamTokens || {})
            setNotifications((prev) => [...prev, `🚀 New auction started: ${message.data.session.materialName}`])
            break

          case "new_bid":
            setCurrentBids((prev) => [...prev, message.data.bid])
            setHighestBid(message.data.bid)
            setTeamTokens(message.data.teamTokens || {})
            setNotifications((prev) => [
              ...prev,
              `💰 New bid: ₹${message.data.bid.amount} by ${message.data.bid.teamName}`,
            ])
            break

          case "session_ended":
            setCurrentSession(null)
            setRemainingTime(0)
            setTeamTokens(message.data.teamTokens || {})
            if (message.data.winningBid) {
              setNotifications((prev) => [
                ...prev,
                `🏆 Auction ended! Winner: ${message.data.winningBid.teamName} (${message.data.winningBid.teamCode}) - ₹${message.data.winningBid.amount}`,
              ])
            } else {
              setNotifications((prev) => [...prev, `⏰ Auction ended with no bids`])
            }
            break

          case "timer_update":
            setRemainingTime(message.data.remainingTime)
            break

          case "low_stock_alert":
            setNotifications((prev) => [
              ...prev,
              `⚠️ Low stock alert! Only ${message.data.remainingBundles} bundles remaining!`,
            ])
            break
        }
      })
    }

    initSocket()

    // Fetch current session data
    fetch("/api/bid/current")
      .then((res) => res.json())
      .then((data) => {
        setCurrentSession(data.session)
        setCurrentBids(data.bids || [])
        setHighestBid(data.highestBid)
        setTeamTokens(data.teamTokens || {})
      })
      .catch((error) => {
        console.error("Error fetching current session:", error)
      })

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [session])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-black mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to access the bidding platform</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-black">🏗️ Construction Bidding Platform</h1>
              <p className="text-gray-600">Real-time material auctions</p>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full ${isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-sm font-medium">{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.slice(-3).map((notification, index) => (
              <div
                key={index}
                className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 px-4 py-3 rounded-r-lg shadow-sm"
              >
                {notification}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Timer and Session Info */}
          <div className="xl:col-span-1 space-y-6">
            <Timer remainingTime={remainingTime} />

            {currentSession && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-black mb-4">🎯 Current Auction</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material:</span>
                    <span className="font-bold text-black">{currentSession.materialName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bundle:</span>
                    <span className="font-bold text-black capitalize">{currentSession.bundleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-bold text-green-600">₹{currentSession.basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-bold text-orange-600">
                      {currentSession.remainingBundles}/{currentSession.totalBundles}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <TokenTracker teamTokens={teamTokens} />
          </div>

          {/* Bidding Interface */}
          <div className="xl:col-span-2">
            <BiddingInterface
              currentSession={currentSession}
              highestBid={highestBid}
              teamTokens={teamTokens}
              onBidPlaced={() => {}}
            />
          </div>

          {/* Bid History */}
          <div className="xl:col-span-1">
            <BidHistory bids={currentBids} />
          </div>
        </div>
      </div>
    </div>
  )
}
