// app/api/auth/[...nextauth]/route.ts
import NextAuth, {NextAuthOptions} from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { drizzle } from 'drizzle-orm/node-postgres';
import { participants } from '../../../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

export const authOptions: NextAuthOptions =({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const existing = await db
        .select()
        .from(participants)
        .where(eq(participants.email, user.email));

      if (existing.length === 0) {
        await db.insert(participants).values({
          name: user.name ?? '',
          email: user.email,
        });
      }


      return true;
    },
    async session({ session, token }) {
      // Optional: Attach DB user info to the session
      return session;
    },
  },
});

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
