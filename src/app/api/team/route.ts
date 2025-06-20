import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { participants, teams } from '../../../../lib/db/schema';
import { auth } from '../../../../auth';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }));

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json(null);

  const [user] = await db
    .select()
    .from(participants)
    .where(eq(participants.email, session.user.email));

  if (!user?.teamId) return NextResponse.json(null);

  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, user.teamId));

  const members = await db
    .select()
    .from(participants)
    .where(eq(participants.teamId, user.teamId));

  return NextResponse.json({ ...team, members });
}
