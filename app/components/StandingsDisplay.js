"use client";
import React, { useState, useEffect } from "react";
import axios from 'axios';

export default function StandingsDisplay() {
  const [standings, setStandings] = useState([]);
  const [league, setLeague] = useState("NFL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order] = useState({ field: "wins", direction: "desc" });

  const fetchStandings = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentYear = new Date().getFullYear();
      const response = await axios.get(
        `https://nfl-ncaa-highlights-api.p.rapidapi.com/standings`,
        {
          headers: {
            "x-rapidapi-host": process.env.NEXT_PUBLIC_RAPIDAPI_HOST,
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          },
          params: {
            leagueType: league,
            year: currentYear,
          },
        }
      );

      // Filter for regular season only and get most recent tables
      const regularSeasonStandings = response.data.data.filter(conference => 
        conference.seasonType.toLowerCase() === 'regular season'
      );

      // Group by conference name and take only the second entry
      const conferenceGroups = {};
      regularSeasonStandings.forEach(conference => {
        if (!conferenceGroups[conference.leagueName]) {
          conferenceGroups[conference.leagueName] = [];
        }
        conferenceGroups[conference.leagueName].push(conference);
      });

      // Get only the second table for each conference (most recent)
      const filteredStandings = Object.values(conferenceGroups)
        .map(group => group.length > 1 ? group[1] : group[0])
        .filter(Boolean);

      setStandings(filteredStandings || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
  }, [league]);

  const sortTeams = (teams) => {
    return [...teams].sort((a, b) => {
      const aWins = parseInt(a.statistics.find(stat => stat.displayName === "Wins")?.value || 0);
      const bWins = parseInt(b.statistics.find(stat => stat.displayName === "Wins")?.value || 0);
      return order.direction === "desc" ? bWins - aWins : aWins - bWins;
    });
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (!standings.length) return <p className="text-center text-gray-500">No data available.</p>;

  return (
    <div className="container mx-auto p-4 bg-gray-900 rounded-lg">
      <div className="flex justify-end mb-4">
        <select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          className="p-2 border border-gray-700 rounded bg-gray-800 text-white"
        >
          <option value="NFL">NFL</option>
        </select>
      </div>
      <div className="space-y-8">
        {standings.map((conference, index) => (
          <div 
            key={`${conference.leagueName}-${conference.seasonType}-${conference.abbreviation}-${index}`} 
            className="overflow-x-auto bg-gray-800 rounded-lg p-4"
          >
            <h2 className="text-xl font-bold mb-4 text-white">
              {conference.leagueName}
            </h2>
            <table className="min-w-full bg-gray-800 shadow-xl rounded-lg">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-200 uppercase tracking-wider cursor-pointer" 
                      onClick={() => handleSortChange("wins")}>
                    Wins {order.field === "wins" && (order.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-200 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortChange("losses")}>
                    Losses {order.field === "losses" && (order.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-200 uppercase tracking-wider">Win %</th>
                </tr>
              </thead>
              <tbody>
                {sortTeams(conference.data).map((team, teamIndex) => {
                  const wins = parseInt(team.statistics.find(stat => stat.displayName === "Wins")?.value || 0);
                  const losses = parseInt(team.statistics.find(stat => stat.displayName === "Losses")?.value || 0);
                  const winPercentage = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(1) : "0.0";

                  return (
                    <tr 
                      key={`${conference.leagueName}-${conference.seasonType}-${team.team.id}-${teamIndex}`}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 flex items-center">
                        {team.team?.logo && (
                          <img
                            src={team.team.logo}
                            alt={team.team.displayName}
                            className="w-8 h-8 mr-2"
                          />
                        )}
                        {team.team?.displayName}
                      </td>
                      <td className="px-4 py-2 text-center">{wins}</td>
                      <td className="px-4 py-2 text-center">{losses}</td>
                      <td className="px-4 py-2 text-center">{winPercentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
