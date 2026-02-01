"use client"; // optional here, can be removed

import dynamic from "next/dynamic";

// Import ChatApp dynamically, client-side only
const ChatApp = dynamic(() => import("./ChatApp"), { ssr: false });

export default function Page() {
  return <ChatApp />;
}
