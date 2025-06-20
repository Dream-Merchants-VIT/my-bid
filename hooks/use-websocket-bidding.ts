"use client"

import { useState, useEffect, useRef } from "react"
import type { BiddingSession, Bid, TeamTokens } from "../types"

interface WebSocketBiddingData {
  session: BiddingSession | null
  bids: Bid[]
  highestBid: Bid | null
  teamTokens: TeamTokens
  remainingTime: number
  notifications: string[]
  isConnected: boolean
}

export function useWebSocketBidding() {
  const [data, setData] = useState<WebSocketBiddingData>({
    session: null,
    bids: [],
    highestBid: null,
    teamTokens: {},
    remainingTime: 0,
    notifications: [],
    isConnected: false,
  })

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = () => {
    try {
      // Use the correct WebSocket URL for the custom server
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const wsUrl = `${protocol}//${window.location.host}`

      console.log("Attempting to connect to WebSocket:", wsUrl)
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log("✅ Connected to WebSocket")
        setData((prev) => ({ ...prev, isConnected: true }))

        // Request current data
        wsRef.current?.send(JSON.stringify({ type: "get_current_data" }))
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log("📨 Received WebSocket message:", message)

          switch (message.type) {
            case "initial_data":
            case "current_data_response":
              setData((prev) => ({
                ...prev,
                session: message.data.session,
                bids: message.data.bids || [],
                highestBid: message.data.highestBid,
                teamTokens: message.data.teamTokens || {},
              }))
              break

            case "session_started":
              setData((prev) => ({
                ...prev,
                session: message.data.session,
                bids: [],
                highestBid: null,
                remainingTime: 30,
                teamTokens: message.data.teamTokens || {},
                notifications: [...prev.notifications, `🚀 New auction started: ${message.data.session.materialName}`],
              }))
              break

            case "new_bid":
              setData((prev) => ({
                ...prev,
                bids: [...prev.bids, message.data.bid],
                highestBid: message.data.bid,
                teamTokens: message.data.teamTokens || {},
                notifications: [
                  ...prev.notifications,
                  `💰 New bid: ₹${message.data.bid.amount} by ${message.data.bid.teamName}`,
                ],
              }))
              break

            case "session_ended":
              setData((prev) => ({
                ...prev,
                session: null,
                remainingTime: 0,
                teamTokens: message.data.teamTokens || {},
                notifications: [
                  ...prev.notifications,
                  message.data.winningBid
                    ? `🏆 Auction ended! Winner: ${message.data.winningBid.teamName} (${message.data.winningBid.teamCode}) - ₹${message.data.winningBid.amount}`
                    : `⏰ Auction ended with no bids`,
                ],
              }))
              break

            case "timer_update":
              setData((prev) => ({
                ...prev,
                remainingTime: message.data.remainingTime,
              }))
              break
          }
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error)
        }
      }

      wsRef.current.onclose = (event) => {
        console.log("🔌 WebSocket connection closed:", event.code, event.reason)
        setData((prev) => ({ ...prev, isConnected: false }))

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Attempting to reconnect...")
          connect()
        }, 3000)
      }

      wsRef.current.onerror = (error) => {
        console.error("❌ WebSocket error:", error)
        setData((prev) => ({ ...prev, isConnected: false }))
      }
    } catch (error) {
      console.error("❌ Error creating WebSocket connection:", error)
    }
  }

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const startSession = (materialId: string, bundleType: "large" | "small", totalBundles: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not connected"))
        return
      }

      const handleResponse = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === "session_start_response") {
            wsRef.current?.removeEventListener("message", handleResponse)
            if (message.success) {
              resolve()
            } else {
              reject(new Error(message.error))
            }
          }
        } catch (error) {
          reject(error)
        }
      }

      wsRef.current.addEventListener("message", handleResponse)
      wsRef.current.send(
        JSON.stringify({
          type: "start_session",
          materialId,
          bundleType,
          totalBundles,
        }),
      )

      // Timeout after 10 seconds
      setTimeout(() => {
        wsRef.current?.removeEventListener("message", handleResponse)
        reject(new Error("Request timeout"))
      }, 10000)
    })
  }

  const placeBid = (teamId: string, teamName: string, teamCode: string, amount: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not connected"))
        return
      }

      const handleResponse = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === "bid_place_response") {
            wsRef.current?.removeEventListener("message", handleResponse)
            if (message.success) {
              resolve()
            } else {
              reject(new Error(message.error))
            }
          }
        } catch (error) {
          reject(error)
        }
      }

      wsRef.current.addEventListener("message", handleResponse)
      wsRef.current.send(
        JSON.stringify({
          type: "place_bid",
          teamId,
          teamName,
          teamCode,
          amount,
        }),
      )

      // Timeout after 10 seconds
      setTimeout(() => {
        wsRef.current?.removeEventListener("message", handleResponse)
        reject(new Error("Request timeout"))
      }, 10000)
    })
  }

  return {
    ...data,
    startSession,
    placeBid,
  }
}
