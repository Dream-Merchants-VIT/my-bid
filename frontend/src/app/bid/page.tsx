import { redirect } from "next/navigation"
import { auth } from "../../../auth"
import { db, eq } from "@db/index"
import { participants, teams } from "@db/schema"
import BidClient from "../../../components/BidClient"

export default async function BidPage() {
  const session = await auth()
  if (!session?.user?.email) {
    redirect("/") // not logged in
  }

  // 1. Find participant for logged-in user
  const [participant] = await db
    .select()
    .from(participants)
    .where(eq(participants.email, session.user.email))

  if (!participant) {
    redirect("/") // not registered
  }

  if (!participant.teamId) {
  redirect("/team") // participant is not in a team
}

  // 2. Find their team
  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, participant.teamId))

  if (!team) {
    redirect("/team") // not in a team
  }

  // 3. Restrict access → only owner allowed
  if (team.ownerId !== participant.id) {
    redirect("/team") // redirect non-owners back
  }

  // ✅ Passed check → render client UI
  return <BidClient />
}
