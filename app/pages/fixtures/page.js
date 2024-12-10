"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [league, setLeague] = useState("NFL");
  const [date, setDate] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  const limit = 10;

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nfl-ncaa-highlights-api.p.rapidapi.com/matches?leagueType=${league}&limit=${limit}&offset=${
          currentPage * limit
        }${date ? `&date=${date}` : ""}`,
        {
          method: 'GET',
          headers: {
            "x-rapidapi-host": process.env.NEXT_PUBLIC_RAPIDAPI_HOST,
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Add unique IDs to each match
      const matchesWithIds = data.data.map((match, index) => ({
        ...match,
        uniqueId: `${match.id}-${index}-${Date.now()}`
      }));

      setMatches(matchesWithIds || []);
      setTotalPages(Math.ceil((data.pagination?.totalCount || 0) / limit));
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, [league, date, currentPage]);

  const groupMatchesByStatus = () => {
    const groups = {
      live: [],
      upcoming: [],
      finished: []
    };

    matches.forEach((match) => {
      const status = match.state?.description?.toLowerCase() || '';
      if (status.includes('progress') || status.includes('half') || status.includes('period')) {
        groups.live.push(match);
      } else if (status === 'finished') {
        groups.finished.push(match);
      } else {
        groups.upcoming.push(match);
      }
    });

    return groups;
  };

  const formatMatchDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const groupedMatches = groupMatchesByStatus();

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-6">Matches</h1>

        <div className="flex justify-between mb-6">
          <select
            value={league}
            onChange={(e) => {
              setLeague(e.target.value);
              setCurrentPage(0);
            }}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="NFL">NFL</option>
            <option value="NCAA">NCAA</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setCurrentPage(0);
            }}
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {Object.entries(groupedMatches).map(([status, statusMatches]) => 
          statusMatches.length > 0 && (
            <div key={`${status}-${Date.now()}`} className="mb-8">
              <h2 className="text-xl font-bold mb-4 capitalize">
                {status} Matches
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {statusMatches.map((match) => (
                  <div 
                    key={match.uniqueId} 
                    className="border rounded-lg p-4 shadow-md bg-white"
                  >
                    <div className="text-sm text-gray-500 mb-2">
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
                        {match.state?.score?.current?.split('-')[0]}
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
                        {match.state?.score?.current?.split('-')[1]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        <div className="flex justify-center mt-4 space-x-4">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            className={`px-4 py-2 bg-gray-300 rounded ${
              currentPage === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"
            }`}
          >
            Previous
          </button>
          <button
            disabled={currentPage >= totalPages - 1}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
            className={`px-4 py-2 bg-gray-300 rounded ${
              currentPage >= totalPages - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"
            }`}
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
