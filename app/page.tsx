"use client"

import dynamic from "next/dynamic"

const RacingGame = dynamic(() => import("@/components/racing-game"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-white text-2xl font-bold animate-pulse">Loading Game...</div>
    </div>
  ),
})

export default function Page() {
  return <RacingGame />
}
