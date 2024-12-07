import axios from 'axios';
import { NextResponse } from 'next/server';


const apiClient = axios.create({
  baseURL: 'https://nfl-ncaa-highlights-api.p.rapidapi.com',
  headers: {
    'x-rapidapi-host': process.env.RAPIDAPI_HOST,
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
  },
});



// Generic Fetch Function
const fetchData = async (endpoint, params = {}) => {
  try {
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};

// Fetch Highlights Function
const fetchHighlights = async () => {
  try {
    const response = await apiClient.get('/matches/highlights');
    return response.data; // Adjust based on API response structure
  } catch (error) {
    console.error('Error fetching highlights:', error);
    throw error;
  }
};

const fetchFixtures = async () => {
  setLoading(true);
  setError(null);

  const dateParam = date ? `&date=${date}` : "";
  const url = `https://nfl-ncaa-highlights-api.p.rapidapi.com/matches?leagueType=${league}&limit=${limit}&offset=${currentPage * limit}${dateParam}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "nfl-ncaa-highlights-api.p.rapidapi.com",
        "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("API Error Details:", error);
      throw new Error(
        error.message || `Failed with status code: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Fetched Fixtures Data:", data);
    setFixtures(data.matches || []);
  } catch (err) {
    console.error("Fetch Error:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


// GET Method
export async function GET(req) {
  try {
    const highlights = await fetchHighlights();
    return NextResponse.json(highlights, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
      {
        status: 500,
      }
    );
  }
}

// POST Method Example
export async function POST(req) {
  try {
    // Example: Fetch all admins using Prisma
    const admins = await prisma.admin.findMany();
    return NextResponse.json(admins, {
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admins' },
      {
        status: 500,
      }
    );
  }
}

// Specific Endpoints
export const getMatches = (params) => fetchData('/fixtures', params);
export const getHighlights = (params) => fetchData('/highlights', params);
export const getStandings = (params) => fetchData('/standings', params);
