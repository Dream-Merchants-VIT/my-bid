"use client";

import { useState, useEffect } from "react";
import { Trophy, Coins } from "lucide-react";
import Link from "next/link";

interface CartItem {
  id: string;
  itemId: string;
  baseAmount: number;
  amountPurchased: number;
  quantity: number;
  itemName: string;
  smallPrice: number | null;
  largePrice: number | null;
}

interface UserTokens {
  available: number;
  total: number;
  used: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [tokens, setTokens] = useState<UserTokens>({
    available: 0,
    total: 0,
    used: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      const [cartResponse, tokensResponse, teamResponse] = await Promise.all([
        fetch("/api/cart"),
        fetch("/api/team-tokens"),
        fetch("/api/current-team"),
      ]);

      if (cartResponse.ok && tokensResponse.ok && teamResponse.ok) {
        const cartData = await cartResponse.json();
        const tokensData = await tokensResponse.json();
        const teamData = await teamResponse.json();
        const totalTokens = 1500;

        setCartItems(cartData.items);
        const matchedToken = tokensData.find(
          (token: any) => token.id === teamData.id
        );

        if (matchedToken) {
          const availableTokens = Number(matchedToken.tokens);
          setTokens({
            available: availableTokens,
            total: totalTokens,
            used: isNaN(availableTokens)
              ? 0
              : totalTokens - availableTokens,
          });
        } else {
          console.warn("No matching token found for team ID", teamData.id);
        }
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin h-8 w-8 border-4 border-b-transparent rounded-full border-yellow-700"></div>
      </div>
    );
  }

  // Group items by itemName
  const groupedItems = cartItems.reduce(
    (acc: Record<string, CartItem[]>, item) => {
      if (!acc[item.itemName]) {
        acc[item.itemName] = [];
      }
      acc[item.itemName].push(item);
      return acc;
    },
    {}
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/images/background.png')" }}
    >
      {/* Wooden Frame Container */}
      <div
        className="relative w-[70%] max-w-5xl min-h-[80vh] p-4 flex flex-col items-center justify-start rounded-lg shadow-xl"
        style={{
          backgroundImage: "url('/assets/images/main-background.png')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        {/* Top Back Button */}
        <div className="w-full max-w-3xl flex justify-start mb-4 ml-10 self-start">
          <Link href="/rules" className="px-3 py-1">
            <img
              src="/assets/images/cart_page/button.png"
              alt="Rules"
            ></img>
          </Link>
        </div>

        {/* Title */}
        <div
          className="relative w-[60%] h-40 flex items-center justify-center mb-6 rounded-lg shadow"
          style={{
            backgroundImage: "url('/assets/images/cart_page/header.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex items-center space-x-3">
            <h1 className="text-5xl minecraft-font font-extrabold text-[#F1EBB5] px-4 py-1 rounded-lg tracking-wide text-outline-brown">
              MY CART
            </h1>
          </div>
        </div>

        {/* Token Balance Panel */}
        <div className="w-full max-w-3xl bg-[#F1EBB5]/41 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-2 text-[#A43737] minecraft-font font-bold text-2xl mb-4 tracking-wide">
            <Coins className="w-5 h-5 text-white" />
            <span className="text-[#A43737] drop-shadow-[0_0_1px_#FFD700]">
              TOKEN BALANCE
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-[#764A21]/52 p-4 rounded-lg shadow-inner text-white minecraft-font tracking-wide">
              <span className="text-lg">Available Tokens</span>
              <br />
              <span className="text-3xl font-bold">
                {isNaN(tokens.available) ? "0" : tokens.available}
              </span>
            </div>
            <div className="bg-[#764A21]/52 p-4 rounded-lg shadow-inner text-white minecraft-font tracking-wide">
              <span className="text-lg">Used Tokens</span>
              <br />
              <span className="text-3xl font-bold">{tokens.used}</span>
            </div>
            <div className="bg-[#764A21]/52 p-4 rounded-lg shadow-inner text-white minecraft-font tracking-wide">
              <span className="text-lg">Total Tokens</span>
              <br />
              <span className="text-3xl font-bold">{tokens.total}</span>
            </div>
          </div>
        </div>

        {/* Won Auctions Panel */}
        <div className="w-full max-w-3xl bg-[#F1EBB5]/41 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 text-[#A43737] minecraft-font font-bold text-2xl tracking-wide mb-4">
            <Trophy className="w-5 h-5 text-white" />
            <span className="text-[#A43737] drop-shadow-[0_0_1px_#FFD700]">
              WON AUCTIONS
            </span>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 mx-auto text-yellow-700 mb-4" />
              <h3 className="text-lg font-bold mb-2">No won auctions yet</h3>
              <p className="text-sm text-yellow-800 mb-4">
                Start bidding to see your victories here!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([name, items]) => (
                <div key={name}>
                  <h2 className="text-2xl minecraft-font text-[#F1EBB5] mb-3">
                    {name}
                  </h2>
                  <div className="space-y-2">
                    {items.map((item) => {
                      let bundleType = "";
                      if (item.quantity && item.quantity <= 50) {
                        bundleType = "Small Bundle";
                      } else {
                        bundleType = "Large Bundle";
                      }
                      return (
                        <div
                          key={item.id}
                          className="bg-[#764A21]/52 p-3 rounded-lg shadow-inner flex justify-between items-center"
                        >
                          <span className="minecraft-font text-sm text-yellow-300">
                            {bundleType}
                          </span>
                          <span className="minecraft-font text-white text-lg">
                            ${item.amountPurchased}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
