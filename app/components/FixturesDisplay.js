"use client";
import React, { useState, useEffect } from "react";

export default function FixturesDisplay() {
  const [matches, setMatches] = useState([]);
  const [league, setLeague] = useState("NFL");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [mounted, setMounted] = useState(false);

  const limit = 10;

  // Memoize fetchMatches to prevent recreation on every render
  const fetchMatches = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const CURRENT_SEASON = 2024; // 2024-2025 NFL season
      
      const params = new URLSearchParams({
        league: league,
        limit: limit.toString(),
        offset: (currentPage * limit).toString(),
        season: CURRENT_SEASON.toString(),
        round: 'regular-season' // Ensure we get regular season matches
      });

      const response = await fetch(
        `https://nfl-ncaa-highlights-api.p.rapidapi.com/matches?${params}`,
        {
          method: 'GET',
          headers: {
            "x-rapidapi-host": process.env.NEXT_PUBLIC_RAPIDAPI_HOST,
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Sort matches by date and state for 2024-2025 season
      const sortedMatches = (data.data || []).sort((a, b) => {
        // First sort by date
        const dateComparison = new Date(b.date) - new Date(a.date);
        if (dateComparison !== 0) return dateComparison;

        // Then sort by state if dates are equal
        const stateOrder = {
          'in progress': 0,
          'end period': 1,
          'half time': 2,
          'scheduled': 3,
          'finished': 4,
          'postponed': 5,
          'suspended': 6,
          'cancelled': 7,
          'abandoned': 8,
          'unknown': 9
        };

        const aState = a.state?.description?.toLowerCase() || 'unknown';
        const bState = b.state?.description?.toLowerCase() || 'unknown';
        
        return stateOrder[aState] - stateOrder[bState];
      });

      setMatches(sortedMatches);
      setTotalPages(Math.ceil((data.pagination?.totalCount || 0) / limit));
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [league, currentPage]);

  // Handle mount state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle data fetching
  useEffect(() => {
    if (mounted) {
      fetchMatches();
      // Auto-refresh every minute for live matches
      const interval = setInterval(fetchMatches, 60000);
      return () => clearInterval(interval);
    }
  }, [mounted, fetchMatches]); // Updated dependencies

  const formatMatchDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (!mounted) return null;

  // Add delay between pagination requests to avoid rate limiting
  const handlePageChange = async (newPage) => {
    if (newPage === currentPage) return;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Add 1s delay
    setCurrentPage(newPage);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900">
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          className="p-2 border border-gray-700 rounded bg-gray-800 text-white"
        >
          <option value="NFL">NFL</option>
        </select>
      </div>

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center mb-4">
          {error}
        </div>
      )}

      {!loading && !error && matches.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((match) => (
            <div 
              key={match.id}
              className="border border-gray-700 rounded-lg p-4 bg-gray-800 text-white"
            >
              <div className="text-sm text-gray-400 mb-2">
                {formatMatchDate(match.date)}
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <img 
                    src={match.homeTeam?.logo} 
                    alt={match.homeTeam?.displayName}
                    className="w-8 h-8 mr-2"
                  />
                  <span>{match.homeTeam?.displayName}</span>
                </div>
                <span className="font-bold">
                  {match.state?.score?.current?.split('-')[0] || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <img 
                    src={match.awayTeam?.logo} 
                    alt={match.awayTeam?.displayName}
                    className="w-8 h-8 mr-2"
                  />
                  <span>{match.awayTeam?.displayName}</span>
                </div>
                <span className="font-bold">
                  {match.state?.score?.current?.split('-')[1] || '-'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-4 space-x-4">
        <button
          disabled={currentPage === 0}
          onClick={() => handlePageChange(Math.max(currentPage - 1, 0))}
          className={`px-4 py-2 rounded ${
            currentPage === 0 
              ? "bg-gray-700 text-gray-500 cursor-not-allowed" 
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          Previous
        </button>
        <button
          disabled={currentPage >= totalPages - 1}
          onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages - 1))}
          className={`px-4 py-2 rounded ${
            currentPage >= totalPages - 1
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}