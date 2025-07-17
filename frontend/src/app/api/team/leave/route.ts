// app/api/team/leave/route.ts
import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { participants } from '../../../../../../backend/lib/db/schema';
import { auth } from '../../../../../auth';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }));

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
