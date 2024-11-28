import React from 'react';

const Head = () => {
  // 检测是否为亮色模式
  const isLightMode = window.matchMedia('(prefers-color-scheme: light)').matches;

  return (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      {/* 黄色圆形背景 */}
      <circle cx="12" cy="12" r="10" fill="#FFD93D"/>
      
      {/* 眼睛 */}
      <circle cx="15.5" cy="12" r="1.5" fill="#000"/>
      
      {/* 使用圆弧路径创建吃豆人的嘴巴 */}
      <path
        d="M 12 12
           L 21 7
           A 11 11 0 0 1 21 17
           Z"
        fill={isLightMode ? "var(--background)" : "#000"}
        transform="rotate(270, 12, 12)"
      />
    </svg>
  );
};

export default Head; 