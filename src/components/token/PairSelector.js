import React from "react";

const PairSelector = ({ pairs, selectedPair, onSelect }) => {
  if (!pairs || pairs.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <select
        value={selectedPair?.pairAddress || ""}
        onChange={(e) => {
          const pair = pairs.find((p) => p.pairAddress === e.target.value);
          if (pair) {
            onSelect(pair.pairAddress);
          }
        }}
        className="w-full p-2 bg-dex-bg-secondary border border-dex-border rounded-lg text-dex-text-primary focus:outline-none focus:border-dex-blue"
      >
        {pairs.map((pair) => (
          <option key={pair.pairAddress} value={pair.pairAddress}>
            {pair.pairLabel} on {pair.exchangeName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PairSelector;
