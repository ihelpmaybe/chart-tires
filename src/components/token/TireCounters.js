import React, { useState } from "react";

export default function TireCounters({ rocket = 0, fire = 0, poop = 0, flag = 0 }) {
  const [rocketCount, setRocketCount] = useState(rocket);
  const [fireCount, setFireCount] = useState(fire);
  const [poopCount, setPoopCount] = useState(poop);
  const [flagCount, setFlagCount] = useState(flag);
  const [clicked, setClicked] = useState(false);

  const handleClick = (type) => {
    if (clicked) return;
    setClicked(true);
    if (type === 'rocket') setRocketCount(c => c + 1);
    if (type === 'fire') setFireCount(c => c + 1);
    if (type === 'poop') setPoopCount(c => c + 1);
    if (type === 'flag') setFlagCount(c => c + 1);
  };

  return (
    <div className="flex gap-8 my-4 justify-center">
      <button
        className="flex flex-col items-center hover:scale-110 transition focus:outline-none disabled:opacity-50"
        onClick={() => handleClick('rocket')}
        title="Rocket"
        type="button"
        disabled={clicked}
      >
        <span className="text-3xl">🚀</span>
        <span className="text-lg font-bold text-yellow-300">{rocketCount}</span>
      </button>
      <button
        className="flex flex-col items-center hover:scale-110 transition focus:outline-none disabled:opacity-50"
        onClick={() => handleClick('fire')}
        title="Fire"
        type="button"
        disabled={clicked}
      >
        <span className="text-3xl">🔥</span>
        <span className="text-lg font-bold text-orange-400">{fireCount}</span>
      </button>
      <button
        className="flex flex-col items-center hover:scale-110 transition focus:outline-none disabled:opacity-50"
        onClick={() => handleClick('poop')}
        title="Poop"
        type="button"
        disabled={clicked}
      >
        <span className="text-3xl">💩</span>
        <span className="text-lg font-bold text-brown-500">{poopCount}</span>
      </button>
      <button
        className="flex flex-col items-center hover:scale-110 transition focus:outline-none disabled:opacity-50"
        onClick={() => handleClick('flag')}
        title="Flag"
        type="button"
        disabled={clicked}
      >
        <span className="text-3xl">🚩</span>
        <span className="text-lg font-bold text-red-400">{flagCount}</span>
      </button>
    </div>
  );
}
