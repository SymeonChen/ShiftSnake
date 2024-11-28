"use client";  // 确保这是一个客户端组件

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas'; // 需要先安装：npm install html2canvas
import Joystick from './Joystick';
import { Head, Body, Food, Crown } from './icons';

const initialGridSize = 10;  // 默认网格大小
const initialSpeed = 300;  // 默认速度为 300ms

// 在文件开头添加关卡配置
const LEVELS = Array.from({ length: 10 }, (_, i) => ({
  level: i + 1,
  target: Math.floor(10 + (i * 10)),  // 目标分数：10, 20, 30, ..., 100
  speed: Math.max(175, 300 - (i * 14))  // 速度：300, 286, 272, ..., 175
}));

// 生成食物的函数
const generateFood = (snake, gridSize) => {
  let foodPosition;
  do {
    foodPosition = {
      x: Math.floor(Math.random() * gridSize.cols),
      y: Math.floor(Math.random() * gridSize.rows),
    };
  } while (snake.some((segment) => segment.x === foodPosition.x && segment.y === foodPosition.y));

  return foodPosition;
};

// 替换 GAME_IMAGES 常量为 SVG 组件
const GameIcons = {
  HEAD: Head,
  BODY: Body,
  FOOD: Food,
  CROWN: Crown
};

function SnakeGame() {
  // 添加 gameRef
  const gameRef = useRef(null);
  
  // 1. 首先声明所有状态
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [snake, setSnake] = useState([{ x: 5, y: 5 }]);
  const [food, setFood] = useState({ x: 2, y: 2 });
  const [direction, setDirection] = useState("STOP");
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameState, setGameState] = useState("STOP");
  const [showModal, setShowModal] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  
  // 2. 根据当前关卡计算目标分数和速度
  const levelConfig = LEVELS[currentLevel - 1];
  const targetScore = levelConfig.target;
  const speed = levelConfig.speed;

  // 3. 修改通关检查逻辑
  useEffect(() => {
    const score = snake.length - 1;
    if (score >= targetScore) {
      if (currentLevel === 10) {
        // 通关全部关卡
        handleGameOver(true);
      } else {
        // 进入下一关
        setCurrentLevel(prev => prev + 1);
        resetGame(false); // 不重置关卡
      }
    }
  }, [snake.length, currentLevel, targetScore]);

  // 4. 修改游戏结束处理函数
  const handleGameOver = (completed = false) => {
    setIsGameOver(true);
    setGameState("GAMEOVER");
    
    // 延迟显示弹窗
    setTimeout(() => {
      setShowModal(true);
    }, 200);
  };

  // 5. 修改重置游戏函数
  const resetGame = (resetLevel = true) => {
    if (resetLevel) {
      setCurrentLevel(1);
    }
    const initialSnake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
    setSnake(initialSnake);
    setDirection("STOP");
    setFood(generateFood(initialSnake, { rows, cols }));
    setIsGameOver(false);
    setGameState("STOP");
    setShowModal(false);
  };

  // 6. 关卡息示组件
  const LevelInfo = () => (
    <div className="fixed top-4 left-4 right-4 flex justify-between items-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl p-4 shadow-lg z-10">
      <div className="text-lg font-bold">
        第 <span className="text-purple-600">{currentLevel}</span> 关
      </div>
      <div className="text-sm flex items-center gap-1">
        目标: <span className="text-green-500 font-bold">{targetScore}</span>
        <div className="w-5 h-5">
          <GameIcons.FOOD />
        </div>
      </div>
      <div className="text-sm flex items-center gap-1">
        当前: <span className="text-blue-500 font-bold">{snake.length - 1}</span>
        <div className="w-5 h-5">
          <GameIcons.BODY />
        </div>
      </div>
    </div>
  );

  // 7. 游戏结束弹窗组件
  const GameOverModal = ({ score, onRestart }) => {
    const isAllLevelsCompleted = currentLevel === 10 && snake.length - 1 >= targetScore;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full animate-scale-up shadow-2xl">
          <div className="text-center space-y-6">
            <div className="text-7xl animate-bounce">
              <div className="w-20 h-20 mx-auto">
                {isAllLevelsCompleted ? <GameIcons.CROWN /> : <GameIcons.HEAD />}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {isAllLevelsCompleted ? "恭喜通关！" : "游戏结束"}
              </h2>
              <p className="mt-2 text-xl text-gray-600 dark:text-gray-300">
                {isAllLevelsCompleted 
                  ? "你已完成所有关卡！" 
                  : `闯到第 ${currentLevel} 关, 拉了 ${score} 坨💩`}
              </p>
            </div>
            
            <div className="space-y-4 pt-4">
              <button 
                onClick={onRestart}
                className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                {isAllLevelsCompleted ? "重新挑战 🎮" : "再玩一次 🎮"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 添加在 SnakeGame 组件内部，在其他状态和函数之后
  const renderGrid = () => {
    const grid = Array(rows).fill().map(() => Array(cols).fill(''));
    
    snake.forEach((segment, index) => {
      if (segment.x >= 0 && segment.x < cols && segment.y >= 0 && segment.y < rows) {
        const prevSegment = index > 0 ? snake[index - 1] : null;
        const moveX = prevSegment ? (prevSegment.x - segment.x) * 100 : 0;
        const moveY = prevSegment ? (prevSegment.y - segment.y) * 100 : 0;
        
        grid[segment.y][segment.x] = (
          <div 
            className="w-full h-full snake-segment" 
            style={{
              transform: `rotate(${getSegmentRotation(index)}deg)`,
              '--move-x': `${moveX}%`,
              '--move-y': `${moveY}%`
            }}
          >
            {index === 0 ? <GameIcons.HEAD /> : <GameIcons.BODY />}
          </div>
        );
      }
    });
  
    if (food.x >= 0 && food.x < cols && food.y >= 0 && food.y < rows) {
      grid[food.y][food.x] = (
        <div className="w-full h-full">
          <GameIcons.FOOD />
        </div>
      );
    }
  
    return grid.map((row, y) =>
      row.map((cell, x) => (
        <div 
          key={`${x}-${y}`} 
          className="flex justify-center items-center border border-purple-200/50 dark:border-purple-700/50"
          style={{
            width: '100%',
            height: '100%',
            aspectRatio: '1',
            padding: '15%'
          }}
        >
          {cell}
        </div>
      ))
    );
  };

  // 移动处理函数
  const handleDirectionChange = useCallback((newDirection) => {
    if (gameState === "STOP") {
      setGameState("PLAYING");
    }
    
    // 如果蛇长度大于1，检查是否会撞到第一个身体段
    if (snake.length > 1) {
      const head = snake[0];
      const firstBody = snake[1];
      
      // 计算新的头部位置
      let newHead = { ...head };
      switch (newDirection) {
        case "UP":
          newHead.y -= 1;
          break;
        case "DOWN":
          newHead.y += 1;
          break;
        case "LEFT":
          newHead.x -= 1;
          break;
        case "RIGHT":
          newHead.x += 1;
          break;
      }
      
      // 如果新的头部位置与第一个身体段重合，则忽略这次方向改变
      if (newHead.x === firstBody.x && newHead.y === firstBody.y) {
        return;
      }
    }
    
    setDirection(newDirection);
  }, [gameState, snake]);

  // 检查撞
  const checkCollision = (head) => {
    return snake.some((segment, index) => {
      if (index === 0) return false;
      return segment.x === head.x && segment.y === head.y;
    });
  };

  // 移动蛇
  const moveSnake = useCallback(() => {
    if (direction === "STOP" || isGameOver) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      
      switch (direction) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
        default:
          return prevSnake;
      }

      // 检查碰撞
      if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || checkCollision(head)) {
        handleGameOver();
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // 检查是否吃到食物
      if (head.x === food.x && head.y === food.y) {
        setFood(generateFood(newSnake, { rows, cols }));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, isGameOver, cols, rows, food]);

  // 添加游戏循环
  useEffect(() => {
    if (gameState === "PLAYING") {
      const gameLoop = setInterval(moveSnake, speed);
      return () => clearInterval(gameLoop);
    }
  }, [gameState, moveSnake, speed]);

  // 添加键盘制
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case "ArrowUp":
          handleDirectionChange("UP");
          break;
        case "ArrowDown":
          handleDirectionChange("DOWN");
          break;
        case "ArrowLeft":
          handleDirectionChange("LEFT");
          break;
        case "ArrowRight":
          handleDirectionChange("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleDirectionChange]);

  const getSegmentRotation = (index) => {
    if (index === 0) {
      switch (direction) {
        case "UP": return 0;
        case "RIGHT": return 90;
        case "DOWN": return 180;
        case "LEFT": return 270;
        default: return 0;
      }
    }
    return 0;
  };

  return (
    <div ref={gameRef} className="flex flex-col items-center min-h-screen relative pt-20">
      <LevelInfo />
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 space-y-6">
        {/* 游戏区域 */}
        <div 
          className="grid gap-[1px] mx-auto rounded-2xl bg-gradient-to-br from-purple-100/50 to-pink-100/50 dark:from-purple-900/30 dark:to-pink-900/30 p-4 backdrop-blur-sm"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            width: '100%',
            aspectRatio: '1'
          }}
        >
          {renderGrid()}
        </div>

        {/* 控制区域 */}
        <div className="flex justify-center items-center gap-8 mt-4">
          <Joystick 
            onDirectionChange={handleDirectionChange} 
            gameState={gameState}
          />
          <button 
            onClick={resetGame} 
            className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center text-2xl"
            disabled={gameState === "GAMEOVER" && !showModal}
          >
            🔄
          </button>
        </div>
      </div>

      {showModal && (
        <GameOverModal 
          score={snake.length - 1}
          onRestart={resetGame}
        />
      )}
    </div>
  );
}

export default SnakeGame;
