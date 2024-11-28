"use client"; 

// pages/index.js
import dynamic from "next/dynamic";

// 动态加载 SnakeGame 组件，确保它只在客户端渲染
const SnakeGame = dynamic(() => import("../components/SnakeGame"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500 to-pink-500 p-4">
      <h1 className="text-4xl font-bold text-center text-white mb-8 animate-bounce">
        🎮 贪吃蛇大冒险 
      </h1>
      <SnakeGame />
    </div>
  );
}
