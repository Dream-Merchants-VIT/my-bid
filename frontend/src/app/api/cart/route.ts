import { NextResponse } from "next/server"
import { db, eq } from '@db/index'
import { wonItems, items, participants } from '@db/schema'
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch participant to get teamId
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.email, session.user.email))

    if (!participant?.teamId) {
      return NextResponse.json({ error: "No team found for user" }, { status: 404 })
    }

    // Fetch won items joined with item details
    const data = await db
      .select({
        id: wonItems.id,
        itemId: wonItems.itemId,
        baseAmount: wonItems.baseAmount,
        amountPurchased: wonItems.amountPurchased,
        quantity: wonItems.quantity
      })
      .from(wonItems)
      .innerJoin(items, eq(wonItems.itemId, items.id))
      .where(eq(wonItems.teamId, participant.teamId))

    return NextResponse.json({ items: data })
  } catch (error) {
    console.error("Failed to load cart items:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
