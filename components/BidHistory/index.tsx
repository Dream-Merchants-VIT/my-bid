"use client"

import type { Bid } from "../../types"

interface BidHistoryProps {
  bids: Bid[]
}

export default function BidHistory({ bids }: BidHistoryProps) {
  const sortedBids = [...bids].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-black mb-4">📊 Bid History</h2>

      {sortedBids.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-black">No bids placed yet</p>
          <p className="text-sm text-gray-600">Be the first to bid!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedBids.map((bid, index) => (
            <div
              key={bid.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                index === 0
                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
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
                  <p className={`text-xl font-bold ${index === 0 ? "text-green-600" : "text-black"}`}>₹{bid.amount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
