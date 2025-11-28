import axios from 'axios';

const API_BASE_URL = 'https://func-madrid-env-api.azurewebsites.net/api';

export interface AirQualityData {
  station: string;
  distance: number;
  pollutants: {
    NO2?: { value: number; unit: string };
    PM10?: { value: number; unit: string };
    PM2_5?: { value: number; unit: string };
    O3?: { value: number; unit: string };
  };
  quality: {
    level: string;
    color: string;
    description: string;
  };
  timestamp: string;
}

export interface RecyclingPoint {
  id: number;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
  containers?: Array<{
    type: string;
    color: string;
    materials: string[];
  }>;
}

export interface Recommendation {
  type: string;
  title: string;
  description: string;
  icon: string;
  priority: string;
}

export interface ZoneStats {
  district: string;
  population: number;
  area_km2: number;
  recyclingPoints: number;
  averageAirQuality: string;
  greenSpaces: number;
  stats: {
    label: string;
    value: string;
  }[];
}

export const apiService = {
  async getAirQuality(lat: number, lon: number): Promise<AirQualityData> {
    const response = await axios.get(`${API_BASE_URL}/airquality`, {
      params: { lat, lon }
    });
    return response.data;
  },

  async getRecyclingPoints(lat: number, lon: number, radius: number = 1000): Promise<RecyclingPoint[]> {
    const response = await axios.get(`${API_BASE_URL}/recycling`, {
      params: { lat, lon, radius }
    });
    return response.data;
  },

  async getRecommendations(lat: number, lon: number): Promise<Recommendation[]> {
    const response = await axios.get(`${API_BASE_URL}/recommendations`, {
      params: { lat, lon }
    });
    return response.data;
  },

  async getZoneStats(district: string): Promise<ZoneStats> {
    const response = await axios.get(`${API_BASE_URL}/zonestats`, {
      params: { district }
    });
    return response.data;
  }
};
