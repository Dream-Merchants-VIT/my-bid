import { NextResponse } from 'next/server';
import { db, eq } from '@db/index';
import { teams, participants } from '@db/schema'; 
import { auth } from 'auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code } = await req.json();

  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.code, code));

  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }

  const [user] = await db
    .select()
    .from(participants)
    .where(eq(participants.email, session.user.email));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  await db
    .update(participants)
    .set({ teamId: team.id })
    .where(eq(participants.id, user.id));

  return NextResponse.json({ success: true });
}
