const { app } = require('@azure/functions');
const axios = require('axios');
const dataSources = require('../dataSources');

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
  // Índice simplificado basado en estándares EPA y normativa europea
  if (no2 > 200 || pm10 > 100 || pm25 > 55) {
    return { level: 'Mala', color: '#ff0000' };
  } else if (no2 > 100 || pm10 > 50 || pm25 > 35) {
    return { level: 'Regular', color: '#ffff00' };
  } else {
    return { level: 'Buena', color: '#00e400' };
  }
}

// Función para calcular Air Quality Index (AQI) simplificado
function calculateAQI(no2, pm10, pm25, o3) {
  // Calcular AQI basado en el peor contaminante
  const aqiNo2 = no2 > 200 ? 300 : no2 > 100 ? 200 : no2 > 50 ? 100 : 50;
  const aqiPm10 = pm10 > 100 ? 300 : pm10 > 50 ? 200 : pm10 > 25 ? 100 : 50;
  const aqiPm25 = pm25 > 55 ? 300 : pm25 > 35 ? 200 : pm25 > 15 ? 100 : 50;
  const aqiO3 = o3 > 180 ? 300 : o3 > 120 ? 200 : o3 > 60 ? 100 : 50;
  
  return Math.max(aqiNo2, aqiPm10, aqiPm25, aqiO3);
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

      // Obtener datos de múltiples fuentes de Madrid
      // Primary source: Real-time air quality data
      const response = await axios.get(dataSources.airQuality.realTime, {
        timeout: 10000
      });
      const stations = response.data['@graph'] || [];
      
      // Try to get additional station metadata if available
      let stationMetadata = [];
      try {
        const metadataResponse = await axios.get(dataSources.airQuality.stations, {
          timeout: 5000
        });
        stationMetadata = metadataResponse.data['@graph'] || [];
      } catch (err) {
        context.log('Could not fetch station metadata, using real-time data only');
      }

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

      // Extraer valores de contaminantes (múltiples fuentes)
      const no2 = closestStation.NO2 || closestStation.no2 || 0;
      const pm10 = closestStation.PM10 || closestStation.pm10 || 0;
      const pm25 = closestStation.PM2_5 || closestStation.pm25 || closestStation['PM2.5'] || 0;
      const o3 = closestStation.O3 || closestStation.o3 || 0;
      const so2 = closestStation.SO2 || closestStation.so2 || 0;
      const co = closestStation.CO || closestStation.co || 0;
      
      // Enriquecer con metadata de estación si está disponible
      const stationInfo = stationMetadata.find(s => 
        s.title === closestStation.title || 
        s.id === closestStation.id
      );

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
            name: closestStation.title || 'Estación de Calidad del Aire',
            id: closestStation.id,
            distance: Math.round(minDistance),
            address: stationInfo?.address?.['street-address'] || closestStation.address || 'N/A',
            coordinates: {
              lat: parseFloat(closestStation.latitud || closestStation.latitude),
              lon: parseFloat(closestStation.longitud || closestStation.longitude)
            }
          },
          airQuality: {
            NO2: no2,
            PM10: pm10,
            PM2_5: pm25,
            O3: o3,
            SO2: so2,
            CO: co,
            level: qualityLevel.level,
            color: qualityLevel.color,
            aqi: calculateAQI(no2, pm10, pm25, o3) // Air Quality Index
          },
          recommendation,
          dataSource: 'datos.madrid.es - Calidad del Aire en Tiempo Real',
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
// Deployment 20251128_121843
// Deployment trigger 1764855872
