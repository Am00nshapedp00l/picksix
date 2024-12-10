"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Highlights() {
  const [highlights, setHighlights] = useState([]);
  const [league, setLeague] = useState("NFL");
  const [date, setDate] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedHighlight, setSelectedHighlight] = useState(null);

  const limit = 15; // Maximum allowed by API

  const fetchHighlights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nfl-ncaa-highlights-api.p.rapidapi.com/highlights?leagueName=${league}&limit=${limit}&offset=${
          currentPage * limit
        }${date ? `&date=${date}` : ""}`,
        {
          headers: {
            "x-rapidapi-host": process.env.NEXT_PUBLIC_RAPIDAPI_HOST,
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch highlights");
      }

      const data = await response.json();
      setHighlights(data.data || []);
      setTotalPages(Math.ceil((data.pagination?.totalCount || 0) / limit));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, [league, date, currentPage]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-6">Highlights</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
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

        {/* Error and Loading States */}
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((highlight) => (
            <div
              key={highlight.id}
              className="border rounded-lg overflow-hidden shadow-lg bg-white"
            >
              {/* Highlight Preview */}
              <div className="relative aspect-video">
                {highlight.imgUrl && (
                  <img
                    src={highlight.imgUrl}
                    alt={highlight.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    highlight.type === "VERIFIED"
                      ? "bg-green-500 text-white"
                      : "bg-yellow-500 text-black"
                  }`}>
                    {highlight.type}
                  </span>
                </div>
              </div>

              {/* Highlight Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{highlight.title}</h3>
                {highlight.description && (
                  <p className="text-gray-600 text-sm mb-4">{highlight.description}</p>
                )}

                {/* Match Info */}
                <div className="text-sm text-gray-500 mb-4">
                  <p>{highlight.match.league} - {new Date(highlight.match.date).toLocaleDateString()}</p>
                  <p>{highlight.match.homeTeam.displayName} vs {highlight.match.awayTeam.displayName}</p>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  {highlight.embedUrl ? (
                    <button
                      onClick={() => setSelectedHighlight(highlight)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Watch Highlight
                    </button>
                  ) : (
                    <a
                      href={highlight.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      View on {highlight.source}
                    </a>
                  )}
                  <span className="text-sm text-gray-500">{highlight.channel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-4">
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

        {/* Highlight Modal */}
        {selectedHighlight && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{selectedHighlight.title}</h2>
                  <button
                    onClick={() => setSelectedHighlight(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="aspect-video">
                  <iframe
                    src={selectedHighlight.embedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
                {selectedHighlight.description && (
                  <p className="mt-4 text-gray-600">{selectedHighlight.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
