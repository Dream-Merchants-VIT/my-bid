"use client"

import { useState } from "react"
import { RAW_MATERIALS } from "@common/constants"
import { useWebSocketBidding } from "../../../../hooks/use-ws-bidding"

export default function AdminBidPage() {
  const [selectedMaterial, setSelectedMaterial] = useState("")
  const [bundleType, setBundleType] = useState<"large" | "small">("large")
  const [totalBundles, setTotalBundles] = useState(50)
  const [isLoading, setIsLoading] = useState(false)

  const {
    session: currentSession,
    bids: currentBids,
    teamTokens,
    remainingTime,
    isConnected,
    startSession,
  } = useWebSocketBidding()

  const handleStartSession = async () => {
    if (!selectedMaterial) {
      alert("Please select a material")
      return
    }

    setIsLoading(true)
    try {
      await startSession(selectedMaterial, bundleType, totalBundles)
      alert("Bidding session started successfully!")
    } catch (error) {
      console.error("Error starting session:", error)
      alert("Error starting session: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  const selectedMaterialData = RAW_MATERIALS.find((m) => m.id === selectedMaterial)
  const sortedBids = [...currentBids].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const highestBid = sortedBids[0] || null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">🎛️ Admin Control Center</h1>
              <p className="text-gray-600">Manage and monitor real-time bidding sessions</p>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 px-4 py-2 rounded-full ${isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                ></div>
                <span className="font-medium">{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Session Controls */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-black mb-4">🚀 Start New Session</h2>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Raw Material</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                  disabled={currentSession?.isActive}
                >
                  <option value="">Select Material</option>
                  {RAW_MATERIALS.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Bundle Type & Price</label>
                <select
                  value={bundleType}
                  onChange={(e) => setBundleType(e.target.value as "large" | "small")}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                  disabled={!selectedMaterialData || currentSession?.isActive}
                >
                  {selectedMaterialData?.smallBundlePrice && (
                    <option value="small">
                      Small Bundle - ₹{selectedMaterialData.smallBundlePrice}
                    </option>
                  )}
                  {selectedMaterialData?.largeBundlePrice && (
                    <option value="large">
                      Large Bundle - ₹{selectedMaterialData.largeBundlePrice}
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Total Bundles Available</label>
                <input
                  type="number"
                  value={isNaN(totalBundles) ? "" : totalBundles}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTotalBundles(value === "" ? 0 : parseInt(value));
                  }}
                  min={1}
                  max={100}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                  disabled={currentSession?.isActive}
                />
              </div>

              <button
                onClick={handleStartSession}
                disabled={isLoading || !selectedMaterial || !isConnected || currentSession?.isActive}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all duration-200 shadow-lg"
              >
                {isLoading
                  ? "Starting Session..."
                  : currentSession?.isActive
                    ? "Session Active"
                    : "🚀 Start Bidding Session"}
              </button>
            </div>

            {/* Current Session Status */}
            <div>
              <h2 className="text-2xl font-semibold text-black mb-4">📊 Session Status</h2>

              {currentSession ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                      <h3 className="text-xl font-bold text-green-800">🔴 LIVE SESSION</h3>
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, "0")}
                    </div>
                  </div>

                  <div className="space-y-3 text-black">
                    <div className="flex justify-between">
                      <span className="font-medium">Material:</span>
                      <span className="font-bold">{currentSession.materialName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Bundle Type:</span>
                      <span className="font-bold capitalize">{currentSession.bundleType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Base Price:</span>
                      <span className="font-bold text-green-600">₹{currentSession.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Bundles:</span>
                      <span className="font-bold">{currentSession.totalBundles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Remaining:</span>
                      <span className="font-bold text-orange-600">{currentSession.remainingBundles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Started:</span>
                      <span className="font-bold">{new Date(currentSession.startTime).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${(remainingTime / 30) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 border-2 border-gray-200 rounded-xl p-6 text-center">
                  <div className="text-gray-400 text-6xl mb-4">⏸️</div>
                  <h3 className="text-xl font-semibold text-black mb-2">No Active Session</h3>
                  <p className="text-gray-600">Start a new bidding session to begin</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Bidding Monitor */}
        {currentSession && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Current Highest Bid */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-black mb-4">🏆 Current Highest Bid</h2>
              {highestBid ? (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-orange-600 mb-2">₹{highestBid.amount}</p>
                    <p className="text-xl font-semibold text-black">{highestBid.teamName}</p>
                    <p className="text-gray-600">({highestBid.teamCode})</p>
                    <p className="text-sm text-gray-500 mt-2">{new Date(highestBid.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-black">No bids placed yet</p>
                </div>
              )}
            </div>

            {/* Team Tokens */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-black mb-4">💰 Team Tokens</h2>
              <div className="space-y-3">
                {Object.entries(teamTokens).map(([teamId, tokens]) => (
                  <div key={teamId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-black">Team {teamId.slice(-3)}</p>
                      <p className="text-xs text-gray-600">ID: {teamId}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${tokens > 500 ? "text-green-600" : tokens > 200 ? "text-yellow-600" : "text-red-600"}`}
                      >
                        ₹{tokens}
                      </p>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${tokens > 500 ? "bg-green-500" : tokens > 200 ? "bg-yellow-500" : "bg-red-500"}`}
                          style={{ width: `${(tokens / 1500) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Bid History */}
        {currentSession && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-black mb-6">📈 Live Bid History</h2>
            {sortedBids.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-black">No bids placed yet</p>
                <p className="text-sm text-gray-600">Waiting for teams to place bids...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sortedBids.map((bid, index) => (
                  <div
                    key={bid.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${index === 0
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md"
                      : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-black">{bid.teamName}</p>
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                            {bid.teamCode}
                          </span>
                          {index === 0 && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                              🏆 HIGHEST
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{new Date(bid.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${index === 0 ? "text-green-600" : "text-black"}`}>
                          ₹{bid.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Material Reference */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-semibold text-black mb-6">📋 Material Price Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {RAW_MATERIALS.map((material) => (
              <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-black mb-2">{material.name}</h3>
                <div className="space-y-1 text-sm">
                  {material.largeBundlePrice && (
                    <div className="flex justify-between text-black">
                      <span>Large Bundle:</span>
                      <span className="font-bold text-green-600">₹{material.largeBundlePrice}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-black">
                    <span>Small Bundle:</span>
                    <span className="font-bold text-blue-600">₹{material.smallBundlePrice}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
