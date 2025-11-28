// Standalone data service - no API calls, only local data
// This version works completely offline for Expo Go demo

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

export interface WaterData {
  quality: string;
  level: string;
  ph: number;
  turbidity: number;
  timestamp: string;
}

// Mock data for demo - works completely offline
const getAirQualityData = (lat: number, lon: number): AirQualityData => ({
  station: 'Estación Centro',
  distance: 0.5,
  pollutants: {
    NO2: { value: 45, unit: 'µg/m³' },
    PM10: { value: 32, unit: 'µg/m³' },
    PM2_5: { value: 18, unit: 'µg/m³' },
    O3: { value: 65, unit: 'µg/m³' },
  },
  quality: {
    level: 'Media',
    color: '#FFC107',
    description: 'Calidad del aire media. Personas sensibles deberían considerar limitar actividades intensas.',
  },
  timestamp: new Date().toISOString(),
});

const getRecyclingPoints = (lat: number, lon: number): RecyclingPoint[] => [
  {
    id: 1,
    name: 'Punto Limpio Centro',
    type: 'Punto Limpio',
    address: 'Calle de la Princesa, 1',
    latitude: 40.4168,
    longitude: -3.7038,
    distance: 250,
    containers: [
      { type: 'Papel', color: 'Azul', materials: ['Papel', 'Cartón'] },
      { type: 'Vidrio', color: 'Verde', materials: ['Vidrio'] },
      { type: 'Plástico', color: 'Amarillo', materials: ['Plástico', 'Envases'] },
    ],
  },
  {
    id: 2,
    name: 'Contenedor de Reciclaje',
    type: 'Contenedor',
    address: 'Plaza Mayor',
    latitude: 40.4155,
    longitude: -3.7074,
    distance: 450,
  },
  {
    id: 3,
    name: 'Punto Limpio Retiro',
    type: 'Punto Limpio',
    address: 'Calle de Alcalá, 45',
    latitude: 40.4190,
    longitude: -3.6789,
    distance: 680,
  },
  {
    id: 4,
    name: 'Papelera Selectiva',
    type: 'Papelera',
    address: 'Gran Vía, 12',
    latitude: 40.4192,
    longitude: -3.7032,
    distance: 320,
  },
  {
    id: 5,
    name: 'Contenedor Orgánico',
    type: 'Contenedor',
    address: 'Calle de Preciados, 8',
    latitude: 40.4180,
    longitude: -3.7035,
    distance: 180,
  },
  {
    id: 6,
    name: 'Punto Limpio Chamberí',
    type: 'Punto Limpio',
    address: 'Calle de Bravo Murillo, 123',
    latitude: 40.4350,
    longitude: -3.7030,
    distance: 1200,
  },
];

const getWaterData = (lat: number, lon: number): WaterData => ({
  quality: 'Media',
  level: 'Moderada',
  ph: 7.2,
  turbidity: 0.8,
  timestamp: new Date().toISOString(),
});

const getRecommendations = (lat: number, lon: number): Recommendation[] => [
  {
    type: 'waste',
    title: 'Utiliza los depósitos de residuos de la zona',
    description: '',
    icon: '🔴',
    priority: 'high',
  },
  {
    type: 'transport',
    title: 'Evita utilizar vehículos de combustión',
    description: '',
    icon: '🔴',
    priority: 'high',
  },
  {
    type: 'energy',
    title: 'Cuida tu consumo de energía, porque en esta zona viene de energías no renovables',
    description: '',
    icon: '🔴',
    priority: 'high',
  },
];

// Simple data service - synchronous, no network calls
export const dataService = {
  getAirQuality: (lat: number, lon: number): AirQualityData => {
    return getAirQualityData(lat, lon);
  },

  getRecyclingPoints: (lat: number, lon: number, radius: number = 1000): RecyclingPoint[] => {
    return getRecyclingPoints(lat, lon);
  },

  getRecommendations: (lat: number, lon: number): Recommendation[] => {
    return getRecommendations(lat, lon);
  },

  getWaterData: (lat: number, lon: number): WaterData => {
    return getWaterData(lat, lon);
  },
};

