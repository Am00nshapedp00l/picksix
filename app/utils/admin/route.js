import axios from 'axios';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const apiClient = axios.create({
  baseURL: 'https://nfl-ncaa-highlights-api.p.rapidapi.com',
  headers: {
    'x-rapidapi-host': process.env.RAPIDAPI_HOST,
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
  },
});

const prisma = new PrismaClient();

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
