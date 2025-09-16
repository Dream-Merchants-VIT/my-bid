"use client"

import { useSession } from "next-auth/react"
import BiddingInterface from "../../../components/BiddingInterface"
import Timer from "../../../components/Timer"
import BidHistory from "../../../components/BidHistory"
import TokenTracker from "../../../components/TokenTracker"
import { useWebSocketBidding } from "../../../hooks/use-ws-bidding"
import { useRouter } from "next/navigation"

export default function BidPage() {
  const { data: session } = useSession()
  const {
    session: currentSession,
    bids: currentBids,
    highestBid,
    remainingTime,
    notifications,
    teamTokens,
    isConnected,
    placeBid,
  } = useWebSocketBidding()

  const router = useRouter();

  if (!session) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/images/image1.png')" }}
      >
        <div
          className="text-center p-8 rounded-xl shadow-lg bg-no-repeat bg-center"
          style={{
            backgroundImage: "url('/assets/images/image2.png')",
            backgroundSize: "contain",
          }}
        >
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl text-yellow-400 minecraft-font tracking-wider mb-4 p-4 drop-shadow-lg">
            Authentication Required
          </h1>
          <p className="text-yellow-300 minecraft-font tracking-wider">
            Please log in to access the bidding platform
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center minecraft-font"
      style={{ backgroundImage: "url('/assets/images/background.png')" }}
    >
      {/* Wooden Frame Container */}
      <div
        className="relative w-[80%] max-w-5xl min-h-[80vh] p-4 flex flex-col items-center justify-start rounded-lg shadow-xl"
        style={{
          backgroundImage: "url('/assets/images/main-background.png')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        {/* Header */}
        <div
          className="w-[90%] p-8 m-5 flex justify-between items-center rounded-lg"
          style={{
            backgroundImage: "url('/assets/images/bid/header.png')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <h1 className="text-3xl text-[#F1EBB5] font-bold tracking-widest flex text-outline-brown items-center">
            🏗️ CONSTRUCTION BIDDING PLATFORM
          </h1>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => router.push('/cart')}
              className="px-4 py-2 text-white rounded shadow-md hover:bg-purple-800"
              style={{ backgroundImage: "url('/assets/images/bid/button.png')" }}
            >
              VIEW CART
            </button>
            <div
              className={`flex items-center space-x-2 px-3 py-1 border-2 rounded bg-[#978056]/37 ${isConnected ? "border-green-400" : "border-red-400"
                }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
              ></div>
              <span className="text-sm">{isConnected ? "CONNECTED" : "DISCONNECTED"}</span>
            </div>
          </div>
        </div>

        <div className="container mx-4 px-4 py-8">
          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="mb-6 space-y-2">
              {notifications.slice(-3).map((notification, index) => (
                <div
                  key={index}
                  className="bg-yellow-900 border-2 text-white border-yellow-400 px-4 py-3 rounded shadow-md animate-pulse"
                >
                  {notification}
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 ml-6 mr-6">

            {/* Current Auction + Bidding Interface */}
            <div className="xl:col-span-2 space-y-6">
              {currentSession && (
                <div className="border-2 border-yellow-500 rounded-lg p-2 bg-[#978056]/37 shadow-lg">
                  <h2 className="text-xl font-bold mb-4">🎯 CURRENT AUCTION</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Material:</span>
                      <span className="font-bold">{currentSession.materialName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bundle:</span>
                      <span className="font-bold capitalize">{currentSession.bundleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span className="font-bold text-green-400">₹{currentSession.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Available:</span>
                      <span className="font-bold text-orange-400">
                        {currentSession.remainingBundles}/{currentSession.totalBundles}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <BiddingInterface
                currentSession={currentSession}
                highestBid={highestBid}
                teamTokens={teamTokens}
                placeBid={placeBid}
              />
            </div>

            {/* Right side: Timer + Bid History */}
            <div className="xl:col-span-1 flex flex-col space-y-6">
              <Timer remainingTime={remainingTime} />

              <div className="flex-1 overflow-y-auto max-h-[500px] rounded-lg p-2 shadow-lg">
                <BidHistory bids={currentBids} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
