import { ReactNode } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/auth"

const ADMIN_EMAILS = ["prisha.vadhavkar2023@vitstudent.ac.in", "aritradas.kanungo2023@vitstudent.ac.in"] 

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/")
  }

  if (!ADMIN_EMAILS.includes(session.user.email)) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-red-50">
      <h1 className="text-2xl font-bold text-red-600">🚫 Access Denied</h1>
    </div>
  )
}
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
