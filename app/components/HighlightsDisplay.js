"use client";
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function HighlightsDisplay() {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHighlight, setSelectedHighlight] = useState(null);

  const fetchHighlights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nfl-ncaa-highlights-api.p.rapidapi.com/highlights?limit=15`,
        {
          headers: {
            "x-rapidapi-host": process.env.NEXT_PUBLIC_RAPIDAPI_HOST,
            "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch highlights");
      
      const data = await response.json();
      setHighlights(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  if (loading) return <div className="text-center p-4">Loading highlights...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  if (!highlights.length) return <div className="text-center p-4">No highlights found</div>;

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-6">Recent Highlights</h1>

        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((highlight) => (
            <div key={highlight.id} className="border rounded-lg overflow-hidden shadow-lg bg-white">
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
                    highlight.type === "VERIFIED" ? "bg-green-500 text-white" : "bg-yellow-500 text-black"
                  }`}>
                    {highlight.type}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{highlight.title}</h3>
                <div className="text-sm text-gray-500 mb-4">
                  <p>{highlight.match.league} - {new Date(highlight.match.date).toLocaleDateString()}</p>
                  <p>{highlight.match.homeTeam.displayName} vs {highlight.match.awayTeam.displayName}</p>
                </div>

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
                </div>
              </div>
            </div>
          ))}
        </div>

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
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
