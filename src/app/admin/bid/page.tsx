"use client"

import { useState } from "react"
import { RAW_MATERIALS } from "@/lib/constants"
import type { BiddingSession } from "../../../../types"

export default function AdminBidPage() {
  const [selectedMaterial, setSelectedMaterial] = useState("")
  const [bundleType, setBundleType] = useState<"large" | "small">("large")
  const [totalBundles, setTotalBundles] = useState(50)
  const [isLoading, setIsLoading] = useState(false)
  const [currentSession, setCurrentSession] = useState<BiddingSession | null>(null)

  const startSession = async () => {
    if (!selectedMaterial) {
      alert("Please select a material")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/start-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          materialId: selectedMaterial,
          bundleType,
          totalBundles,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCurrentSession(data.session)
        alert("Bidding session started successfully!")
      } else {
        alert("Error starting session: " + data.error)
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error starting session")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedMaterialData = RAW_MATERIALS.find((m) => m.id === selectedMaterial)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Admin Bidding Portal</h1>
          <p className="text-gray-600 mb-8">Manage real-time bidding sessions for construction materials</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Session Controls */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-black mb-4">Start New Session</h2>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Raw Material</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
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
                  disabled={!selectedMaterialData}
                >
                  {selectedMaterialData?.largeBundlePrice && (
                    <option value="large">Large Bundle - ₹{selectedMaterialData.largeBundlePrice}</option>
                  )}
                  <option value="small">Small Bundle - ₹{selectedMaterialData?.smallBundlePrice}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Total Bundles Available</label>
                <input
                  type="number"
                  value={totalBundles}
                  onChange={(e) => setTotalBundles(Number.parseInt(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
                />
              </div>

              <button
                onClick={startSession}
                disabled={isLoading || !selectedMaterial}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all duration-200 shadow-lg"
              >
                {isLoading ? "Starting Session..." : "🚀 Start Bidding Session"}
              </button>
            </div>

            {/* Current Session Status */}
            <div>
              <h2 className="text-2xl font-semibold text-black mb-4">Session Status</h2>

              {currentSession ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                    <h3 className="text-xl font-bold text-green-800">🔴 LIVE SESSION</h3>
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

        {/* Material Reference */}
        <div className="bg-white rounded-xl shadow-lg p-8">
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
