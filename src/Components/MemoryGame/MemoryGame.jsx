import React, { useState, useEffect } from 'react';

function MemoryGame() {
  const [gridSize, setGridSize] = useState(4);
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [won, setWon] = useState(false);
  const [maxMoves, setMaxMoves] = useState(20);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    parseInt(localStorage.getItem('highScore')) || 0
  );

  // Audio files
  const clickSound = new Audio('..src/assets/click.wav');
  const winSound = new Audio('..src/assets/win.mp3.wav');
  const gameOverSound = new Audio('..src/assets/gameOver.mp3');

  const handleGridSizeChange = (e) => {
    let size = parseInt(e.target.value);
    if (size < 2) size = 2;
    if (size > 10) size = 10;
    if (size % 2 !== 0) size += 1;
    setGridSize(size);
  };

  const handleLevelChange = (e) => {
    setLevel(parseInt(e.target.value));
  };

  const initializeGame = () => {
    const totalCards = gridSize * gridSize;
    const pairCount = Math.ceil(totalCards / 2);
    const numbers = [...Array(pairCount).keys()].map((n) => n + 1);
    const shuffledCards = [...numbers, ...numbers]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalCards)
      .map((number, index) => ({ id: index, number }));
    setCards(shuffledCards);
    setFlipped([]);
    setSolved([]);
    setWon(false);
    setGameOver(false);
    setMoves(0);
    setScore(0);
  };

  useEffect(() => {
    const baseMoves = gridSize * gridSize;
    const levelFactor = 1 - (level - 1) * 0.1;
    const adjustedMoves = Math.ceil(baseMoves * 1.5 * levelFactor);
    setMaxMoves(adjustedMoves);
    initializeGame();
  }, [gridSize, level]);

  useEffect(() => {
    if (solved.length === cards.length && cards.length > 0) {
      setWon(true);
      calculateScore();
      winSound.play(); // Play win sound
    }
    if (moves >= maxMoves && !won) {
      setGameOver(true);
      gameOverSound.play(); // Play game over sound
    }
  }, [solved, cards, moves, maxMoves, won]);

  const calculateScore = () => {
    const efficiency = Math.max(0, ((maxMoves - moves) / maxMoves) * 100);
    const calculatedScore = Math.round(efficiency * 10); // Scale score
    setScore(calculatedScore);

    if (calculatedScore > highScore) {
      setHighScore(calculatedScore);
      localStorage.setItem('highScore', calculatedScore);
    }
  };

  const checkMatch = (secondId) => {
    const [firstId] = flipped;
    if (cards[firstId].number === cards[secondId].number) {
      setSolved([...solved, firstId, secondId]);
      setFlipped([]);
      setDisabled(false);
    } else {
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 1000);
    }
  };

  const handleClick = (id) => {
    if (disabled || won || gameOver) return;
    if (flipped.length === 0) {
      setFlipped([id]);
      clickSound.play(); // Play click sound
      return;
    }
    if (flipped.length === 1) {
      setDisabled(true);
      setMoves(moves + 1);
      if (id !== flipped[0]) {
        setFlipped([...flipped, id]);
        checkMatch(id);
      } else {
        setFlipped([]);
        setDisabled(false);
      }
    }
  };

  const isFlipped = (id) => flipped.includes(id) || solved.includes(id);
  const isSolved = (id) => solved.includes(id);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-grey-100 p-4 relative bg-[url('https://t4.ftcdn.net/jpg/01/01/05/97/240_F_101059744_v3iOQuoEiSyUxcgiILvDzWprTkShqd7c.jpg')] bg-cover bg-center">
      <h1 className="text-3xl font-bold mb-6">Memory Game</h1>

      {/* High Score Display */}
      <div className="absolute top-4 right-4 text-lg font-bold text-blue-600">
        High Score: {highScore}
      </div>

      {/* Grid Size Input */}
      <div className="mb-4">
        <label htmlFor="gridSize" className="mr-2">
          Grid Size: (max 10)
        </label>
        <input
          type="number"
          id="gridSize"
          min="2"
          max="10"
          step="2"
          value={gridSize}
          onChange={handleGridSizeChange}
          className="border-2 border-gray-300 rounded px-2 py-1"
        />
      </div>

      {/* Level Input */}
      <div className="mb-4">
        <label htmlFor="level" className="mr-2">
          Level: (1 to 5)
        </label>
        <input
          type="number"
          id="level"
          min="1"
          max="5"
          value={level}
          onChange={handleLevelChange}
          className="border-2 border-gray-300 rounded px-2 py-1"
        />
      </div>

      {/* Game Board */}
      <div
        className="grid gap-2 mb-4"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          width: `min(100%, ${gridSize * 5.5}rem)`,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleClick(card.id)}
            className={`aspect-square flex items-center justify-center text-xl font-bold rounded-lg cursor-pointer transition-all duration-300 ${
              isFlipped(card.id)
                ? isSolved(card.id)
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white"
                : "bg-gray-300 text-gray-400"
            }`}
          >
            {isFlipped(card.id) ? card.number : "?"}
          </div>
        ))}
      </div>

      {/* Result Messages */}
      {won && (
        <div className="mt-4 text-4xl font-bold text-blue-600 animate-bounce">
          You Won!
        </div>
      )}
      {gameOver && (
        <div className="mt-4 text-4xl font-bold text-red-600 animate-bounce">
          Game Over!
        </div>
      )}

      {/* Reset / Play Again Btn */}
      <button
        onClick={initializeGame}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        {won || gameOver ? "Play Again" : "Reset"}
      </button>

      {/* Moves Left and Score */}
      <div className="mt-4 text-xl">
        Moves: {moves} / {maxMoves}
      </div>
      <div className="mt-2 text-xl font-bold">
        Score: {score}
      </div>
    </div>
  );
}

export default MemoryGame;
