const { app } = require('@azure/functions');
const axios = require('axios');

// API de datos de Madrid
const MADRID_API = 'https://datos.madrid.es/egob/catalogo/212531-7916318-calidad-aire-tiempo-real.json';

// Función para calcular distancia entre dos puntos (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}

// Función para determinar nivel de calidad del aire
function getAirQualityLevel(no2, pm10, pm25) {
  // Índice simplificado basado en estándares EPA
  if (no2 > 200 || pm10 > 100 || pm25 > 55) {
    return { level: 'Mala', color: '#ff0000' };
  } else if (no2 > 100 || pm10 > 50 || pm25 > 35) {
    return { level: 'Regular', color: '#ffff00' };
  } else {
    return { level: 'Buena', color: '#00e400' };
  }
}

app.http('getAirQuality', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('Processing air quality request');

    try {
      const lat = parseFloat(request.query.get('lat'));
      const lon = parseFloat(request.query.get('lon'));

      if (!lat || !lon) {
        return {
          status: 400,
          jsonBody: {
            error: 'Missing required parameters: lat and lon'
          }
        };
      }

      // Obtener datos de la API de Madrid
      const response = await axios.get(MADRID_API);
      const stations = response.data['@graph'];

      // Encontrar la estación más cercana
      let closestStation = null;
      let minDistance = Infinity;

      for (const station of stations) {
        if (station.latitud && station.longitud) {
          const distance = calculateDistance(
            lat, lon,
            parseFloat(station.latitud),
            parseFloat(station.longitud)
          );

          if (distance < minDistance) {
            minDistance = distance;
            closestStation = station;
          }
        }
      }

      if (!closestStation) {
        return {
          status: 404,
          jsonBody: {
            error: 'No air quality data found for this location'
          }
        };
      }

      // Extraer valores de contaminantes
      const no2 = closestStation.NO2 || 0;
      const pm10 = closestStation.PM10 || 0;
      const pm25 = closestStation.PM2_5 || 0;
      const o3 = closestStation.O3 || 0;

      const qualityLevel = getAirQualityLevel(no2, pm10, pm25);

      // Generar recomendación
      let recommendation = '';
      if (qualityLevel.level === 'Buena') {
        recommendation = 'Calidad del aire buena. Seguro para actividades al aire libre.';
      } else if (qualityLevel.level === 'Regular') {
        recommendation = 'Calidad del aire regular. Personas sensibles deberían limitar actividades prolongadas al aire libre.';
      } else {
        recommendation = 'Calidad del aire mala. Se recomienda evitar actividades al aire libre.';
      }

      return {
        status: 200,
        jsonBody: {
          location: { lat, lon },
          station: {
            name: closestStation.title,
            distance: Math.round(minDistance)
          },
          airQuality: {
            NO2: no2,
            PM10: pm10,
            PM2_5: pm25,
            O3: o3,
            level: qualityLevel.level,
            color: qualityLevel.color
          },
          recommendation,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      context.log.error('Error fetching air quality:', error);
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
