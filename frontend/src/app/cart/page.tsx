"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Trophy, Coins } from "lucide-react"
import Link from "next/link"

interface CartItem {
  id: string
  itemId: string
  baseAmount: number
  amountPurchased: number
}

interface UserTokens {
  available: number
  total: number
  used: number
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [tokens, setTokens] = useState<UserTokens>({ available: 0, total: 0, used: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCartData()
  }, [])

  const fetchCartData = async () => {
    try {
      const [cartResponse, tokensResponse, teamResponse] = await Promise.all([
        fetch("/api/cart"),
        fetch("/api/team-tokens"),
        fetch("/api/current-team"),
      ])

      if (cartResponse.ok && tokensResponse.ok && teamResponse.ok) {
        const cartData = await cartResponse.json()
        const tokensData = await tokensResponse.json()
        const teamData = await teamResponse.json()
        const totalTokens = 1500
        const availableTokens = Number(tokensData.tokens)

        // console.log("Fetched cartData:", cartData)
        // console.log("Fetched tokenData: ", tokensData)
        // console.log("Fetched teamData: ", teamData)

        setCartItems(cartData.items);
        const matchedToken = tokensData.find((token: any) => token.id === teamData.id);

        if (matchedToken) {
          const availableTokens = Number(matchedToken.tokens);
          setCartItems(cartData.items);
          setTokens({
            available: availableTokens,
            total: totalTokens,
            used: isNaN(availableTokens) ? 0 : totalTokens - availableTokens,
          });
        } else {
          console.warn("No matching token found for team ID", teamData.id);
        }

      }
    } catch (error) {
      console.error("Error fetching cart data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin h-8 w-8 border-4 border-b-transparent rounded-full border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/bid" className="flex items-center text-sm text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Bidding
        </Link>
        <div>
          <h1 className="text-3xl font-bold">My Cart</h1>
          <p className="text-gray-500 text-sm">Your won auctions and token balance</p>
        </div>
      </div>

      {/* Token Info */}
      <div className="mb-6 border p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-4 font-semibold text-lg">
          <Coins className="w-5 h-5 text-yellow-500" />
          Token Balance
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-100 rounded">
            <div className="text-2xl font-bold text-green-700">{isNaN(tokens.available) ? "0" : tokens.available}</div>
            <div className="text-sm text-green-800">Available Tokens: {isNaN(tokens.available) ? "0" : tokens.available}</div>
          </div>
          <div className="text-center p-4 bg-blue-100 rounded">
            <div className="text-2xl font-bold text-blue-700">{tokens.used}</div>
            <div className="text-sm text-blue-800">Used Tokens</div>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded">
            <div className="text-2xl font-bold text-gray-700">{tokens.total}</div>
            <div className="text-sm text-gray-800">Total Tokens</div>
          </div>
        </div>
      </div>

      {/* Won Items */}
      <div className="border p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-4 font-semibold text-lg">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Won Auctions ({cartItems.length})
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No won auctions yet</h3>
            <p className="text-gray-500 mb-4">Start bidding to see your victories here!</p>
            <Link href="/bid" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Start Bidding
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="border rounded p-4 hover:bg-gray-50 transition">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">

                    <Trophy className="w-6 h-6 text-gray-400" />

                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{item.itemId || "Unnamed Item"}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Base Price</div>
                        <div className="line-through text-sm text-gray-400">${item.baseAmount}</div>
                        <div className="text-xs text-gray-400 mt-2">Your Price</div>
                        <div className="text-green-600 font-bold text-lg">${item.amountPurchased}</div>
                        {item.amountPurchased < item.baseAmount && (
                          <div className="text-xs text-green-500 font-medium">
                            Saved ${(item.baseAmount - item.amountPurchased)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Summary */}
            {/* <div className="border-t pt-4 mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-100 rounded">
                <div className="text-lg font-bold text-blue-700">${totalSpent.toFixed(2)}</div>
                <div className="text-sm text-blue-800">Total Spent</div>
              </div>
              <div className="p-3 bg-green-100 rounded">
                <div className="text-lg font-bold text-green-700">${totalSavings.toFixed(2)}</div>
                <div className="text-sm text-green-800">Total Savings</div>
              </div> */}
            <div className="p-3 bg-purple-100 rounded">
              <div className="text-lg font-bold text-purple-700">{cartItems.length}</div>
              <div className="text-sm text-purple-800">Items Won</div>
            </div>
          </div>
          // </div>
        )}
      </div>
    </div>
  )
}
