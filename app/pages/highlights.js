import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import { fetchHighlights } from '../utils/apiclient';

export default function Highlights() {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHighlights = async () => {
      try {
        const data = await fetchHighlights();
        setHighlights(data?.matches || []); // Adjust based on the API response structure
        setLoading(false);
      } catch (err) {
        setError('Failed to load highlights');
        setLoading(false);
      }
    };

    loadHighlights();
  }, []);

  return (
    <>
      <Navbar />
      <main className="bg-gray-100 min-h-screen py-10">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-blue-800 mb-6 text-center">Match Highlights</h1>
          {loading && <p className="text-center text-gray-600">Loading highlights...</p>}
          {error && <p className="text-center text-red-600">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={highlight.videoUrl} // Assuming API returns a `videoUrl`
                    title={highlight.title}
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-800">{highlight.title}</h2>
                  <p className="text-sm text-gray-600">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
