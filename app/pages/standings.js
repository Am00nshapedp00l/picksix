import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Standings() {
  const [standings, setStandings] = useState([]);
  const [league, setLeague] = useState("NFL"); // Default league
  const [year, setYear] = useState(2024); // Default year
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const limit = 10; // Number of standings per page

  // Fetch standings from the API
  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true);
      setError(null); // Reset error state

      try {
        const response = await fetch(
          `https://nfl-ncaa-highlights-api.p.rapidapi.com/standings?leagueType=${league}&year=${year}&limit=${limit}&offset=${
            currentPage * limit
          }`,
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
            `Failed to fetch standings: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        setStandings(data.standings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [league, year, currentPage]);

  return (
    <>
      {/* Navbar */}
      <Navbar />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-4">Standings</h1>

        {/* League and Year Selectors */}
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
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="p-2 border border-gray-300 rounded"
            min="1900"
            max="2099"
          />
        </div>

        {/* Error Display */}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {/* Loading Indicator */}
        {loading && <div className="text-center">Loading...</div>}

        {/* Standings Table */}
        {!loading && standings.length > 0 && (
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Team</th>
                <th className="border border-gray-300 p-2">Wins</th>
                <th className="border border-gray-300 p-2">Losses</th>
                <th className="border border-gray-300 p-2">Ties</th>
                <th className="border border-gray-300 p-2">PCT</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, index) => (
                <tr key={index} className="text-center">
                  <td className="border border-gray-300 p-2">{team.teamName}</td>
                  <td className="border border-gray-300 p-2">{team.wins}</td>
                  <td className="border border-gray-300 p-2">{team.losses}</td>
                  <td className="border border-gray-300 p-2">{team.ties}</td>
                  <td className="border border-gray-300 p-2">{team.pct}</td>
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
        {!loading && standings.length === 0 && !error && (
          <p className="text-center mt-4">No standings data available.</p>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
