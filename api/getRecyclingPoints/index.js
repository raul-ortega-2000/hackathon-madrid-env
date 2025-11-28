const { app } = require('@azure/functions');
const axios = require('axios');
const dataSources = require('../dataSources');

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

      // Obtener datos de múltiples fuentes de residuos
      const allPoints = [];
      
      // 1. Puntos Limpios
      try {
        const puntosLimpiosResponse = await axios.get(dataSources.waste.puntosLimpios, { timeout: 10000 });
        const puntosLimpios = puntosLimpiosResponse.data['@graph'] || [];
        
        for (const punto of puntosLimpios) {
          if (punto.location && punto.location.latitude && punto.location.longitude) {
            const distance = calculateDistance(
              lat, lon,
              parseFloat(punto.location.latitude),
              parseFloat(punto.location.longitude)
            );

            if (distance <= radius) {
              allPoints.push({
                id: punto.id || `punto-${allPoints.length}`,
                name: punto.title || 'Punto Limpio',
                type: 'punto_limpio',
                category: 'waste',
                location: {
                  lat: parseFloat(punto.location.latitude),
                  lon: parseFloat(punto.location.longitude)
                },
                address: punto.address?.['street-address'] || punto.address?.streetAddress || 'N/A',
                distance: Math.round(distance),
                description: punto.organization?.['organization-desc'] || punto.description || '',
                schedule: punto.openingHours || 'Consultar horarios',
                materials: punto.accepts || ['Varios']
              });
            }
          }
        }
      } catch (error) {
        context.log('Error fetching puntos limpios:', error.message);
      }

      // 2. Contenedores de reciclaje (si disponible)
      try {
        const containersResponse = await axios.get(dataSources.waste.containers, { timeout: 5000 });
        const containers = containersResponse.data['@graph'] || [];
        
        for (const container of containers.slice(0, 50)) { // Limit to avoid too many points
          if (container.location && container.location.latitude && container.location.longitude) {
            const distance = calculateDistance(
              lat, lon,
              parseFloat(container.location.latitude),
              parseFloat(container.location.longitude)
            );

            if (distance <= radius) {
              allPoints.push({
                id: container.id || `container-${allPoints.length}`,
                name: container.title || `Contenedor ${container.type || 'Reciclaje'}`,
                type: container.type || 'contenedor',
                category: 'recycling',
                location: {
                  lat: parseFloat(container.location.latitude),
                  lon: parseFloat(container.location.longitude)
                },
                address: container.address?.['street-address'] || 'N/A',
                distance: Math.round(distance),
                description: container.description || '',
                containerType: container.containerType || 'General'
              });
            }
          }
        }
      } catch (error) {
        context.log('Error fetching containers:', error.message);
      }

      // Filtrar puntos dentro del radio y ordenar
      const nearbyPoints = allPoints;

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

      return {
        status: 200,
        jsonBody: {
          location: { lat, lon },
          radius,
          totalPoints: nearbyPoints.length,
          points: nearbyPoints,
          dataSources: [
            'datos.madrid.es - Puntos Limpios',
            'datos.madrid.es - Contenedores de Reciclaje'
          ],
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
