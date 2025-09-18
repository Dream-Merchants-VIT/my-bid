import { NextResponse } from "next/server"
import { db, eq } from "@db/index"
import { teams, participants } from "@db/schema"
import { auth } from "../../../../auth"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { teamId, bidAmount } = await req.json()
  if (!teamId || typeof bidAmount !== "number") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  // find the participant making the request
  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.email, session.user.email))

  if (!participant) {
    return NextResponse.json({ error: "Participant not found" }, { status: 404 })
  }

  // find the team
  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 })
  }

  // ✅ only owner can place bids
  if (team.ownerId !== participant.id) {
    return NextResponse.json({ error: "Only the team owner can place bids" }, { status: 403 })
  }

  const t = await db.transaction(async (tx) => {
    const [row] = await tx
      .select({ tokens: teams.tokens })
      .from(teams)
      .where(eq(teams.id, teamId))

    if (!row) throw new Error("Team not found")
    if (row.tokens < bidAmount) {
      return NextResponse.json({ error: "Insufficient tokens" }, { status: 400 })
    }

    await tx
      .update(teams)
      .set({ tokens: row.tokens - bidAmount })
      .where(eq(teams.id, teamId))

    return NextResponse.json({ tokens: row.tokens - bidAmount })
  })

  return t
}
