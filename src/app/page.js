"use client"; 

// pages/index.js
import dynamic from "next/dynamic";

// 动态加载 SnakeGame 组件，确保它只在客户端渲染
const SnakeGame = dynamic(() => import("../components/SnakeGame"), { ssr: false });

export default function Home() {
  return (
    <div>
      <h1>❤️💩❤️</h1>
      <SnakeGame />
    </div>
  );
}
