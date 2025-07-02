import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { participants, teams} from "../../../../lib/db/schema"
import { eq } from "drizzle-orm"

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }));

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const [user] = await db
      .select()
      .from(participants)
      .where(eq(participants.email, session.user.email))

    if (!user?.teamId) {
      return new NextResponse("No team found", { status: 404 })
    }


    const [userTeam] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, user.teamId))

    if (!userTeam) {
      return new NextResponse("Team not found", { status: 404 })
    }

    return NextResponse.json(userTeam)
  } 
  catch (error) {
    console.error("Error fetching current team:", error)
    return new NextResponse("Internal server error", { status: 500 })
  }
}
