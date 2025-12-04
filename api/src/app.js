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

// Función para obtener nombre de la ciudad usando Nominatim (OSM)
async function getCityName(lat, lon) {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        lat,
        lon,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'MadridEnvApp/1.0'
      }
    });
    
    const address = response.data.address;
    return {
      city: address.city || address.town || address.village || address.municipality || 'Ubicación desconocida',
      province: address.state || address.province || '',
      country: address.country || 'España'
    };
  } catch (error) {
    return { city: 'Madrid', province: 'Madrid', country: 'España' };
  }
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
      const location = await getCityName(lat, lon);
      
      // Intentar obtener datos reales de calidad del aire de Madrid
      let airData = null;
      let nearestStation = null;
      
      try {
        const response = await axios.get('https://datos.madrid.es/egob/catalogo/212531-7916318-calidad-aire-tiempo-real.json', {
          timeout: 5000
        });
        
        if (response.data && response.data['@graph']) {
          const stations = response.data['@graph'];
          
          // Encontrar estación más cercana
          let minDistance = Infinity;
          
          for (const station of stations) {
            if (station.location && station.location.latitude && station.location.longitude) {
              const distance = calculateDistance(
                lat, lon,
                station.location.latitude,
                station.location.longitude
              );
              
              if (distance < minDistance) {
                minDistance = distance;
                nearestStation = {
                  name: station.title || 'Estación de medición',
                  address: station.address ? station.address['street-address'] : '',
                  distance: Math.round(distance)
                };
                
                // Extraer datos de contaminantes
                airData = {
                  NO2: station.no2 || null,
                  PM10: station.pm10 || null,
                  PM2_5: station.pm25 || null,
                  O3: station.o3 || null,
                  SO2: station.so2 || null,
                  CO: station.co || null
                };
              }
            }
          }
        }
      } catch (apiError) {
        context.log('Error fetching Madrid air quality data:', apiError.message);
      }
      
      // Si no hay datos reales, usar datos mock basados en la ubicación
      if (!airData || !nearestStation) {
        nearestStation = {
          name: `Estación ${location.city}`,
          address: `${location.city}, ${location.province}`,
          distance: 0
        };
        
        // Datos mock realistas según tipo de ciudad
        const isBigCity = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga'].includes(location.city);
        airData = {
          NO2: isBigCity ? Math.floor(Math.random() * 40) + 30 : Math.floor(Math.random() * 20) + 10,
          PM10: isBigCity ? Math.floor(Math.random() * 30) + 20 : Math.floor(Math.random() * 15) + 10,
          PM2_5: isBigCity ? Math.floor(Math.random() * 20) + 10 : Math.floor(Math.random() * 10) + 5,
          O3: Math.floor(Math.random() * 40) + 50,
          SO2: Math.floor(Math.random() * 10) + 5,
          CO: isBigCity ? Math.random() * 0.5 + 0.3 : Math.random() * 0.2 + 0.1
        };
      }
      
      // Calcular nivel de calidad del aire (ICA - Índice de Calidad del Aire)
      const calculateAQI = (pollutants) => {
        const no2Level = pollutants.NO2 || 0;
        const pm10Level = pollutants.PM10 || 0;
        const pm25Level = pollutants.PM2_5 || 0;
        
        const maxLevel = Math.max(no2Level, pm10Level, pm25Level);
        
        if (maxLevel < 20) return { level: 'Excelente', color: '#00e400', index: 1 };
        if (maxLevel < 40) return { level: 'Buena', color: '#ffff00', index: 2 };
        if (maxLevel < 60) return { level: 'Moderada', color: '#ff7e00', index: 3 };
        if (maxLevel < 80) return { level: 'Mala', color: '#ff0000', index: 4 };
        return { level: 'Muy Mala', color: '#99004c', index: 5 };
      };
      
      const airQualityLevel = calculateAQI(airData);
      
      const recommendations = {
        1: 'Calidad del aire excelente. Ideal para actividades al aire libre.',
        2: 'Calidad del aire buena. Puedes realizar actividades al aire libre sin restricciones.',
        3: 'Calidad del aire moderada. Personas sensibles deberían limitar actividades intensas al aire libre.',
        4: 'Calidad del aire mala. Se recomienda reducir actividades al aire libre, especialmente para grupos sensibles.',
        5: 'Calidad del aire muy mala. Evita actividades al aire libre. Mantén ventanas cerradas.'
      };

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: {
          location: location,
          station: nearestStation,
          airQuality: {
            ...airData,
            level: airQualityLevel.level,
            color: airQualityLevel.color,
            index: airQualityLevel.index
          },
          recommendation: recommendations[airQualityLevel.index],
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      context.error('Error in getAirQuality:', error);
      return {
        status: 500,
        jsonBody: { error: 'Error al obtener datos de calidad del aire', details: error.message }
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
    const radius = parseInt(request.query.get('radius')) || 2000;

    if (!lat || !lon) {
      return {
        status: 400,
        jsonBody: { error: 'Missing lat or lon parameters' }
      };
    }

    try {
      const location = await getCityName(lat, lon);
      let recyclingPoints = [];
      
      // Intentar obtener puntos limpios de Madrid
      try {
        const response = await axios.get('https://datos.madrid.es/egob/catalogo/200284-0-puntos-limpios.json', {
          timeout: 5000
        });
        
        if (response.data && response.data['@graph']) {
          const points = response.data['@graph'];
          
          for (const point of points) {
            if (point.location && point.location.latitude && point.location.longitude) {
              const distance = calculateDistance(
                lat, lon,
                point.location.latitude,
                point.location.longitude
              );
              
              if (distance <= radius) {
                recyclingPoints.push({
                  name: point.title || 'Punto Limpio',
                  type: 'punto_limpio',
                  address: point.address ? point.address['street-address'] : '',
                  distance: Math.round(distance),
                  description: point.description || 'Acepta residuos voluminosos, electrónicos y peligrosos',
                  schedule: point.organization ? point.organization.schedule : 'Consultar horarios',
                  phone: point.organization ? point.organization.telephone : ''
                });
              }
            }
          }
        }
      } catch (apiError) {
        context.log('Error fetching recycling points:', apiError.message);
      }
      
      // Si no hay datos reales o estamos fuera de Madrid, generar puntos mock
      if (recyclingPoints.length === 0) {
        const pointTypes = [
          { type: 'punto_limpio', icon: '♻️', desc: 'Acepta residuos electrónicos, muebles y productos peligrosos' },
          { type: 'contenedor_vidrio', icon: '🟢', desc: 'Contenedor de vidrio' },
          { type: 'contenedor_papel', icon: '🔵', desc: 'Contenedor de papel y cartón' },
          { type: 'contenedor_plastico', icon: '🟡', desc: 'Contenedor de envases y plástico' },
          { type: 'contenedor_organico', icon: '🟤', desc: 'Contenedor de residuos orgánicos' }
        ];
        
        for (let i = 0; i < 5; i++) {
          const randomType = pointTypes[Math.floor(Math.random() * pointTypes.length)];
          const distance = Math.floor(Math.random() * radius);
          
          recyclingPoints.push({
            name: `${randomType.icon} ${randomType.type.replace('_', ' ')} - ${location.city}`,
            type: randomType.type,
            address: `${location.city}, ${location.province}`,
            distance: distance,
            description: randomType.desc,
            schedule: 'Disponible 24h',
            phone: ''
          });
        }
        
        recyclingPoints.sort((a, b) => a.distance - b.distance);
      }

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: { 
          location: location,
          points: recyclingPoints,
          radius: radius,
          count: recyclingPoints.length
        }
      };
    } catch (error) {
      context.error('Error in getRecyclingPoints:', error);
      return {
        status: 500,
        jsonBody: { error: 'Error al obtener puntos de reciclaje', details: error.message }
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
      const location = await getCityName(lat, lon);
      
      const recommendations = [];
      
      // Recomendaciones de movilidad
      const mobilityRec = {
        title: 'Movilidad Sostenible',
        icon: '🚴',
        priority: 'medium',
        message: `En ${location.city}, considera opciones de transporte sostenible`,
        actions: [
          'Usa transporte público para distancias largas',
          'Camina o usa bicicleta para trayectos cortos (< 3km)',
          'Comparte coche si necesitas vehículo privado',
          'Evita horas punta para reducir emisiones'
        ]
      };
      
      recommendations.push(mobilityRec);
      
      // Recomendaciones de reciclaje
      recommendations.push({
        title: 'Reciclaje y Residuos',
        icon: '♻️',
        priority: 'high',
        message: `Gestiona tus residuos de forma responsable en ${location.city}`,
        actions: [
          'Separa residuos en casa: orgánico, papel, plástico, vidrio',
          'Lleva electrónicos y pilas a puntos limpios',
          'Reutiliza envases y bolsas cuando sea posible',
          'Compostar residuos orgánicos si tienes espacio'
        ]
      });
      
      // Recomendaciones de ahorro energético
      recommendations.push({
        title: 'Eficiencia Energética',
        icon: '💡',
        priority: 'low',
        message: 'Reduce tu huella de carbono en el hogar',
        actions: [
          'Usa electrodomésticos eficientes (A+++)',
          'Apaga luces y dispositivos no utilizados',
          'Ajusta calefacción/AC a 20-21°C en invierno, 25-26°C en verano',
          'Aprovecha luz natural durante el día'
        ]
      });

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: { 
          location: location,
          recommendations: recommendations,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      context.error('Error in getRecommendations:', error);
      return {
        status: 500,
        jsonBody: { error: 'Error al obtener recomendaciones', details: error.message }
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
    
    const lat = parseFloat(request.query.get('lat')) || 40.4168;
    const lon = parseFloat(request.query.get('lon')) || -3.7038;
    const district = request.query.get('district');

    try {
      const location = await getCityName(lat, lon);
      const zoneName = district || location.city;
      
      // Stats mock pero realistas según la zona
      const isBigCity = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga'].includes(location.city);
      
      const stats = {
        zone: zoneName,
        location: location,
        airQuality: {
          average: 'Buena',
          trend: 'improving',
          description: `La calidad del aire en ${zoneName} es generalmente buena`
        },
        recycling: {
          rate: isBigCity ? Math.floor(Math.random() * 20) + 45 : Math.floor(Math.random() * 15) + 55,
          points: Math.floor(Math.random() * 10) + 5,
          description: `Puntos de reciclaje disponibles en ${zoneName}`
        },
        greenSpaces: {
          area: isBigCity ? Math.floor(Math.random() * 500000) + 300000 : Math.floor(Math.random() * 200000) + 100000,
          trees: isBigCity ? Math.floor(Math.random() * 50000) + 10000 : Math.floor(Math.random() * 10000) + 2000,
          parks: isBigCity ? Math.floor(Math.random() * 50) + 30 : Math.floor(Math.random() * 20) + 10,
          description: 'Espacios verdes y arbolado urbano'
        },
        transport: {
          publicTransport: isBigCity ? 'Extensa red de metro, autobuses y cercanías' : 'Red de autobuses urbanos',
          bikeSharing: isBigCity,
          walkability: Math.floor(Math.random() * 20) + 70,
          description: 'Opciones de movilidad sostenible'
        },
        population: {
          density: isBigCity ? 'Alta' : 'Media',
          description: `Zona ${isBigCity ? 'urbana densa' : 'residencial'}`
        }
      };

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        jsonBody: stats
      };
    } catch (error) {
      context.error('Error in getZoneStats:', error);
      return {
        status: 500,
        jsonBody: { error: 'Error al obtener estadísticas de zona', details: error.message }
      };
    }
  }
});
