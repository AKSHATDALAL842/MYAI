"use client";

import { useSession } from "next-auth/react";
import Hero from "./components/Hero";
import Chat from "./components/Chat";

export default function Home() {
  const { data: session } = useSession();

  if (!session) {
    return <Hero />;
  }

  return <Chat />;
}
