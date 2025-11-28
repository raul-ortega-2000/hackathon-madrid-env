import axios from 'axios';

const API_BASE_URL = 'https://func-madrid-env-api.azurewebsites.net/api';
const API_TIMEOUT = 10000; // 10 seconds timeout

// Helper function to create axios instance with timeout
const createApiClient = () => {
  return axios.create({
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

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
  impact?: string; // Measurable positive impact
}

export interface WaterData {
  quality: string;
  level: string;
  ph?: number;
  turbidity?: number;
  timestamp: string;
}

export interface EnergyData {
  consumption: number;
  renewable: number;
  efficiency: string;
  level: string;
  timestamp: string;
}

export interface GreenSpacesData {
  parks: number;
  trees: number;
  area: number;
  level: string;
  timestamp: string;
}

export interface ClimateData {
  temperature: number;
  emissions: number;
  level: string;
  timestamp: string;
}

export interface HeatWaveData {
  active: boolean;
  level: string;
  temperature: number;
  timestamp: string;
}

export interface BiodiversityData {
  species: number;
  habitats: number;
  level: string;
  timestamp: string;
}

export interface CategoryData {
  available: boolean;
  isExample?: boolean; // True when showing example data from nearby regions
  level?: string;
  color?: string;
  message?: string;
  data?: any;
}

export const apiService = {
  async getAirQuality(lat: number, lon: number): Promise<CategoryData> {
    try {
      const client = createApiClient();
      const response = await client.get(`${API_BASE_URL}/airquality`, {
        params: { lat, lon }
      });
      
      const data = response.data;
      const level = data.airQuality?.level || 'Media';
      const color = getQualityColor(level);
      
      return {
        available: true,
        isExample: false,
        level,
        color,
        message: getAirQualityMessage(level, data.airQuality),
        data: {
          station: data.station?.name || 'Estación',
          distance: data.station?.distance || 0,
          pollutants: {
            NO2: { value: data.airQuality?.NO2 || 0, unit: 'µg/m³' },
            PM10: { value: data.airQuality?.PM10 || 0, unit: 'µg/m³' },
            PM2_5: { value: data.airQuality?.PM2_5 || 0, unit: 'µg/m³' },
            O3: { value: data.airQuality?.O3 || 0, unit: 'µg/m³' },
          },
        }
      };
    } catch (error) {
      console.warn('Air quality API failed, using example data:', error);
      // Return example data (average from nearby regions)
      return getExampleAirQuality();
    }
  },

  async getRecyclingPoints(lat: number, lon: number, radius: number = 1000): Promise<CategoryData> {
    try {
      const client = createApiClient();
      const response = await client.get(`${API_BASE_URL}/recycling`, {
        params: { lat, lon, radius }
      });
      
      const points = response.data?.points || [];
      const count = points.length;
      
      // Determine level: >20 = Good, 10-20 = Medium, <10 = Bad
      const level = count > 20 ? 'Buena' : count > 10 ? 'Media' : 'Mala';
      const color = getQualityColor(level);
      
      // Transform points to match expected format
      const transformedPoints = points.map((point: any) => ({
        id: point.id,
        name: point.name,
        type: point.type,
        address: point.address || point.location?.address,
        latitude: point.location?.lat || point.latitude,
        longitude: point.location?.lon || point.longitude,
        distance: point.distance,
      }));
      
      return {
        available: true,
        isExample: false,
        level,
        color,
        message: getWasteMessage(count, level),
        data: {
          points: transformedPoints,
          count: count,
          batteryDeposits: Math.floor(count * 1.3), // Estimate based on recycling points
        }
      };
    } catch (error) {
      console.warn('Recycling points API failed, using example data:', error);
      // Return example data (average from nearby regions)
      return getExampleRecycling();
    }
  },

  async getWaterData(lat: number, lon: number): Promise<CategoryData> {
    try {
      // Try to fetch from API if it exists
      const client = createApiClient();
      const response = await client.get(`${API_BASE_URL}/water`, {
        params: { lat, lon }
      });
      
      const data = response.data;
      return {
        available: true,
        isExample: false,
        level: data.level || 'Media',
        color: getQualityColor(data.level || 'Media'),
        message: data.message || 'Calidad del agua media',
        data: data,
      };
    } catch (error) {
      // Return example data (average from nearby regions)
      return getExampleWater();
    }
  },

  async getEnergyData(lat: number, lon: number): Promise<CategoryData> {
    try {
      const client = createApiClient();
      const response = await client.get(`${API_BASE_URL}/energy`, {
        params: { lat, lon }
      });
      
      const data = response.data;
      return {
        available: true,
        isExample: false,
        level: data.level || 'Media',
        color: getQualityColor(data.level || 'Media'),
        message: data.message || 'Uso energético medio',
        data: data,
      };
    } catch (error) {
      return getExampleEnergy();
    }
  },

  async getGreenSpacesData(lat: number, lon: number): Promise<CategoryData> {
    try {
      const client = createApiClient();
      const response = await client.get(`${API_BASE_URL}/greenspaces`, {
        params: { lat, lon }
      });
      
      const data = response.data;
      return {
        available: true,
        isExample: false,
        level: data.level || 'Media',
        color: getQualityColor(data.level || 'Media'),
        message: data.message || 'Espacios verdes disponibles',
        data: data,
      };
    } catch (error) {
      return getExampleGreenSpaces();
    }
  },

  async getClimateData(lat: number, lon: number): Promise<CategoryData> {
    try {
      const client = createApiClient();
      const response = await client.get(`${API_BASE_URL}/climate`, {
        params: { lat, lon }
      });
      
      const data = response.data;
      return {
        available: true,
        isExample: false,
        level: data.level || 'Media',
        color: getQualityColor(data.level || 'Media'),
        message: data.message || 'Indicadores climáticos normales',
        data: data,
      };
    } catch (error) {
      return getExampleClimate();
    }
  },

  async getHeatWaveData(lat: number, lon: number): Promise<CategoryData> {
    try {
      const client = createApiClient();
      const response = await client.get(`${API_BASE_URL}/heatwave`, {
        params: { lat, lon }
      });
      
      const data = response.data;
      return {
        available: true,
        isExample: false,
        level: data.active ? 'Mala' : 'Buena',
        color: getQualityColor(data.active ? 'Mala' : 'Buena'),
        message: data.active ? 'Ola de calor activa' : 'Sin olas de calor',
        data: data,
      };
    } catch (error) {
      return getExampleHeatWave();
    }
  },

  async getBiodiversityData(lat: number, lon: number): Promise<CategoryData> {
    try {
      const client = createApiClient();
      const response = await client.get(`${API_BASE_URL}/biodiversity`, {
        params: { lat, lon }
      });
      
      const data = response.data;
      return {
        available: true,
        isExample: false,
        level: data.level || 'Media',
        color: getQualityColor(data.level || 'Media'),
        message: data.message || 'Biodiversidad moderada',
        data: data,
      };
    } catch (error) {
      return getExampleBiodiversity();
    }
  },

  async getRecommendations(lat: number, lon: number, allData: any): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // Generate 4-6 extensive recommendations based on available data with measurable impacts
    
    // 1. Air Quality recommendations
    if (allData.airQuality?.available) {
      const level = allData.airQuality.level;
      const no2 = allData.airQuality.data?.pollutants?.NO2?.value || 0;
      
      if (level === 'Mala') {
        recommendations.push({
          type: 'air',
          title: 'Evita utilizar vehículos de combustión en esta zona',
          description: 'La calidad del aire es mala. Usa transporte público, bicicleta o camina para tus desplazamientos.',
          icon: '🔴',
          priority: 'high',
          impact: 'Impacto: Reduces hasta 2.5 kg de CO2 por cada 10 km evitados. Mejoras la calidad del aire en un 15-20% en tu zona.',
        });
      } else if (level === 'Media' || level === 'Regular') {
        recommendations.push({
          type: 'air',
          title: 'Considera usar transporte público para mejorar la calidad del aire',
          description: 'La calidad del aire es moderada. El transporte público reduce emisiones y mejora el aire que respiras.',
          icon: '🟡',
          priority: 'medium',
          impact: 'Impacto: Cada viaje en transporte público reduce 1.2 kg de CO2 comparado con vehículo privado. Contribuyes a mejorar el índice de calidad del aire en un 8-12%.',
        });
      }
      
      // Additional air quality recommendation
      if (no2 > 50) {
        recommendations.push({
          type: 'air',
          title: 'Evita hacer ejercicio intenso al aire libre en horas punta',
          description: 'Los niveles de NO2 están elevados. Programa tus actividades físicas al aire libre en horas de menor tráfico.',
          icon: '🟡',
          priority: 'medium',
          impact: 'Impacto: Reduces la exposición a contaminantes en un 30-40%. Proteges tu salud respiratoria y cardiovascular.',
        });
      }
    }
    
    // 2. Waste/Recycling recommendations
    if (allData.recycling?.available) {
      const level = allData.recycling.level;
      const count = allData.recycling.data?.count || 0;
      
      if (level === 'Mala') {
        recommendations.push({
          type: 'waste',
          title: 'No hay muchos sitios de depósito de residuos en la zona',
          description: 'La zona tiene pocos puntos de reciclaje. Planifica tus desplazamientos para reciclar correctamente.',
          icon: '🔴',
          priority: 'high',
          impact: 'Impacto: Reciclar correctamente evita que 450 kg de residuos por persona/año vayan al vertedero. Reduces emisiones de metano en un 25%.',
        });
      } else if (level === 'Media' || level === 'Regular') {
        recommendations.push({
          type: 'waste',
          title: 'Utiliza los depósitos de residuos de la zona',
          description: 'Hay puntos de reciclaje disponibles cerca. Separa correctamente tus residuos para maximizar el reciclaje.',
          icon: '🟡',
          priority: 'medium',
          impact: 'Impacto: Reciclar correctamente ahorra 700 kWh de energía por tonelada de material reciclado. Reduces la huella de carbono en un 30-40%.',
        });
      }
      
      // Additional recycling recommendation
      if (count > 0) {
        recommendations.push({
          type: 'waste',
          title: 'Separa correctamente los residuos orgánicos',
          description: 'Los residuos orgánicos representan el 40% de la basura. Separarlos correctamente permite generar compost y biogás.',
          icon: '🟢',
          priority: 'medium',
          impact: 'Impacto: Separar residuos orgánicos genera 150 kg de compost por persona/año. Reduce emisiones de CO2 equivalente en 0.5 toneladas anuales.',
        });
      }
    }
    
    // 3. Energy recommendations
    if (allData.energy?.available) {
      const level = allData.energy.level;
      const renewable = allData.energy.data?.renewable || 0;
      
      if (level === 'Mala' || renewable < 50) {
        recommendations.push({
          type: 'energy',
          title: 'Cuida tu consumo de energía, porque en esta zona viene de energías no renovables',
          description: 'La zona depende principalmente de energías no renovables. Reduce tu consumo en horas punta y usa electrodomésticos eficientes.',
          icon: '🔴',
          priority: 'high',
          impact: 'Impacto: Reducir el consumo en un 20% ahorra 400 kWh/año por hogar. Equivale a evitar 200 kg de CO2 anuales y ahorrar 60€ en la factura.',
        });
      } else {
        recommendations.push({
          type: 'energy',
          title: 'Aprovecha las horas de mayor producción de energía renovable',
          description: 'La zona tiene buena cobertura de energías renovables. Programa tus consumos en horas de mayor producción solar/eólica.',
          icon: '🟢',
          priority: 'low',
          impact: 'Impacto: Consumir en horas de mayor producción renovable reduce tu huella de carbono en un 15%. Aprovechas mejor la energía limpia disponible.',
        });
      }
    }
    
    // 4. Water recommendations
    if (allData.water?.available) {
      const level = allData.water.level;
      
      if (level === 'Mala') {
        recommendations.push({
          type: 'water',
          title: 'La calidad del agua en esta zona requiere atención',
          description: 'La calidad del agua está por debajo de los estándares óptimos. Usa filtros domésticos y reporta cualquier anomalía.',
          icon: '🔴',
          priority: 'high',
          impact: 'Impacto: Usar filtros domésticos reduce la exposición a contaminantes en un 80-90%. Proteges tu salud y la de tu familia.',
        });
      } else {
        recommendations.push({
          type: 'water',
          title: 'Reduce el consumo de agua embotellada',
          description: 'El agua del grifo en esta zona es de buena calidad. Evita el plástico y consume agua del grifo cuando sea seguro.',
          icon: '🟢',
          priority: 'low',
          impact: 'Impacto: Evitar 1 botella de plástico al día ahorra 365 botellas/año. Reduce 8 kg de plástico y evita 12 kg de CO2 en su producción.',
        });
      }
    }
    
    // 5. Green Spaces recommendations
    if (allData.greenSpaces?.available) {
      const parks = allData.greenSpaces.data?.parks || 0;
      
      if (parks > 0) {
        recommendations.push({
          type: 'green',
          title: 'Visita los espacios verdes cercanos para mejorar tu bienestar',
          description: 'Hay espacios verdes disponibles en tu zona. Pasar tiempo en la naturaleza mejora la salud mental y física.',
          icon: '🟢',
          priority: 'low',
          impact: 'Impacto: Pasar 2 horas semanales en espacios verdes reduce el estrés en un 30% y mejora la calidad del sueño. Los árboles absorben 22 kg de CO2 al año cada uno.',
        });
      } else {
        recommendations.push({
          type: 'green',
          title: 'Participa en iniciativas de reforestación urbana',
          description: 'La zona tiene pocos espacios verdes. Apoya iniciativas de plantación de árboles y creación de jardines comunitarios.',
          icon: '🟡',
          priority: 'medium',
          impact: 'Impacto: Cada árbol plantado absorbe 22 kg de CO2 al año y reduce la temperatura urbana en 2-3°C. Mejora la calidad del aire en un 5-10%.',
        });
      }
    }
    
    // 6. Heat Wave recommendations
    if (allData.heatWave?.available) {
      if (allData.heatWave.data?.active) {
        recommendations.push({
          type: 'heat',
          title: 'Ola de calor activa - Mantente hidratado y evita exposición prolongada al sol',
          description: 'Hay una ola de calor activa. Bebe agua frecuentemente, evita actividades al aire libre en horas centrales y busca sombra.',
          icon: '🔴',
          priority: 'high',
          impact: 'Impacto: Mantenerte hidratado previene golpes de calor y reduce el riesgo de deshidratación en un 90%. Protege tu salud cardiovascular.',
        });
      } else {
        recommendations.push({
          type: 'heat',
          title: 'Prepara tu hogar para futuras olas de calor',
          description: 'Aunque no hay olas de calor activas, prepara tu hogar con sombras, ventilación y aislamiento térmico.',
          icon: '🟡',
          priority: 'low',
          impact: 'Impacto: Un hogar bien aislado reduce el consumo de aire acondicionado en un 30-40%. Ahorra 200-300 kWh/año y reduce emisiones en 100 kg CO2.',
        });
      }
    }
    
    // 7. Climate recommendations (always show if available)
    if (allData.climate?.available) {
      recommendations.push({
        type: 'climate',
        title: 'Reduce tu huella de carbono con acciones diarias',
        description: 'Pequeños cambios en tu rutina diaria pueden tener un gran impacto en la lucha contra el cambio climático.',
        icon: '🟡',
        priority: 'medium',
        impact: 'Impacto: Reducir el consumo de carne 2 días/semana ahorra 0.5 toneladas de CO2/año. Usar transporte público 3 veces/semana reduce 0.8 toneladas CO2/año.',
      });
    }
    
    // Ensure we have at least 4-6 recommendations
    // If we have fewer, add general recommendations
    while (recommendations.length < 4) {
      recommendations.push({
        type: 'general',
        title: 'Participa en iniciativas comunitarias de sostenibilidad',
        description: 'Únete a grupos locales que trabajan por la sostenibilidad ambiental. La acción colectiva multiplica el impacto.',
        icon: '🟢',
        priority: 'low',
        impact: 'Impacto: Las iniciativas comunitarias pueden reducir las emisiones locales en un 10-15%. Crean conciencia y generan cambios duraderos.',
      });
    }
    
    // Sort by priority (high first) and limit to 6
    recommendations.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    });
    
    return recommendations.slice(0, 6);
  }
};

// Helper functions
function getQualityColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'buena': return '#4CAF50'; // Green
    case 'media': 
    case 'regular': return '#FFC107'; // Yellow
    case 'mala': return '#F44336'; // Red
    default: return '#9E9E9E'; // Gray
  }
}

function getAirQualityMessage(level: string, data: any): string {
  if (level === 'Buena') {
    return 'Calidad del aire buena';
  } else if (level === 'Media' || level === 'Regular') {
    return 'Calidad del aire media';
  } else {
    return 'Calidad del aire mala';
  }
}

function getWasteMessage(count: number, level: string): string {
  if (level === 'Buena') {
    return `Área con muchos sitios de residuos (${count} centros)`;
  } else if (level === 'Media') {
    return `Área con algunos sitios de residuos (${count} centros)`;
  } else {
    return `No hay muchos sitios de depósito de residuos en la zona (${count} centros)`;
  }
}

// Example data functions - average data from nearby regions
function getExampleAirQuality(): CategoryData {
  return {
    available: true,
    isExample: true,
    level: 'Media',
    color: '#FFC107',
    message: 'Calidad del aire media',
    data: {
      station: 'Estación Centro (Ejemplo)',
      distance: 0.5,
      pollutants: {
        NO2: { value: 45, unit: 'µg/m³' },
        PM10: { value: 32, unit: 'µg/m³' },
        PM2_5: { value: 18, unit: 'µg/m³' },
        O3: { value: 65, unit: 'µg/m³' },
      },
    }
  };
}

function getExampleRecycling(): CategoryData {
  const count = 15; // Average from nearby regions
  const level = count > 20 ? 'Buena' : count > 10 ? 'Media' : 'Mala';
  return {
    available: true,
    isExample: true,
    level,
    color: getQualityColor(level),
    message: getWasteMessage(count, level),
    data: {
      points: [],
      count: count,
      batteryDeposits: 20,
    }
  };
}

function getExampleWater(): CategoryData {
  return {
    available: true,
    isExample: true,
    level: 'Media',
    color: '#FFC107',
    message: 'Calidad del agua media',
    data: {
      ph: 7.2,
      turbidity: 0.8,
    }
  };
}

function getExampleEnergy(): CategoryData {
  return {
    available: true,
    isExample: true,
    level: 'Media',
    color: '#FFC107',
    message: 'Uso energético medio - 60% renovable',
    data: {
      consumption: 1200,
      renewable: 60,
      efficiency: 'Media',
    }
  };
}

function getExampleGreenSpaces(): CategoryData {
  return {
    available: true,
    isExample: true,
    level: 'Buena',
    color: '#4CAF50',
    message: 'Área con espacios verdes disponibles',
    data: {
      parks: 5,
      trees: 1200,
      area: 2.5,
    }
  };
}

function getExampleClimate(): CategoryData {
  return {
    available: true,
    isExample: true,
    level: 'Media',
    color: '#FFC107',
    message: 'Indicadores climáticos normales',
    data: {
      temperature: 18.5,
      emissions: 120,
    }
  };
}

function getExampleHeatWave(): CategoryData {
  return {
    available: true,
    isExample: true,
    level: 'Buena',
    color: '#4CAF50',
    message: 'Sin olas de calor activas',
    data: {
      active: false,
      temperature: 25,
    }
  };
}

function getExampleBiodiversity(): CategoryData {
  return {
    available: true,
    isExample: true,
    level: 'Media',
    color: '#FFC107',
    message: 'Biodiversidad moderada',
    data: {
      species: 45,
      habitats: 8,
    }
  };
}
