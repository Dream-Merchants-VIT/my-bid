import { NextResponse } from 'next/server'
import { db, eq } from '@db/index'
import { teams } from '@db/schema'

export async function POST(req: Request) {
  const { teamId, bidAmount } = await req.json()
  if (!teamId || typeof bidAmount !== 'number') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const t = await db.transaction(async (tx) => {
    // read current tokens
    const [row] = await tx.select({ tokens: teams.tokens })
      .from(teams)
      .where(eq(teams.id, teamId))

    if (!row) throw new Error('Team not found')
    if (row.tokens < bidAmount) {
      return NextResponse.json({ error: 'Insufficient tokens' }, { status: 400 })
    }

    // deduct
    await tx.update(teams)
      .set({ tokens: row.tokens - bidAmount })
      .where(eq(teams.id, teamId))

    return NextResponse.json({ tokens: row.tokens - bidAmount })
  })

  return t
}
