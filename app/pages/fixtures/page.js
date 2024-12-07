"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Fixtures() {
  const [fixtures, setFixtures] = useState([]);
  const [league, setLeague] = useState("NFL"); // Default league
  const [date, setDate] = useState(""); // Default date filter
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const limit = 10; // Number of fixtures per page
  const refreshInterval = 5 * 60 * 1000; // Refresh every 5 minutes (in ms)

  // Fetch fixtures from the API
  const fetchFixtures = async () => {
    setLoading(true);
    setError(null);

    const dateParam = date ? `&date=${date}` : ""; // Add date filter if set

    try {
      const response = await fetch(
        `https://nfl-ncaa-highlights-api.p.rapidapi.com/matches?leagueType=${league}&limit=${limit}&offset=${
          currentPage * limit
        }${dateParam}`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "nfl-ncaa-highlights-api.p.rapidapi.com",
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch fixtures: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setFixtures(data.matches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh with a set interval
  useEffect(() => {
    fetchFixtures();

    const interval = setInterval(() => {
      fetchFixtures();
    }, refreshInterval);

    return () => clearInterval(interval); // Clean up on unmount
  }, [league, date, currentPage]);

  return (
    <>
      {/* Navbar */}
      <Navbar />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-4">Fixtures</h1>

        {/* League and Date Filters */}
        <div className="flex justify-center space-x-4 mb-6">
          <select
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="NFL">NFL</option>
            <option value="AFC">AFC</option>
            <option value="NFC">NFC</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        {/* Error Display */}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {/* Loading Indicator */}
        {loading && <div className="text-center">Loading...</div>}

        {/* Fixtures Table */}
        {!loading && fixtures.length > 0 && (
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Date & Time</th>
                <th className="border border-gray-300 p-2">Home Team</th>
                <th className="border border-gray-300 p-2">Away Team</th>
              </tr>
            </thead>
            <tbody>
              {fixtures.map((match, index) => (
                <tr key={index} className="text-center">
                  <td className="border border-gray-300 p-2">
                    {new Date(match.dateTime).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2 flex items-center justify-center space-x-2">
                    <img
                      src={match.homeTeamLogo}
                      alt={match.homeTeam}
                      className="w-6 h-6"
                    />
                    <span>{match.homeTeam}</span>
                  </td>
                  <td className="border border-gray-300 p-2 flex items-center justify-center space-x-2">
                    <img
                      src={match.awayTeamLogo}
                      alt={match.awayTeam}
                      className="w-6 h-6"
                    />
                    <span>{match.awayTeam}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Controls */}
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
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Next
          </button>
        </div>

        {/* No Data Fallback */}
        {!loading && fixtures.length === 0 && !error && (
          <p className="text-center mt-4">No fixtures data available.</p>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
