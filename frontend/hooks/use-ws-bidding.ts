"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { BiddingSession, Bid, TeamTokens } from "@common/types"

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
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 10
  const isConnectingRef = useRef(false)

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "Cleanup")
      wsRef.current = null
    }
    isConnectingRef.current = false
  }, [])

  const startPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
    }

    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }))
      }
    }, 30000) // Ping every 30 seconds
  }, [])

  const connect = useCallback(() => {
    if (isConnectingRef.current) {
      return
    }

    cleanup()

    let connectionTimeout: NodeJS.Timeout
    
    try {
      isConnectingRef.current = true
      // Connect to WebSocket server using environment variable
      const wsUrl = process.env.WS_URL || `ws://localhost:3001`

      console.log("🔄 Connecting to WebSocket server:", wsUrl)
      wsRef.current = new WebSocket(wsUrl)

      const connectionTimeout = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CONNECTING) {
          console.log("⏰ Connection timeout")
          wsRef.current.close()
        }
      }, 10000)

      wsRef.current.onopen = () => {
        clearTimeout(connectionTimeout)
        isConnectingRef.current = false
        reconnectAttemptsRef.current = 0
        console.log("✅ WebSocket connected successfully")
        setData((prev) => ({ ...prev, isConnected: true }))

        // Start ping interval
        startPingInterval()

        // Request current data
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "get_current_data" }))
        }
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          switch (message.type) {
            case "pong":
              // Keep-alive response
              break

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
                notifications: [...prev.notifications, `🚀 New auction: ${message.data.session.materialName}`],
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
                  `💰 ₹${message.data.bid.amount} by ${message.data.bid.teamName}`,
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
                    ? `🏆 Winner: ${message.data.winningBid.teamName} - ₹${message.data.winningBid.amount}`
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
          console.error("❌ Error parsing message:", error)
        }
      }

      wsRef.current.onclose = (event) => {
        clearTimeout(connectionTimeout)
        isConnectingRef.current = false
        console.log(`🔌 WebSocket closed: ${event.code} ${event.reason}`)
        setData((prev) => ({ ...prev, isConnected: false }))

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
          pingIntervalRef.current = null
        }

        // Reconnect if not a clean close and under max attempts
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = Math.min(1000 * reconnectAttemptsRef.current, 5000)
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }
      }

      wsRef.current.onerror = (error) => {
        clearTimeout(connectionTimeout)
        isConnectingRef.current = false
        console.error("❌ WebSocket error:", error)
        setData((prev) => ({ ...prev, isConnected: false }))
      }
    } catch (error) {
      isConnectingRef.current = false
      console.error("❌ Error creating WebSocket:", error)
    }
  }, [cleanup, startPingInterval])

  useEffect(() => {
    connect()
    return cleanup
  }, [connect, cleanup])

  const startSession = useCallback(
    (materialId: string, bundleType: "large" | "small", totalBundles: number): Promise<void> => {
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

        setTimeout(() => {
          wsRef.current?.removeEventListener("message", handleResponse)
          reject(new Error("Request timeout"))
        }, 10000)
      })
    },
    [],
  )

  const placeBid = useCallback((teamId: string, teamName: string, teamCode: string, amount: number): Promise<void> => {
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

      setTimeout(() => {
        wsRef.current?.removeEventListener("message", handleResponse)
        reject(new Error("Request timeout"))
      }, 10000)
    })
  }, [])

  return {
    ...data,
    startSession,
    placeBid,
  }
}
