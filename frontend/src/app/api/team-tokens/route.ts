// src/app/api/team-tokens/route.ts
import { NextResponse } from "next/server"
import { Pool } from 'pg';
import { teams as team } from "../../../../../backend/lib/db/schema";
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }));

export async function GET() {
  try {
    const result = await db.select({
      id: team.id,
      tokens: team.tokens,
      name: team.name,
    }).from(team)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch team tokens:", error)
    return new NextResponse("Error fetching team tokens", { status: 500 })
  }
}
