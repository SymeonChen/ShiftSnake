"use client"; 

import dynamic from "next/dynamic";

const SnakeGame = dynamic(() => import("../components/SnakeGame"), { ssr: false });

export default function Home() {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-purple-500 to-pink-500">
      <SnakeGame />
    </div>
  );
}
