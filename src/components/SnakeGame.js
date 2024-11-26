"use client";  // 确保这是一个客户端组件

import { useState, useEffect } from "react";

const initialGridSize = 10;  // 默认网格大小
const initialSpeed = 100;  // 默认速度，单位毫秒（较小值即较快）

// 生成食物的函数
const generateFood = (snake, gridSize) => {
  let foodPosition;
  do {
    foodPosition = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some((segment) => segment.x === foodPosition.x && segment.y === foodPosition.y));

  return foodPosition;
};

function SnakeGame() {
  const [snake, setSnake] = useState([{ x: 5, y: 5 }]);  // 默认蛇位置
  const [direction, setDirection] = useState("STOP");
  const [food, setFood] = useState(generateFood([{ x: 5, y: 5 }], initialGridSize));
  const [gridSize, setGridSize] = useState(initialGridSize);  // 网格的大小
  const [isGameOver, setIsGameOver] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [rows, setRows] = useState(initialGridSize);  // 网格行数
  const [cols, setCols] = useState(initialGridSize);  // 网格列数
  const [speed, setSpeed] = useState(initialSpeed);  // 游戏速度
  const [gameState, setGameState] = useState("STOP");  // 游戏初始状态为停止

  useEffect(() => {
    setIsClient(true);  // 确保在客户端渲染时更新状态

    const handleKeydown = (e) => {
      e.preventDefault();  // 阻止默认的行为，防止页面滚动

      // 无论游戏是否停止，方向键都可以改变蛇的方向
      if (e.key === "ArrowUp") {
        handleDirectionChange("UP");
      }
      if (e.key === "ArrowDown") {
        handleDirectionChange("DOWN");
      }
      if (e.key === "ArrowLeft") {
        handleDirectionChange("LEFT");
      }
      if (e.key === "ArrowRight") {
        handleDirectionChange("RIGHT");
      }

      // 如果游戏处于停止状态，按下方向键将切换游戏到开始状态
      if (gameState === "STOP") {
        setGameState("START");  // 切换为开始状态
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [gameState]);

  useEffect(() => {
    if (!isClient || isGameOver || gameState === "STOP") return;

    const interval = setInterval(() => {
      moveSnake();
    }, speed);

    return () => clearInterval(interval);
  }, [snake, direction, isGameOver, isClient, gameState, speed]);

  const moveSnake = () => {
    let newSnake = [...snake];
    let head = { ...newSnake[0] };

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
        break;
    }

    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || checkCollision(head)) {
      setIsGameOver(true);
      setGameState("STOP");  // 停止游戏
      return;
    }

    if (head.x === food.x && head.y === food.y) {
      newSnake = [head, ...newSnake];
      setFood(generateFood(newSnake, gridSize)); // 生成新的食物
    } else {
      newSnake = [head, ...newSnake.slice(0, -1)];
    }

    setSnake(newSnake);
  };

  const checkCollision = (head) => {
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }
    return false;
  };

  const handleDirectionChange = (newDirection) => {
    if (newDirection === "UP") setDirection("UP");
    if (newDirection === "DOWN") setDirection("DOWN");
    if (newDirection === "LEFT") setDirection("LEFT");
    if (newDirection === "RIGHT") setDirection("RIGHT");
  };

  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let content = "";
        if (x === food.x && y === food.y) {
          content = "🍰";
        } else {
          for (let i = 0; i < snake.length; i++) {
            if (x === snake[i].x && y === snake[i].y) {
              content = i === 0 ? "😍" : "💩";
              break;
            }
          }
        }
        grid.push(
          <div key={`${x}-${y}`} className="flex justify-center items-center w-8 h-8 border border-gray-300">
            {content}
          </div>
        );
      }
    }
    return grid;
  };

  const handleGridSizeChange = () => {
    setRows(Number(document.getElementById('rows').value));
    setCols(Number(document.getElementById('cols').value));
    setFood(generateFood(snake, gridSize));  // 更新食物位置
  };

  const resetGame = () => {
    setSnake([{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }]); // 初始化蛇的位置
    setDirection("STOP");  // 默认方向
    setFood(generateFood([], gridSize)); // 重新生成食物
    setIsGameOver(false);  // 游戏没有结束
    setGameState("STOP");  // 设置游戏为停止状态
  };

  const handleSpeedChange = (e) => {
    setSpeed(Number(e.target.value));
  };

  if (!isClient) {
    return <div>Loading...</div>;  // 客户端渲染完成前显示 loading
  }

  return (
    <div className="flex justify-center items-center min-h-screen overflow-hidden">
      {/* 游戏结束时显示吃到的💩数量 */}
      <div className="absolute top-0 left-0 w-full p-4 bg-green-500 text-white text-center">
        {isGameOver && <p>恭喜你吃到了 {snake.length - 1 } 个💩！</p>}
      </div>

      <div className="flex flex-row space-x-8 mt-20">
        {/* 设置区域 */}
        <div className="space-y-4 max-w-xs">
          <div>
            <label htmlFor="rows">Rows (行数): </label>
            <input
              id="rows"
              type="number"
              min="5"
              max="50"
              value={rows}
              onChange={handleGridSizeChange}
              className="border p-2 rounded"
            />
          </div>
          <div>
            <label htmlFor="cols">Cols (列数): </label>
            <input
              id="cols"
              type="number"
              min="5"
              max="50"
              value={cols}
              onChange={handleGridSizeChange}
              className="border p-2 rounded"
            />
          </div>

          {/* 速度控制 */}
          <div>
            <label htmlFor="speed">Speed (速度): </label>
            <input
              id="speed"
              type="range"
              min="50"
              max="500"
              value={speed}
              onChange={handleSpeedChange}
              className="border p-2 rounded"
            />
            <span>{speed} ms</span>
          </div>

          {/* 重新开始按钮 */}
          <button onClick={resetGame} className="bg-green-500 text-white py-2 px-4 rounded">重新开始</button>
        </div>

        {/* 游戏区域 */}
        <div className="grid grid-cols-10 gap-1" style={{ maxWidth: `${cols * 32}px` }}>
          {renderGrid()}
        </div>

        {/* 控制按钮 */}
        <div className="space-y-4">
          <button onClick={() => handleDirectionChange("UP")} className="px-4 py-2 bg-blue-500 text-white rounded">Up</button>
          <div className="flex flex-col space-y-2">
            <button onClick={() => handleDirectionChange("LEFT")} className="px-4 py-2 bg-blue-500 text-white rounded">Left</button>
            <button onClick={() => handleDirectionChange("RIGHT")} className="px-4 py-2 bg-blue-500 text-white rounded">Right</button>
          </div>
          <button onClick={() => handleDirectionChange("DOWN")} className="px-4 py-2 bg-blue-500 text-white rounded">Down</button>
        </div>
      </div>
    </div>
  );
}

export default SnakeGame;
