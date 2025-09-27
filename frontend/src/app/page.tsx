'use client';

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="relative h-screen w-full">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/images/bg.png"
          alt="Background"
          layout="fill"
          quality={100}
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      {/* Navbar */}
      <nav className="absolute top-0 w-full p-4 flex justify-between items-center bg-black/50 text-white">
        <h1 className="text-lg md:text-xl font-bold">
          BRICKS BY BID <span className="text-[#C4FC84]">2025</span>
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <a href="#" className="hover:text-green-400">Home</a>
          <button
            onClick={() => router.push("/rules")}
            className="hover:text-green-400"
          >
            Rules
          </button>
          {session ? (
            <>
              <p className="text-sm">Hi, {session.user?.name}</p>
              <button
                onClick={() => signOut({ callbackUrl: '/', redirect: true })}
                className="hover:text-red-400"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: '/team' })}
              className="hover:text-green-400"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Hamburger Icon */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-3/4 sm:w-1/2 bg-black/90 text-white p-6 transform ${isOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 md:hidden`}
      >
        <button
          className="absolute top-4 right-4 text-white"
          onClick={() => setIsOpen(false)}
        >
          <X size={28} />
        </button>

        <div className="mt-10 flex flex-col space-y-6 text-lg">
          <a href="#" className="hover:text-green-400">Home</a>
          <a href="#" className="hover:text-green-400">Schedule</a>
          <button
            onClick={() => router.push("/rules")}
            className="hover:text-green-400"
          >
            Rules
          </button>

          {session ? (
            <>
              <p className="text-sm">Hi, {session.user?.name}</p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: '/', redirect: true });
                }}
                className="hover:text-red-400 text-left"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false);
                signIn("google", { callbackUrl: "/team" });
              }}
              className="hover:text-green-400 text-left"
            >
              Login
            </button>
          )}
          <button className="bg-[#898C63] text-white w-full">Sign Up</button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col justify-center items-start h-full px-6 md:px-16 text-white text-center md:text-left">
        <p className="text-xs md:text-sm font-semibold">Dream Merchants UIT Presents</p>
        <h2 className="text-4xl md:text-6xl text-black font-extrabold mt-2 minecraft-font">
          BRICKS <span className="minecraft-font text-yellow-500">BY BID</span>
        </h2>

        <p className="mt-4 text-sm md:text-lg font-bold">
          Trade Smart, Bid Bold, Build Big
        </p>
        {/* <p className="text-sm md:text-lg">Tagline here</p> */}

        {/* Buttons */}
        <div className="mt-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {session ? (
            <button
              onClick={() => router.push("/bid")}
              className="bg-[#B17E41] px-6 py-3 text-black text-lg font-bold w-full md:w-auto"
            >
              Go to Bid Page →
            </button>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-[#B17E41] px-6 py-3 text-black text-lg font-bold w-full md:w-auto"
            >
              Register Now →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
