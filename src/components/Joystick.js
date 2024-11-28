import React, { useState, useEffect, useCallback, useRef } from 'react';

const Joystick = ({ onDirectionChange, gameState }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [basePosition, setBasePosition] = useState({ x: 0, y: 0 });
  const lastDirection = useRef(null);

  const handleStart = useCallback((e) => {
    if (gameState === "GAMEOVER") return;
    const touch = e.touches ? e.touches[0] : e;
    setIsDragging(true);
    setBasePosition({ x: touch.clientX, y: touch.clientY });
  }, [gameState]);

  const handleMove = useCallback((e) => {
    if (!isDragging || gameState === "GAMEOVER") return;
    e.preventDefault();
    
    const touch = e.touches ? e.touches[0] : e;
    const deltaX = touch.clientX - basePosition.x;
    const deltaY = touch.clientY - basePosition.y;
    
    const distance = Math.min(Math.hypot(deltaX, deltaY), 50);
    const angle = Math.atan2(deltaY, deltaX);
    
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    setPosition(prev => ({
      x: x * 0.8 + prev.x * 0.2,
      y: y * 0.8 + prev.y * 0.2
    }));

    if (Math.abs(deltaX) > 15 || Math.abs(deltaY) > 15) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      let newDirection;
      if (absX > absY) {
        newDirection = deltaX > 0 ? 'RIGHT' : 'LEFT';
      } else {
        newDirection = deltaY > 0 ? 'DOWN' : 'UP';
      }

      if (newDirection !== lastDirection.current) {
        lastDirection.current = newDirection;
        onDirectionChange(newDirection);
      }
    }
  }, [isDragging, basePosition, onDirectionChange, gameState]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    lastDirection.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    return () => {
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [handleMove, handleEnd]);

  return (
    <div className="relative w-32 h-32 bg-purple-100 dark:bg-purple-900/30 rounded-full">
      <div
        className="absolute w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full cursor-grab active:cursor-grabbing shadow-lg"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: 'calc(50% - 32px)',
          top: 'calc(50% - 32px)',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out'
        }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      />
    </div>
  );
};

export default Joystick; 