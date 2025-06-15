import Web3 from "web3";

/**
 * Format a number with K, M, B suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  num = Number(num);
  if (isNaN(num) || !isFinite(num)) return "$0";
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

/**
 * Format a unix timestamp into a human-readable age (e.g., "2h", "3d", "1mo")
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted age
 */
export const formatAge = (timestamp) => {
  if (!timestamp) return "N/A";

  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = diffMs / 1000;

  if (diffSec < 60) return Math.floor(diffSec) + "s";
  if (diffSec < 3600) return Math.floor(diffSec / 60) + "m";
  if (diffSec < 86400) return Math.floor(diffSec / 3600) + "h";
  if (diffSec < 2592000) return Math.floor(diffSec / 86400) + "d";
  if (diffSec < 31536000) return Math.floor(diffSec / 2592000) + "mo";
  return Math.floor(diffSec / 31536000) + "y";
};

/**
 * Format a price value (especially for small crypto prices)
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
export const formatPrice = (price) => {
  const n = Number(price);
  if (isNaN(n) || !isFinite(n)) return "$0";
  if (n === 0) return "$0.00";
  if (n < 0.000001) return `$${n.toExponential(4)}`;
  if (n < 0.01) return `$${n.toFixed(8).replace(/\.?0+$/, '')}`;
  if (n < 1) return `$${n.toFixed(6).replace(/\.?0+$/, '')}`;
  if (n < 100) return `$${n.toFixed(4).replace(/\.?0+$/, '')}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

/**
 * Format percent change with colors and sign
 * @param {number} value - Percent value
 * @param {boolean} withColor - Whether to include color HTML
 * @returns {string} Formatted percent change
 */
export const formatPercentChange = (value, withColor = false) => {
  if (value === undefined || value === null) return "-";

  const formatted = `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

  if (withColor) {
    const colorClass = value >= 0 ? "text-green-500" : "text-red-500";
    return `<span class="${colorClass}">${formatted}</span>`;
  }

  return formatted;
};


/**
 * Truncate an address/account string
 * @param {string} address - Full address
 * @param {number} start - Characters to show at start
 * @param {number} end - Characters to show at end
 * @returns {string} Truncated address
 */
export const truncateAddress = (address, start = 6, end = 4) => {
  if (!address) return "";
  if (address.length <= start + end) return address;

  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

/**
 * Get the correct logo URL for a token
 * @param {object} token - Token object
 * @returns {string} Logo URL
 */
export const getTokenLogoUrl = (token) => {
  if (token.image_cid) {
    return `https://ipfs.io/ipfs/${token.image_cid}`;
  }
  return "/images/tokens/default-token.svg";
};
