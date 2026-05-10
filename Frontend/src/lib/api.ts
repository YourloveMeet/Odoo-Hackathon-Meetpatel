// Base URL for the backend API.
// It will use the environment variable if available, otherwise fallback to localhost for development.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Centralized API endpoints dictionary
export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/users/login`,
    REGISTER: `${API_BASE_URL}/users/register`,
    GET_PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/update-profile`,
  },
  TRIPS: {
    MY_TRIPS: `${API_BASE_URL}/trips/my-trips`,
    CREATE: `${API_BASE_URL}/trips/create`,
    GET_SINGLE: (id: string) => `${API_BASE_URL}/trips/${id}`,
    UPDATE_ITINERARY: (id: string) => `${API_BASE_URL}/trips/itinerary/${id}`,
  },
  COMMUNITY: {
    FEED: `${API_BASE_URL}/community/feed`,
  },
  CITIES: {
    GET_ALL: `${API_BASE_URL}/cities`,
  },
  STOPS: {
    CREATE: `${API_BASE_URL}/stops/create`,
    GET_BY_TRIP: (tripId: string) => `${API_BASE_URL}/stops/trip/${tripId}`,
    UPDATE: (id: string) => `${API_BASE_URL}/stops/update/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/stops/delete/${id}`,
  },
  DAY_PLANS: {
    CREATE: `${API_BASE_URL}/dayplans/create`,
    GET_BY_STOP: (stopId: string) => `${API_BASE_URL}/dayplans/stop/${stopId}`,
    UPDATE: (id: string) => `${API_BASE_URL}/dayplans/update/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/dayplans/delete/${id}`,
  },
  ACTIVITIES: {
    CREATE: `${API_BASE_URL}/activities/create`,
    CATALOG: `${API_BASE_URL}/activity-catalog`,
    GET_BY_DAYPLAN: (dayPlanId: string) => `${API_BASE_URL}/activities/day/${dayPlanId}`,
    DELETE: (id: string) => `${API_BASE_URL}/activities/delete/${id}`,
  },
  // Add other feature endpoints here as the app grows
  // e.g., TRIPS: { CREATE: `${API_BASE_URL}/trips/create` }
};
