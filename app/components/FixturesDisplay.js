"use client";
import React, { useState, useEffect } from "react";

export default function FixturesDisplay() {
  const [pastMatches, setPastMatches] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [league, setLeague] = useState("NFL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const limit = 10; // Number of matches per page
  const [pastPage, setPastPage] = useState(0);
  const [livePage, setLivePage] = useState(0);
  const [upcomingPage, setUpcomingPage] = useState(0);

  const fetchMatches = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentYear = new Date().getFullYear();
      const params = new URLSearchParams({
        league: "NFL",        // Use 'league' instead of 'leagueType'
        season: currentYear.toString(),  // Add season parameter
        limit: "100",
        timezone: "America/New_York"    // Add timezone parameter
      });

      const url = `https://${process.env.NEXT_PUBLIC_RAPIDAPI_HOST}/matches?${params}`;

      const response = await fetch(
        url,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": process.env.NEXT_PUBLIC_RAPIDAPI_HOST,
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const fetchedMatches = data.data || [];

      // Process and sort matches
      const now = new Date();
      const past = [];
      const live = [];
      const upcoming = [];

      fetchedMatches.forEach((match) => {
        const matchDate = new Date(match.date);
        const status = match.state?.status?.toLowerCase();

        // Updated status checks based on API documentation
        if (status === "live" || status === "in_play") {
          live.push(match);
        } else if (status === "finished" || status === "closed" || 
          (matchDate < now && status !== "postponed" && status !== "cancelled")) {
          past.push(match);
        } else if (status === "scheduled" || status === "not_started" || matchDate > now) {
          upcoming.push(match);
        }
      });

      // Sort matches by date
      const sortByDate = (a, b) => new Date(a.date) - new Date(b.date);
      past.sort(sortByDate).reverse(); // Most recent first
      live.sort(sortByDate);
      upcoming.sort(sortByDate);

      setPastMatches(past);
      setLiveMatches(live);
      setUpcomingMatches(upcoming);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  }, [league]);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const formatMatchDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      });
    } catch {
      return dateString;
    }
  };

  // Handlers for page changes
  const handlePageChange = (category, direction) => {
    if (category === 'past') {
      setPastPage((prev) => Math.max(prev + direction, 0));
    } else if (category === 'live') {
      setLivePage((prev) => Math.max(prev + direction, 0));
    } else if (category === 'upcoming') {
      setUpcomingPage((prev) => Math.max(prev + direction, 0));
    }
  };

  const renderMatches = (matches, page, category) => (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {matches.slice(page * limit, (page + 1) * limit).map((match) => (
          <MatchCard key={match.id} match={match} formatMatchDate={formatMatchDate} />
        ))}
      </div>
      <div className="flex justify-center mt-4 space-x-4">
        <button
          disabled={page === 0}
          onClick={() => handlePageChange(category, -1)}
          className={`px-4 py-2 rounded ${
            page === 0
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          Previous
        </button>
        <button
          disabled={(page + 1) * limit >= matches.length}
          onClick={() => handlePageChange(category, 1)}
          className={`px-4 py-2 rounded ${
            (page + 1) * limit >= matches.length
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          Next
        </button>
      </div>
    </>
  );

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
        <div className="text-center text-white">
          Loading matches...
        </div>
      )}

      {error && (
        <div className="text-center text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {liveMatches.length > 0 && (
            <div>
              <h2 className="text-2xl text-white mb-4">Live Matches</h2>
              {renderMatches(liveMatches, livePage, 'live')}
            </div>
          )}

          {upcomingMatches.length > 0 && (
            <div>
              <h2 className="text-2xl text-white mt-8 mb-4">Upcoming Matches</h2>
              {renderMatches(upcomingMatches, upcomingPage, 'upcoming')}
            </div>
          )}

          {pastMatches.length > 0 && (
            <div>
              <h2 className="text-2xl text-white mt-8 mb-4">Past Matches</h2>
              {renderMatches(pastMatches, pastPage, 'past')}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MatchCard({ match, formatMatchDate }) {
  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-gray-800 text-white">
      <div className="text-sm text-gray-400 mb-2">
        {formatMatchDate(match.date)}
      </div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          {match.homeTeam?.logo && (
            <img
              src={match.homeTeam.logo}
              alt={match.homeTeam.displayName}
              className="w-8 h-8 mr-2"
            />
          )}
          <span>{match.homeTeam?.displayName}</span>
        </div>
        <span className="font-bold">
          {match.state?.score?.current?.split('-')[0] || '-'}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {match.awayTeam?.logo && (
            <img
              src={match.awayTeam.logo}
              alt={match.awayTeam.displayName}
              className="w-8 h-8 mr-2"
            />
          )}
          <span>{match.awayTeam?.displayName}</span>
        </div>
        <span className="font-bold">
          {match.state?.score?.current?.split('-')[1] || '-'}
        </span>
      </div>
    </div>
  );
}
