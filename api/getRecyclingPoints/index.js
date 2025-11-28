const { app } = require('@azure/functions');
const axios = require('axios');

const PUNTOS_LIMPIOS_API = 'https://datos.madrid.es/egob/catalogo/200284-0-puntos-limpios.json';

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

app.http('getRecyclingPoints', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('Processing recycling points request');

    try {
      const lat = parseFloat(request.query.get('lat'));
      const lon = parseFloat(request.query.get('lon'));
      const radius = parseInt(request.query.get('radius')) || 500; // Default 500m

      if (!lat || !lon) {
        return {
          status: 400,
          jsonBody: {
            error: 'Missing required parameters: lat and lon'
          }
        };
      }

      // Obtener datos de puntos limpios
      const response = await axios.get(PUNTOS_LIMPIOS_API);
      const puntosLimpios = response.data['@graph'];

      // Filtrar puntos dentro del radio
      const nearbyPoints = [];

      for (const punto of puntosLimpios) {
        if (punto.location && punto.location.latitude && punto.location.longitude) {
          const distance = calculateDistance(
            lat, lon,
            parseFloat(punto.location.latitude),
            parseFloat(punto.location.longitude)
          );

          if (distance <= radius) {
            nearbyPoints.push({
              id: punto.id,
              name: punto.title,
              type: 'punto_limpio',
              location: {
                lat: parseFloat(punto.location.latitude),
                lon: parseFloat(punto.location.longitude)
              },
              address: punto.address?.['street-address'] || 'N/A',
              distance: Math.round(distance),
              description: punto.organization?.['organization-desc'] || ''
            });
          }
        }
      }

      // Ordenar por distancia
      nearbyPoints.sort((a, b) => a.distance - b.distance);

      // Añadir puntos de contenedores simulados (datos ficticios para demo)
      const mockContainers = [
        {
          id: 'cont-1',
          name: 'Contenedor Amarillo',
          type: 'contenedor_amarillo',
          location: { lat: lat + 0.001, lon: lon + 0.001 },
          address: 'Calle simulada',
          distance: 120,
          description: 'Envases y plásticos'
        },
        {
          id: 'cont-2',
          name: 'Contenedor Azul',
          type: 'contenedor_azul',
          location: { lat: lat - 0.001, lon: lon + 0.001 },
          address: 'Calle simulada 2',
          distance: 150,
          description: 'Papel y cartón'
        }
      ];

      const allPoints = [...nearbyPoints, ...mockContainers];

      return {
        status: 200,
        jsonBody: {
          location: { lat, lon },
          radius,
          totalPoints: allPoints.length,
          points: allPoints,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      context.log.error('Error fetching recycling points:', error);
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
