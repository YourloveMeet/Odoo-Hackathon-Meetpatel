// Base URL for the backend API.
// It will use the environment variable if available, otherwise fallback to localhost for development.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Centralized API endpoints dictionary
export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/users/login`,
    REGISTER: `${API_BASE_URL}/users/register`,
  },
  // Add other feature endpoints here as the app grows
  // e.g., TRIPS: { CREATE: `${API_BASE_URL}/trips/create` }
};
