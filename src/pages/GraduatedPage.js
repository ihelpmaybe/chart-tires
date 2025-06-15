// pages/GraduatedPage.js
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import TrendingTable from "../components/trending/TrendingTable";
import { getPumpTokens } from "../services/tokenService";
import { getCombinedTokenData } from "../services/tokenService";

const PAGE_SIZE = 12;

const GraduatedPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isFiltered, setIsFiltered] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Helper to format numbers with K/M/B notation
  function formatNumber(num) {
    num = Number(num);
    if (isNaN(num)) return "$0";
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  }

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      try {
        // Get all tokens from local JSON
        const allTokens = await getPumpTokens();
        console.log('Fetched tokens:', allTokens.length);
        
        // Filter tokens that have required fields
        const graduatedTokens = allTokens.filter(token => 
          token.address && token.symbol && token.name
        );
        
        console.log('Filtered tokens:', graduatedTokens.length);

        // Calculate pagination before fetching live data
        const start = (page - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const pageTokens = graduatedTokens.slice(start, end);
        
        // Only fetch live data for the current page's tokens
        const mergedPageTokens = await Promise.all(pageTokens.map(async (token) => {
          try {
            const liveData = await getCombinedTokenData(token);
            // Merge token data with live data
            return {
              ...token,
              ...liveData,
              liquidity: liveData?.liquidity || token.liquidity || token.market_value || 0,
              volume24h: liveData?.volume24h || token.volume24h || token.volume || token.dailyVolumeUSD || 0,
              price: liveData?.price || token.price || 0,
              priceChange24h: liveData?.priceChange24h || token.priceChange24h || 0,
              symbol: token.symbol || liveData?.symbol || 'N/A',
              name: token.name || liveData?.name || 'N/A'
            };
          } catch (error) {
            // Return token with basic data if live data fetch fails
            return {
              ...token,
              liquidity: token.liquidity || token.market_value || 0,
              volume24h: token.volume24h || token.volume || token.dailyVolumeUSD || 0,
              price: token.price || 0,
              priceChange24h: token.priceChange24h || 0,
              symbol: token.symbol || 'N/A',
              name: token.name || 'N/A'
            };
          }
        }));

        // Sort the current page's tokens
        let sortedPageTokens = [...mergedPageTokens];
        if (sortBy) {
          const isMissing = v => v === null || v === undefined || v === '' || v === 'N/A';
          sortedPageTokens.sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];
            const aMissing = isMissing(aValue);
            const bMissing = isMissing(bValue);
            if (aMissing && bMissing) return 0;
            if (aMissing) return 1;
            if (bMissing) return -1;
            if (sortDirection === "asc") {
              return aValue - bValue;
            } else {
              return bValue - aValue;
            }
          });
        }

        setTotalPages(Math.ceil(graduatedTokens.length / PAGE_SIZE));
        setTotalCount(graduatedTokens.length);
        setTokens(sortedPageTokens);
      } catch (error) {
        console.error('Error fetching tokens:', error);
        setTokens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [page, sortBy, sortDirection]);

  // Per-page stable sorting
  const handleSortChange = (column) => {
    let direction = sortBy === column ? (sortDirection === "asc" ? "desc" : "asc") : "desc";
    setSortBy(column);
    setSortDirection(direction);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSearchParams({ page: newPage });
  };

  const handleRefresh = () => {
    handlePageChange(1);
    setIsFiltered(false);
    setLoading(true);
    setTokens([]);
  };

  // Pagination UI with arrows
  const renderPagination = () => (
    <div className="flex justify-center items-center my-4 gap-2">
      <button
        className="px-2 py-1 rounded bg-dex-bg-tertiary text-dex-text-primary hover:bg-dex-bg-highlight"
        onClick={() => handlePageChange(1)}
        disabled={page === 1}
        aria-label="First page"
      >
        &laquo;
      </button>
      <button
        className="px-2 py-1 rounded bg-dex-bg-tertiary text-dex-text-primary hover:bg-dex-bg-highlight"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        &lsaquo;
      </button>
      <span className="px-3 py-1 rounded bg-dex-blue text-white">
        {page} of {totalPages}
      </span>
      <button
        className="px-2 py-1 rounded bg-dex-bg-tertiary text-dex-text-primary hover:bg-dex-bg-highlight"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        &rsaquo;
      </button>
      <button
        className="px-2 py-1 rounded bg-dex-bg-tertiary text-dex-text-primary hover:bg-dex-bg-highlight"
        onClick={() => handlePageChange(totalPages)}
        disabled={page === totalPages}
        aria-label="Last page"
      >
        &raquo;
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full theme-vaporwave">
      <div className="flex items-center justify-between px-4 py-2 bg-dex-bg-secondary">
        <h1 className="text-xl font-semibold text-white">Graduated Tokens</h1>
        <div className="text-sm text-dex-text-secondary">
          Showing page {page} of {totalPages}
        </div>
      </div>
      <TopBar
        isFiltered={isFiltered}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onRefresh={handleRefresh}
      />
      <TrendingTable
        tokens={tokens}
        loading={loading}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        currentPage={page}
        pageSize={PAGE_SIZE}
        totalCount={totalCount}
      />
      {renderPagination()}
    </div>
  );
};

export default GraduatedPage; 