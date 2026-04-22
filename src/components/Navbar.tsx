"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-black border-t border-zinc-800 flex justify-around py-3 text-white">
      <Link href="/">Home</Link>
      <Link href="/practice">Practice</Link>
      <Link href="/quests">Quests</Link>
      <Link href="/profile">Profile</Link>
    </div>
  );
}