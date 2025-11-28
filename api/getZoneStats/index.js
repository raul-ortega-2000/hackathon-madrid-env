const { app } = require('@azure/functions');
const axios = require('axios');

const MADRID_API = 'https://datos.madrid.es/egob/catalogo/212531-7916318-calidad-aire-tiempo-real.json';

// Mapeo de distritos de Madrid
const DISTRICTS = [
  'Centro', 'Arganzuela', 'Retiro', 'Salamanca', 'Chamartín',
  'Tetuán', 'Chamberí', 'Fuencarral-El Pardo', 'Moncloa-Aravaca',
  'Latina', 'Carabanchel', 'Usera', 'Puente de Vallecas',
  'Moratalaz', 'Ciudad Lineal', 'Hortaleza', 'Villaverde',
  'Villa de Vallecas', 'Vicálvaro', 'San Blas-Canillejas', 'Barajas'
];

app.http('getZoneStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('Processing zone stats request');

    try {
      const district = request.query.get('district');

      if (!district) {
        return {
          status: 400,
          jsonBody: {
            error: 'Missing required parameter: district',
            availableDistricts: DISTRICTS
          }
        };
      }

      // Verificar que el distrito exista
      if (!DISTRICTS.includes(district)) {
        return {
          status: 404,
          jsonBody: {
            error: `District '${district}' not found`,
            availableDistricts: DISTRICTS
          }
        };
      }

      // Obtener datos de calidad del aire
      const response = await axios.get(MADRID_API);
      const stations = response.data['@graph'];

      // Filtrar estaciones del distrito (simplificado, en producción usar geocoding)
      const districtStations = stations.filter(s => 
        s.address?.['locality'] === district || 
        s.title?.includes(district)
      );

      if (districtStations.length === 0) {
        // Si no hay estaciones, devolver datos simulados
        return {
          status: 200,
          jsonBody: {
            district,
            message: 'No hay estaciones de medición en este distrito',
            avgAirQuality: {
              NO2: null,
              PM10: null,
              PM2_5: null,
              O3: null
            },
            stationsCount: 0,
            recyclingPoints: Math.floor(Math.random() * 50) + 10,
            lastUpdate: new Date().toISOString()
          }
        };
      }

      // Calcular promedios
      const avgNO2 = districtStations.reduce((sum, s) => sum + (s.NO2 || 0), 0) / districtStations.length;
      const avgPM10 = districtStations.reduce((sum, s) => sum + (s.PM10 || 0), 0) / districtStations.length;
      const avgPM25 = districtStations.reduce((sum, s) => sum + (s.PM2_5 || 0), 0) / districtStations.length;
      const avgO3 = districtStations.reduce((sum, s) => sum + (s.O3 || 0), 0) / districtStations.length;

      // Determinar nivel general
      let overallLevel = 'Buena';
      let overallColor = '#00e400';

      if (avgNO2 > 200 || avgPM10 > 100 || avgPM25 > 55) {
        overallLevel = 'Mala';
        overallColor = '#ff0000';
      } else if (avgNO2 > 100 || avgPM10 > 50 || avgPM25 > 35) {
        overallLevel = 'Regular';
        overallColor = '#ffff00';
      }

      // Puntos de reciclaje estimados por distrito (datos simulados)
      const recyclingPointsEstimate = {
        'Centro': 145,
        'Salamanca': 120,
        'Chamberí': 98,
        'Retiro': 87
      };

      return {
        status: 200,
        jsonBody: {
          district,
          avgAirQuality: {
            NO2: Math.round(avgNO2),
            PM10: Math.round(avgPM10),
            PM2_5: Math.round(avgPM25),
            O3: Math.round(avgO3),
            level: overallLevel,
            color: overallColor
          },
          stationsCount: districtStations.length,
          stations: districtStations.map(s => ({
            name: s.title,
            location: {
              lat: parseFloat(s.latitud),
              lon: parseFloat(s.longitud)
            }
          })),
          recyclingPoints: recyclingPointsEstimate[district] || Math.floor(Math.random() * 100) + 50,
          trends: {
            no2Trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
            pm10Trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
          },
          lastUpdate: new Date().toISOString()
        }
      };

    } catch (error) {
      context.log.error('Error fetching zone stats:', error);
      return {
        status: 500,
        jsonBody: {
          error: 'Internal server error',
          message: error.message
        }
      };
    }
  }
});
