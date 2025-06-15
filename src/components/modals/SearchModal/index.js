// components/modals/searchModal/index.js
import React, { useState, useEffect, useRef } from "react";
import SearchResults from "./searchResults";
import { getPumpTokens } from '../../../services/tokenService';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [trendingTokens, setTrendingTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allTokens, setAllTokens] = useState([]);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // Pre-fetch all tokens when component mounts
  useEffect(() => {
    const loadTokens = async () => {
      try {
        setLoading(true);
        const tokens = await getPumpTokens();
        setAllTokens(tokens);
        
        // Set trending tokens based on liquidity or volume
        const trending = tokens
          .filter(token => {
            const liquidity = Number(token.liquidity) || 0;
            const volume = Number(token.volume24h) || 0;
            return liquidity > 10000 || volume > 5000;
          })
          .slice(0, 10);
        setTrendingTokens(trending);
      } catch (error) {
        console.error("Error loading tokens:", error);
        setTrendingTokens([]);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }

    // Add event listeners for escape key and outside clicks
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        performSearch(searchTerm);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, allTokens]); // Add allTokens as dependency

  const performSearch = async (query) => {
    console.log('Searching for:', query, allTokens.length)
    if (!query || !allTokens.length) return;
    
    setLoading(true);
    try {
      const q = query.trim().toLowerCase();
      const filtered = allTokens.filter(token =>
        token.name?.toLowerCase().includes(q) ||
        token.symbol?.toLowerCase().includes(q) ||
        token.address?.toLowerCase().includes(q)
      );
      setResults(filtered);
    } catch (error) {
      setResults([]);
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black bg-opacity-80"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-dex-bg-secondary rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-dex-border">
          <div className="flex items-center">
            <div className="flex-1 flex items-center bg-dex-bg-primary rounded-lg px-3 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-dex-text-secondary mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for tokens by name, symbol, or address"
                className="bg-transparent w-full focus:outline-none text-dex-text-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-dex-text-secondary hover:text-dex-text-primary transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(80vh-70px)]">
          {searchTerm.trim() ? (
            loading ? (
              <div className="p-4 text-center text-dex-text-secondary">
                Searching...
              </div>
            ) : (
              <SearchResults results={results} onClose={onClose} />
            )
          ) : (
            // Show trending tokens when no search term
            <SearchResults results={trendingTokens} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
