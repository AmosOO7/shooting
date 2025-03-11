import { useState, useEffect } from "react";
import spaceshipImg from "./assets/R.png";
import monsterImg from "./assets/R (1).png";
import bulletImg from "./assets/lazer.png";
import spaceBg from "./assets/png.monster-595.png";

// Constants for movement and speed
const PLAYER_SPEED = 0.05;
const BULLET_SPEED = 0.02;
const INITIAL_ENEMY_SPEED = 0.005;
let enemySpeed = INITIAL_ENEMY_SPEED;
const KILL_THRESHOLD = 5;
const ENEMY_SPAWN_RATE = 2000;
const MAX_ENEMY_SPEED = 0.02;
const MIN_SPAWN_RATE = 500;
const MAX_BULLETS = 4;
const RELOAD_TIME = 1000;
const MAX_ENEMIES = 10;

export default function ChickenInvaders() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerX, setPlayerX] = useState(0.5);
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [score, setScore] = useState(0);
  const [kills, setKills] = useState(0);
  const [enemySpawnRate, setEnemySpawnRate] = useState(ENEMY_SPAWN_RATE);
  const [ammo, setAmmo] = useState(MAX_BULLETS);
  const [reloading, setReloading] = useState(false);

  // Handle player movement and shooting
  useEffect(() => {
    if (!gameStarted || gameOver) return; // Disable controls if game isn't started or is over

    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" && playerX > 0.05) {
        setPlayerX((prev) => Math.max(prev - PLAYER_SPEED, 0.05));
      } else if (event.key === "ArrowRight" && playerX < 0.95) {
        setPlayerX((prev) => Math.min(prev + PLAYER_SPEED, 0.95));
      } else if (event.key === "x" && ammo > 0 && !reloading) {
        shoot();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerX, ammo, reloading, gameStarted, gameOver]);

  const shoot = () => {
    if (gameOver) return; // Prevent shooting if game is over

    setBullets((prev) => [...prev, { x: playerX, y: 0.9 }]);
    setAmmo((prev) => prev - 1);
    if (ammo === 1) {
      setReloading(true);
      setTimeout(() => {
        setAmmo(MAX_BULLETS);
        setReloading(false);
      }, RELOAD_TIME);
    }
  };

  // Update bullets and enemies movement
  useEffect(() => {
    if (!gameStarted || gameOver) return; // Stop movement updates if game isn't started or is over

    const interval = setInterval(() => {
      setBullets((prev) =>
        prev.filter((bullet) => bullet.y > -0.1).map((bullet) => ({ ...bullet, y: bullet.y - BULLET_SPEED }))
      );
      setEnemies((prev) => prev.map((enemy) => ({ ...enemy, y: enemy.y + enemySpeed })).filter((enemy) => enemy.y < 1));
    }, 50);
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  // Spawn new enemies
  useEffect(() => {
    if (!gameStarted || gameOver) return; // Stop enemy spawn if game isn't started or is over

    const spawnEnemies = setInterval(() => {
      const newEnemies = Array.from(
        { length: Math.min(Math.floor(kills / KILL_THRESHOLD) + 1, MAX_ENEMIES) },
        () => ({ x: 0.05 + Math.random() * 0.9, y: 0 })
      );
      setEnemies((prev) => [...prev, ...newEnemies]);
    }, enemySpawnRate);
    return () => clearInterval(spawnEnemies);
  }, [gameStarted, gameOver, kills, enemySpawnRate]);

  // Check bullet-enemy collisions
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    bullets.forEach((bullet, bulletIndex) => {
      enemies.forEach((enemy, enemyIndex) => {
        if (Math.abs(bullet.x - enemy.x) < 0.05 && Math.abs(bullet.y - enemy.y) < 0.05) {
          setScore((prev) => prev + 1);
          setKills((prev) => prev + 1);
          setBullets((prev) => prev.filter((_, i) => i !== bulletIndex));
          setEnemies((prev) => prev.filter((_, i) => i !== enemyIndex));
        }
      });
    });
  }, [bullets, enemies, gameStarted, gameOver]);

  // Check for game over (enemy collision with player)
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    enemies.forEach((enemy) => {
      if (Math.abs(playerX - enemy.x) < 0.05 && enemy.y > 0.9) {
        setGameOver(true);
      }
    });
  }, [enemies, playerX, gameStarted, gameOver]);

  // Restart game function
  const restartGame = () => {
    setPlayerX(0.5);
    setBullets([]);
    setEnemies([]);
    setScore(0);
    setKills(0);
    enemySpeed = INITIAL_ENEMY_SPEED;
    setEnemySpawnRate(ENEMY_SPAWN_RATE);
    setAmmo(MAX_BULLETS);
    setReloading(false);
    setGameOver(false);
    setGameStarted(true); // Start the game after restart
  };

  return (
    <div className="relative w-full h-screen border border-white bg-cover bg-center" style={{ backgroundImage: `url(${spaceBg})` }}>
      {/* Intro Overlay */}
      {!gameStarted && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-white">
          <h1 className="text-4xl font-bold mb-4">Welcome to Shooter</h1>
          <p className="text-xl text-center max-w-md">
            - Move Left: <strong>Arrow Left</strong> ⬅️ <br />
            - Move Right: <strong>Arrow Right</strong> ➡️ <br />
            - Shoot: <strong>X</strong> 🔫 <br />
            - Reloads automatically after 4 shots <br />
            - Destroy enemies and survive! 🛸
          </p>
          <button onClick={() => setGameStarted(true)} className="mt-6 px-6 py-3 bg-green-500 text-white rounded-lg text-lg">
            Start Game
          </button>
        </div>
      )}

      {/* Player */}
      <img src={spaceshipImg} alt="Player" className="absolute w-20 h-20" style={{ left: `${playerX * 100}%`, bottom: "5%" }} />

      {/* Bullets */}
      {bullets.map((bullet, index) => (
        <img key={index} src={bulletImg} alt="Bullet" className="absolute w-20 h-20 border-[1px] border-red-600 rounded-full" style={{ left: `${bullet.x * 100}%`, top: `${bullet.y * 100}%` }} />
      ))}

      {/* Enemies */}
      {enemies.map((enemy, index) => (
        <img key={index} src={monsterImg} alt="Enemy" className="absolute w-20 h-20" style={{ left: `${enemy.x * 100}%`, top: `${enemy.y * 100}%` }} />
      ))}

      {/* Game UI */}
      <div className="absolute top-2 left-2 text-white text-lg font-bold">Score: {score}</div>
      <div className="absolute top-2 right-2 text-white text-lg font-bold">Ammo: {ammo} {reloading && "(Reloading...)"}</div>

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-white">
          <h1 className="text-4xl font-bold mb-4">Game Over</h1>
          <p className="text-xl">Score: {score}</p>
          <button onClick={restartGame} className="mt-4 px-4 py-2 bg-blue-500 rounded">Play Again</button>
        </div>
      )}
    </div>
  );
}
