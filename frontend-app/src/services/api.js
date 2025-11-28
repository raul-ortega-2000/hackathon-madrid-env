import axios from 'axios';

// URL base de la API (cambiar en producción)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://func-madrid-env-api.azurewebsites.net/api';

export const getAirQuality = async (lat, lon) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/airquality`, {
      params: { lat, lon }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching air quality:', error);
    throw error;
  }
};

export const getRecyclingPoints = async (lat, lon, radius = 500) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/recycling`, {
      params: { lat, lon, radius }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recycling points:', error);
    throw error;
  }
};

export const getRecommendations = async (lat, lon) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/recommendations`, {
      params: { lat, lon }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

export const getZoneStats = async (district) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/zonestats`, {
      params: { district }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching zone stats:', error);
    throw error;
  }
};
