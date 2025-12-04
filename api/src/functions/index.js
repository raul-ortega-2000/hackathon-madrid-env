const { app } = require('@azure/functions');
const axios = require('axios');

// Función auxiliar para calcular distancia (Haversine)
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

// GET Air Quality
app.http('getAirQuality', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('Processing getAirQuality request');
    
    const lat = parseFloat(request.query.get('lat'));
    const lon = parseFloat(request.query.get('lon'));

    if (!lat || !lon) {
      return {
        status: 400,
        jsonBody: { error: 'Missing lat or lon parameters' }
      };
    }

    try {
      // Mock data para testing - reemplazar con API real
      const mockData = {
        station: {
          name: 'Estación Centro',
          distance: 1250
        },
        airQuality: {
          NO2: 45,
          PM10: 32,
          PM2_5: 18,
          O3: 65,
          level: 'Buena',
          color: '#00e400'
        },
        recommendation: 'Calidad del aire buena. Puedes realizar actividades al aire libre.'
      };

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: mockData
      };
    } catch (error) {
      context.error('Error in getAirQuality:', error);
      return {
        status: 500,
        jsonBody: { error: 'Internal server error' }
      };
    }
  }
});

// GET Recycling Points
app.http('getRecyclingPoints', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('Processing getRecyclingPoints request');
    
    const lat = parseFloat(request.query.get('lat'));
    const lon = parseFloat(request.query.get('lon'));
    const radius = parseInt(request.query.get('radius')) || 1000;

    if (!lat || !lon) {
      return {
        status: 400,
        jsonBody: { error: 'Missing lat or lon parameters' }
      };
    }

    try {
      const mockPoints = [
        {
          name: 'Punto Limpio Retiro',
          type: 'punto_limpio',
          address: 'Calle de O\'Donnell, 28009 Madrid',
          distance: 850,
          description: 'Acepta residuos electrónicos, muebles y productos peligrosos'
        },
        {
          name: 'Contenedor Vidrio - Plaza Mayor',
          type: 'contenedor',
          address: 'Plaza Mayor, 28012 Madrid',
          distance: 450,
          description: 'Contenedor de vidrio'
        },
        {
          name: 'Punto Limpio Chamberí',
          type: 'punto_limpio',
          address: 'Calle de Bravo Murillo, 28015 Madrid',
          distance: 1200,
          description: 'Horario: L-V 9:00-21:00, S-D 10:00-14:00'
        }
      ];

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: { points: mockPoints }
      };
    } catch (error) {
      context.error('Error in getRecyclingPoints:', error);
      return {
        status: 500,
        jsonBody: { error: 'Internal server error' }
      };
    }
  }
});

// GET Recommendations
app.http('getRecommendations', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('Processing getRecommendations request');
    
    const lat = parseFloat(request.query.get('lat'));
    const lon = parseFloat(request.query.get('lon'));

    if (!lat || !lon) {
      return {
        status: 400,
        jsonBody: { error: 'Missing lat or lon parameters' }
      };
    }

    try {
      const mockRecommendations = [
        {
          title: 'Movilidad Sostenible',
          message: 'Considera usar transporte público o bicicleta para tus desplazamientos',
          priority: 'medium',
          icon: '🚴',
          actions: [
            'Usa el metro o autobús para distancias largas',
            'Alquila BiciMAD para trayectos cortos',
            'Camina cuando sea posible'
          ]
        },
        {
          title: 'Reciclaje',
          message: 'Hay 3 puntos de reciclaje cerca de tu ubicación',
          priority: 'high',
          icon: '♻️',
          alternatives: [
            {
              name: 'Punto Limpio Retiro',
              distance: 850,
              improvement: 'Recicla electrónicos y muebles'
            }
          ]
        }
      ];

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: { recommendations: mockRecommendations }
      };
    } catch (error) {
      context.error('Error in getRecommendations:', error);
      return {
        status: 500,
        jsonBody: { error: 'Internal server error' }
      };
    }
  }
});

// GET Zone Stats
app.http('getZoneStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log('Processing getZoneStats request');
    
    const district = request.query.get('district') || 'Centro';

    try {
      const mockStats = {
        district: district,
        airQuality: {
          average: 'Buena',
          trend: 'improving'
        },
        recycling: {
          rate: 65,
          points: 12
        },
        greenSpaces: {
          area: 450000,
          trees: 15000
        }
      };

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: mockStats
      };
    } catch (error) {
      context.error('Error in getZoneStats:', error);
      return {
        status: 500,
        jsonBody: { error: 'Internal server error' }
      };
    }
  }
});
