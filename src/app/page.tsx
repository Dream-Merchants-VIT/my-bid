'use client';

import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      {session ? (
        <>
          <p className="text-white text-xl">Welcome, {session.user?.name}</p>
          <button
            onClick={() => signOut()}
            className="bg-red-500 px-4 py-2 text-white rounded"
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          onClick={() => signIn("google", { callbackUrl: '/team' })}
          className="bg-blue-500 px-4 py-2 text-white rounded"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
