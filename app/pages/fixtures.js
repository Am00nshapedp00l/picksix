import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Fixtures() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const response = await axios.get(
          'https://nfl-ncaa-highlights-api.p.rapidapi.com/matches',
          {
            params: { league: 'NFL', date: '2024-12-06' },
            headers: {
              'x-rapidapi-host': 'nfl-ncaa-highlights-api.p.rapidapi.com',
              'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            },
          }
        );
        setFixtures(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch fixtures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading fixtures...</div>;
  }

  if (!fixtures.length) {
    return <div className="text-center py-10">No fixtures found.</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Fixtures</h1>
        <div className="space-y-6">
          {fixtures.map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between p-4 bg-white shadow rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={match.homeTeam.logo}
                  alt={match.homeTeam.displayName}
                  className="w-10 h-10"
                />
                <span className="text-lg font-medium">{match.homeTeam.displayName}</span>
              </div>
              <span className="text-gray-600">{new Date(match.date).toLocaleString()}</span>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium">{match.awayTeam.displayName}</span>
                <img
                  src={match.awayTeam.logo}
                  alt={match.awayTeam.displayName}
                  className="w-10 h-10"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
