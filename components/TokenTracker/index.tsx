"use client"
import type { TeamTokens } from "../../types"

interface TokenTrackerProps {
  teamTokens: TeamTokens
}

export default function TokenTracker({ teamTokens }: TokenTrackerProps) {
  const teams = Object.entries(teamTokens).map(([id, tokens]) => ({
    id,
    tokens,
    name: `Team ${id.slice(-4)}`,
  }))

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-black mb-4">💰 Team Tokens</h2>

      {teams.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          <p className="text-black">No teams found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams
            .sort((a, b) => b.tokens - a.tokens)
            .map((team) => (
              <div key={team.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-black">{team.name}</p>
                  <p className="text-xs text-gray-600">ID: {team.id.slice(-8)}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${team.tokens > 500 ? "text-green-600" : team.tokens > 200 ? "text-yellow-600" : "text-red-600"}`}
                  >
                    ₹{team.tokens}
                  </p>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${team.tokens > 500 ? "bg-green-500" : team.tokens > 200 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${(team.tokens / 1500) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
