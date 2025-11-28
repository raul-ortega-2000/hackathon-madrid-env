import { AirQualityData, RecyclingPoint, Recommendation } from './api';

// Mock data for demo/fallback when API is unavailable
export const mockData = {
  getAirQuality: (lat: number, lon: number): AirQualityData => ({
    station: 'Estación Centro (Demo)',
    distance: 0.5,
    pollutants: {
      NO2: { value: 45, unit: 'µg/m³' },
      PM10: { value: 32, unit: 'µg/m³' },
      PM2_5: { value: 18, unit: 'µg/m³' },
      O3: { value: 65, unit: 'µg/m³' },
    },
    quality: {
      level: 'Buena',
      color: '#4CAF50',
      description: 'Calidad del aire buena. Seguro para actividades al aire libre.',
    },
    timestamp: new Date().toISOString(),
  }),

  getRecyclingPoints: (lat: number, lon: number): RecyclingPoint[] => [
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
  ],

  getRecommendations: (lat: number, lon: number): Recommendation[] => [
    {
      type: 'air_quality',
      title: 'Calidad del Aire Buena',
      description: 'La calidad del aire en tu zona es buena. Ideal para actividades al aire libre.',
      icon: '🌿',
      priority: 'low',
    },
    {
      type: 'route',
      title: 'Ruta Recomendada',
      description: 'Considera caminar por el Parque del Retiro para disfrutar de mejor calidad del aire.',
      icon: '🚶',
      priority: 'medium',
    },
    {
      type: 'recycling',
      title: 'Punto de Reciclaje Cercano',
      description: 'Hay un punto limpio a 250m. Recuerda reciclar tus residuos correctamente.',
      icon: '♻️',
      priority: 'high',
    },
  ],
};

