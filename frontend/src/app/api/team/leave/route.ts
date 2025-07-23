import { NextResponse } from 'next/server';
import { db, eq } from '@db/index';
import { participants } from '@db/schema';
import { auth } from 'auth';

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    .set({ teamId: null })
    .where(eq(participants.id, user.id));

  return NextResponse.json({ success: true });
}
