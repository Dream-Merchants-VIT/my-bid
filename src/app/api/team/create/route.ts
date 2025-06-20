import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { teams, participants } from '../../../../../lib/db/schema';
import { auth } from '../../../../../auth';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }));

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();
  const code = randomUUID().slice(0, 6); 

  const [user] = await db
    .select()
    .from(participants)
    .where(eq(participants.email, session.user.email));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const [team] = await db
    .insert(teams)
    .values({
      name,
      code,
      ownerId: user.id,
    })
    .returning();

  await db
    .update(participants)
    .set({ teamId: team.id })
    .where(eq(participants.id, user.id));

  return NextResponse.json(team);
}
