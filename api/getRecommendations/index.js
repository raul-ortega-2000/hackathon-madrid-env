const { app } = require('@azure/functions');
const axios = require('axios');

const MADRID_API = 'https://datos.madrid.es/egob/catalogo/212531-7916318-calidad-aire-tiempo-real.json';

// Función para calcular distancia
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

app.http('getRecommendations', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('Processing recommendations request');

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

      // Obtener datos de calidad del aire
      const response = await axios.get(MADRID_API);
      const stations = response.data['@graph'];

      // Encontrar estaciones cercanas (radio de 5km)
      const nearbyStations = [];

      for (const station of stations) {
        if (station.latitud && station.longitud) {
          const distance = calculateDistance(
            lat, lon,
            parseFloat(station.latitud),
            parseFloat(station.longitud)
          );

          if (distance <= 5000) {
            nearbyStations.push({
              ...station,
              distance,
              no2: station.NO2 || 0,
              pm10: station.PM10 || 0,
              pm25: station.PM2_5 || 0
            });
          }
        }
      }

      // Ordenar por distancia
      nearbyStations.sort((a, b) => a.distance - b.distance);

      const recommendations = [];
      const currentStation = nearbyStations[0];

      if (!currentStation) {
        return {
          status: 404,
          jsonBody: {
            error: 'No data available for this location'
          }
        };
      }

      // Recomendación basada en nivel de contaminación
      if (currentStation.no2 > 200 || currentStation.pm10 > 100) {
        recommendations.push({
          type: 'warning',
          priority: 'high',
          icon: '⚠️',
          title: 'Alta contaminación detectada',
          message: 'Se recomienda evitar actividades al aire libre prolongadas.',
          actions: [
            'Usar mascarilla si sales',
            'Cerrar ventanas',
            'Usar transporte público'
          ]
        });

        // Buscar zonas alternativas con mejor aire
        const betterAreas = nearbyStations.filter(s => 
          s.no2 < currentStation.no2 * 0.7 && 
          s.pm10 < currentStation.pm10 * 0.7
        ).slice(0, 3);

        if (betterAreas.length > 0) {
          recommendations.push({
            type: 'route',
            priority: 'medium',
            icon: '🗺️',
            title: 'Zonas con mejor calidad de aire cercanas',
            message: `Encontramos ${betterAreas.length} zonas con mejor aire cerca de ti`,
            alternatives: betterAreas.map(area => ({
              name: area.title,
              distance: Math.round(area.distance),
              improvement: `${Math.round(((currentStation.no2 - area.no2) / currentStation.no2) * 100)}% menos NO2`
            }))
          });
        }

      } else if (currentStation.no2 > 100 || currentStation.pm10 > 50) {
        recommendations.push({
          type: 'info',
          priority: 'medium',
          icon: 'ℹ️',
          title: 'Calidad del aire moderada',
          message: 'Personas sensibles deberían considerar limitar actividades intensas al aire libre.',
          actions: [
            'Reducir ejercicio intenso al aire libre',
            'Grupos sensibles: niños, ancianos, asmáticos'
          ]
        });

      } else {
        recommendations.push({
          type: 'success',
          priority: 'low',
          icon: '✅',
          title: 'Buena calidad del aire',
          message: 'Perfecto para actividades al aire libre.',
          actions: [
            'Ideal para hacer ejercicio',
            'Buen momento para pasear',
            'Ventilación recomendada'
          ]
        });
      }

      // Recomendación de reciclaje
      recommendations.push({
        type: 'recycling',
        priority: 'low',
        icon: '♻️',
        title: 'Recicla en tu zona',
        message: 'Hay puntos de reciclaje cerca. Ayuda al medio ambiente.',
        actions: [
          'Ver puntos de reciclaje cercanos',
          'Separar residuos correctamente'
        ]
      });

      // Recomendación de transporte
      if (currentStation.no2 > 80) {
        recommendations.push({
          type: 'transport',
          priority: 'medium',
          icon: '🚇',
          title: 'Usa transporte público',
          message: 'Reduce emisiones usando metro, autobús o bicicleta.',
          actions: [
            'Metro: líneas cercanas',
            'BiciMAD disponible',
            'Autobuses EMT'
          ]
        });
      }

      return {
        status: 200,
        jsonBody: {
          location: { lat, lon },
          currentAirQuality: {
            no2: currentStation.no2,
            pm10: currentStation.pm10,
            pm25: currentStation.pm25,
            station: currentStation.title
          },
          recommendations,
          totalRecommendations: recommendations.length,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      context.log.error('Error generating recommendations:', error);
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
