import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { db, eq } from '@db/index';
import { participants, teams } from '@db/schema';

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

  return NextResponse.json({
    ...team,
    members,
    participantId: user.id
  });
}
