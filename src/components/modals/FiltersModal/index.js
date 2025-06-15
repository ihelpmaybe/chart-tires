// components/modals/FiltersModal/index.js
import React, { useState, useEffect } from "react";
import FilterCondition from "./FilterCondition";
import SortBySelector from "./SortBySelector";

// Available metrics for filtering
const AVAILABLE_METRICS = [
  { value: "tokenAge", label: "Token Age" },
  { value: "holders", label: "Holders" },
  { value: "buyers", label: "Buyers" },
  { value: "sellers", label: "Sellers" },
  { value: "netBuyers", label: "Net Buyers" },
  { value: "experiencedBuyers", label: "Experienced Buyers" },
  { value: "experiencedSellers", label: "Experienced Sellers" },
  { value: "netExperiencedBuyers", label: "Net Experienced Buyers" },
  { value: "fullyDilutedValuation", label: "Fully Diluted Valuation" },
  { value: "marketCap", label: "Market Cap" },
  { value: "usdPricePercentChange", label: "Price Change %" },
  { value: "liquidityChange", label: "Liquidity Change" },
  { value: "liquidityChangeUSD", label: "Liquidity Change USD" },
  { value: "volumeUsd", label: "Volume USD" },
  { value: "buyVolumeUsd", label: "Buy Volume USD" },
  { value: "sellVolumeUsd", label: "Sell Volume USD" },
  { value: "netVolumeUsd", label: "Net Volume USD" },
  { value: "securityScore", label: "Security Score" },
];

// Available time frames
const TIME_FRAMES = [
  { value: "tenMinutes", label: "10 Minutes" },
  { value: "thirtyMinutes", label: "30 Minutes" },
  { value: "oneHour", label: "1 Hour" },
  { value: "fourHours", label: "4 Hours" },
  { value: "twelveHours", label: "12 Hours" },
  { value: "oneDay", label: "1 Day" },
  { value: "oneWeek", label: "1 Week" },
  { value: "oneMonth", label: "1 Month" },
];

// Comparison operators
const OPERATORS = [
  { value: "gt", label: "Greater Than" },
  { value: "lt", label: "Less Than" },
  { value: "eq", label: "Equal To" },
];

// Chain options
const CHAINS = [
  { value: "0x1", label: "Ethereum" },
  { value: "solana", label: "Solana" },
  { value: "0x38", label: "BSC" },
  { value: "0x89", label: "Polygon" },
  { value: "0x2105", label: "Base" },
  { value: "0xa4b1", label: "Arbitrum" },
  { value: "0xa", label: "Optimism" },
  { value: "0xa86a", label: "Avalanche" },
  { value: "0x171", label: "Pulse" },
  { value: "0x7e4", label: "Ronin" },
];

const FiltersModal = ({ isOpen, onClose, onApplyFilters }) => {
  const [chain, setChain] = useState("0x1");
  const [filters, setFilters] = useState([
    {
      id: 1,
      metric: "experiencedBuyers",
      timeFrame: "oneMonth",
      operator: "gt",
      value: "10",
    },
  ]);
  const [sortBy, setSortBy] = useState({
    metric: "experiencedBuyers",
    timeFrame: "oneMonth",
    type: "DESC",
  });
  const [limit, setLimit] = useState(20);

  // Add a new filter condition
  const addFilter = () => {
    const newId =
      filters.length > 0 ? Math.max(...filters.map((f) => f.id)) + 1 : 1;
    setFilters([
      ...filters,
      {
        id: newId,
        metric: "experiencedBuyers",
        timeFrame: "oneMonth",
        operator: "gt",
        value: "10",
      },
    ]);
  };

  // Remove a filter condition
  const removeFilter = (id) => {
    setFilters(filters.filter((filter) => filter.id !== id));
  };

  // Update a filter condition
  const updateFilter = (id, field, value) => {
    setFilters(
      filters.map((filter) =>
        filter.id === id ? { ...filter, [field]: value } : filter
      )
    );
  };

  // Inside FiltersModal component, modify the applyFilters function:

  const applyFilters = async () => {
    try {
      const formattedFilters = filters.map(
        ({ metric, timeFrame, operator, value }) => ({
          metric,
          timeFrame,
          [operator]: value,
        })
      );

      const payload = {
        chain,
        filters: formattedFilters,
        sortBy,
        // Request multiple timeframes to populate the table correctly
        timeFramesToReturn: [
          "tenMinutes",
          "oneHour",
          "fourHours",
          "twelveHours",
          "oneDay",
          "oneWeek",
          "oneMonth",
        ],
        // Request all supported metrics needed for the table display
        metricsToReturn: [
          "holders",
          "buyers",
          "sellers",
          "netBuyers",
          "volumeUsd",
          "buyVolumeUsd",
          "sellVolumeUsd",
          "marketCap",
          "fullyDilutedValuation",
          "usdPricePercentChange",
          "liquidityChangeUSD",
        ],
        limit,
      };

      console.log("Sending filter request:", payload);

      // Filtering is not supported without Moralis. Show an alert and close.
      alert("Advanced filtering is currently unavailable.");
      onClose();
    } catch (error) {
      console.error("Error applying filters:", error);
      alert("Error applying filters. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      onClick={onClose}
    >
      <div
        className="bg-dex-bg-secondary rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-dex-border flex items-center justify-between">
          <h2 className="text-xl font-semibold text-dex-text-primary">
            Advanced Filters
          </h2>
          <button
            className="text-dex-text-secondary hover:text-dex-text-primary"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6 max-h-[calc(90vh-70px)]">
          {/* Chain Selection */}
          <div className="mb-6">
            <label className="block text-dex-text-secondary uppercase text-sm font-semibold mb-2">
              Chain
            </label>
            <select
              className="w-full px-3 py-2 bg-dex-bg-tertiary border border-dex-border rounded text-dex-text-primary"
              value={chain}
              onChange={(e) => setChain(e.target.value)}
            >
              {CHAINS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Conditions */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-dex-text-secondary uppercase text-sm font-semibold">
                Filter Conditions
              </label>
              <button
                className="px-2 py-1 bg-dex-blue text-white rounded text-sm"
                onClick={addFilter}
              >
                + Add Condition
              </button>
            </div>

            {filters.length === 0 ? (
              <div className="bg-dex-bg-tertiary rounded-lg p-4 text-center text-dex-text-secondary">
                No filter conditions. Add one to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {filters.map((filter) => (
                  <FilterCondition
                    key={filter.id}
                    filter={filter}
                    metrics={AVAILABLE_METRICS}
                    timeFrames={TIME_FRAMES}
                    operators={OPERATORS}
                    onUpdate={(field, value) =>
                      updateFilter(filter.id, field, value)
                    }
                    onRemove={() => removeFilter(filter.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sort By */}
          <div className="mb-6">
            <label className="block text-dex-text-secondary uppercase text-sm font-semibold mb-2">
              Sort By
            </label>
            <SortBySelector
              sortBy={sortBy}
              metrics={AVAILABLE_METRICS}
              timeFrames={TIME_FRAMES}
              onChange={setSortBy}
            />
          </div>

          {/* Limit */}
          <div className="mb-6">
            <label className="block text-dex-text-secondary uppercase text-sm font-semibold mb-2">
              Number of Results
            </label>
            <select
              className="w-full px-3 py-2 bg-dex-bg-tertiary border border-dex-border rounded text-dex-text-primary"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-dex-border flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-dex-bg-tertiary text-dex-text-primary rounded hover:bg-dex-bg-highlight"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-dex-blue text-white rounded hover:bg-blue-600"
            onClick={applyFilters}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersModal;
