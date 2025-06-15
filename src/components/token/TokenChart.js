// components/token/TokenChart.js
import React, { useEffect, useState } from "react";
import { getDexScreenerPair } from "../../services/dexScreenerService";

const TokenChart = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pairData, setPairData] = useState(null);

  useEffect(() => {
    const loadPairData = async () => {
      console.log("TokenChart: Full token data received:", JSON.stringify(token, null, 2));
      if (!token) {
        console.log("TokenChart: No token data provided");
        setError("No token data available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("TokenChart: Calling getDexScreenerPair with token:", {
          address: token.address,
          pair_address: token.pair_address
        });
        const data = await getDexScreenerPair(token);
        console.log("TokenChart: Received pair data:", JSON.stringify(data, null, 2));
        setPairData(data);
      } catch (err) {
        console.error("TokenChart: Error loading pair data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPairData();
  }, [token]);

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-dex-bg-secondary rounded-lg flex items-center justify-center">
        <span className="text-dex-text-secondary">Loading chart data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] bg-dex-bg-secondary rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading chart</p>
          <p className="text-dex-text-secondary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!pairData || !pairData.pairAddress) {
    return (
      <div className="w-full h-[600px] bg-dex-bg-secondary rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-dex-text-secondary">No chart data available</p>
        </div>
      </div>
    );
  }

  // Construct the DexScreener widget URL using the pair address
  const widgetUrl = `https://dexscreener.com/pulsechain/${pairData.pairAddress}?embed=1&theme=dark&trades=0&info=0`;

  return (
    <div className="w-full">
      <div className="w-full h-[600px] bg-dex-bg-secondary rounded-lg overflow-hidden">
        <iframe
          src={widgetUrl}
          title="DexScreener Chart"
          className="w-full h-full border-0"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
};

export default TokenChart;
