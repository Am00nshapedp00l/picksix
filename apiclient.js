import axios from 'axios';

// Create an API client with default configurations
const apiClient = axios.create({
  baseURL: 'https://football-highlights-api.p.rapidapi.com',
  headers: {
    'x-rapidapi-host': 'football-highlights-api.p.rapidapi.com',
    'x-rapidapi-key': process.env.RAPIDAPI_KEY, 
  },
});

// Universal function to fetch data
export const fetchData = async (endpoint, params = {}) => {
  try {
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error;
  }
};
