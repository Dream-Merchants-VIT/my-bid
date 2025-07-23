import { NextResponse } from 'next/server';
import { db, eq } from '@db/index';
import { teams, participants } from '@db/schema';
import { auth } from 'auth';
import { randomUUID } from 'crypto';

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
