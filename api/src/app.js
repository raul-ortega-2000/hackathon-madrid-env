const { app } = require('@azure/functions');
const axios = require('axios');

// Cache simple para datos que no cambian frecuentemente
const cache = {
  airQuality: { data: null, timestamp: 0, ttl: 300000 }, // 5 minutos
  recyclingPoints: new Map() // Cache por ubicación
};

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
        'User-Agent': 'EspañaAmbiental/1.0'
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

// Función para obtener puntos de reciclaje usando Overpass API (OpenStreetMap)
async function getRecyclingPointsFromOSM(lat, lon, radius) {
  // Crear clave de cache basada en ubicación redondeada (100m precision)
  const cacheKey = `${Math.round(lat * 100) / 100}_${Math.round(lon * 100) / 100}_${radius}`;
  
  // Verificar cache (5 minutos TTL)
  const cached = cache.recyclingPoints.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < 300000)) {
    console.log('Returning cached recycling points');
    return cached.data;
  }
  
  try {
    // Query Overpass QL para buscar puntos de reciclaje (más simple para evitar timeouts)
    const overpassQuery = `
      [out:json][timeout:15];
      (
        node["amenity"="recycling"](around:${radius},${lat},${lon});
        node["amenity"="waste_disposal"](around:${radius},${lat},${lon});
      );
      out body;
    `;

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      overpassQuery,
      {
        headers: {
          'Content-Type': 'text/plain',
          'User-Agent': 'EspañaAmbiental/1.0'
        },
        timeout: 15000
      }
    );

    const points = [];
    
    if (response.data && response.data.elements) {
      for (const element of response.data.elements) {
        // Solo procesar nodos con coordenadas
        if (element.type === 'node' && element.lat && element.lon) {
          const distance = calculateDistance(lat, lon, element.lat, element.lon);
          
          // Determinar tipo de punto según tags de OSM
          const tags = element.tags || {};
          let pointType = 'contenedor';
          let icon = '♻️';
          let description = 'Punto de reciclaje';
          
          if (tags.recycling_type === 'centre' || tags.name?.toLowerCase().includes('punto limpio')) {
            pointType = 'punto_limpio';
            icon = '♻️';
            description = 'Punto limpio - Acepta residuos voluminosos, electrónicos y peligrosos';
          } else if (tags['recycling:glass'] === 'yes' || tags.colour === 'green') {
            pointType = 'contenedor_vidrio';
            icon = '🟢';
            description = 'Contenedor de vidrio';
          } else if (tags['recycling:paper'] === 'yes' || tags.colour === 'blue') {
            pointType = 'contenedor_papel';
            icon = '🔵';
            description = 'Contenedor de papel y cartón';
          } else if (tags['recycling:plastic'] === 'yes' || tags.colour === 'yellow') {
            pointType = 'contenedor_plastico';
            icon = '🟡';
            description = 'Contenedor de envases y plástico';
          } else if (tags['recycling:organic'] === 'yes' || tags.colour === 'brown') {
            pointType = 'contenedor_organico';
            icon = '🟤';
            description = 'Contenedor de residuos orgánicos';
          }
          
          // Construir nombre descriptivo
          let name = tags.name || tags.operator || `${icon} ${pointType.replace('_', ' ')}`;
          if (!tags.name && tags['addr:street']) {
            name = `${icon} ${tags['addr:street']}`;
          }
          
          // Construir dirección
          let address = '';
          if (tags['addr:street']) {
            address = tags['addr:street'];
            if (tags['addr:housenumber']) address = `${tags['addr:housenumber']} ${address}`;
            if (tags['addr:city']) address = `${address}, ${tags['addr:city']}`;
          } else if (tags['addr:city']) {
            address = tags['addr:city'];
          }
          
          points.push({
            name: name,
            type: pointType,
            address: address || 'Ubicación en mapa',
            distance: Math.round(distance),
            description: description,
            schedule: tags.opening_hours || tags.collection_times || 'Horario no especificado',
            phone: tags.phone || tags['contact:phone'] || '',
            source: 'OpenStreetMap',
            osmId: element.id,
            lat: element.lat,
            lon: element.lon
          });
        }
      }
      
      // Ordenar por distancia
      points.sort((a, b) => a.distance - b.distance);
    }
    
    // Guardar en cache
    cache.recyclingPoints.set(cacheKey, {
      data: points,
      timestamp: Date.now()
    });
    
    // Limpiar cache viejo (mantener solo últimas 20 búsquedas)
    if (cache.recyclingPoints.size > 20) {
      const firstKey = cache.recyclingPoints.keys().next().value;
      cache.recyclingPoints.delete(firstKey);
    }
    
    return points;
  } catch (error) {
    console.error('Error fetching from Overpass API:', error.message);
    // Si hay error, intentar devolver datos en cache aunque estén vencidos
    const cached = cache.recyclingPoints.get(cacheKey);
    if (cached) {
      console.log('Returning stale cached data due to error');
      return cached.data;
    }
    return [];
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
      
      // Usar cache para datos de Madrid (5 minutos)
      const now = Date.now();
      const useCache = cache.airQuality.data && (now - cache.airQuality.timestamp < cache.airQuality.ttl);
      
      try {
        let madridData;
        
        if (location.city === 'Madrid' && useCache) {
          context.log('Using cached air quality data');
          madridData = cache.airQuality.data;
        } else if (location.city === 'Madrid') {
          context.log('Fetching fresh air quality data from Madrid API');
          const response = await axios.get('https://datos.madrid.es/egob/catalogo/212531-7916318-calidad-aire-tiempo-real.json', {
            timeout: 5000
          });
          madridData = response.data;
          
          // Guardar en cache
          cache.airQuality.data = madridData;
          cache.airQuality.timestamp = now;
        }
        
        if (madridData && madridData['@graph']) {
          const stations = madridData['@graph'];
          
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
                
                // Extraer datos de contaminantes (valores fijos para consistencia)
                airData = {
                  NO2: station.no2 || 35,
                  PM10: station.pm10 || 28,
                  PM2_5: station.pm25 || 18,
                  O3: station.o3 || 65,
                  SO2: station.so2 || 8,
                  CO: station.co || 0.4
                };
              }
            }
          }
        }
      } catch (apiError) {
        context.log('Error fetching Madrid air quality data:', apiError.message);
      }
      
      // Si no hay datos reales, usar datos fijos representativos (no aleatorios)
      if (!airData || !nearestStation) {
        nearestStation = {
          name: `Estación ${location.city}`,
          address: `${location.city}, ${location.province}`,
          distance: 0
        };
        
        // Datos fijos representativos según tipo de ciudad (NO ALEATORIOS)
        const isBigCity = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga'].includes(location.city);
        
        // Valores fijos típicos de ciudades españolas
        if (isBigCity) {
          airData = {
            NO2: 38,  // Valor típico ciudad grande
            PM10: 25,
            PM2_5: 15,
            O3: 68,
            SO2: 7,
            CO: 0.4
          };
        } else {
          airData = {
            NO2: 22,  // Valor típico ciudad pequeña/media
            PM10: 18,
            PM2_5: 10,
            O3: 72,
            SO2: 5,
            CO: 0.2
          };
        }
        
        context.log(`Using fixed representative values for ${location.city}`);
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
      
      // Primero intentar obtener datos reales de OpenStreetMap (funciona para cualquier ciudad)
      context.log(`Fetching recycling points from OSM for ${location.city}`);
      recyclingPoints = await getRecyclingPointsFromOSM(lat, lon, radius);
      
      // Si estamos en Madrid, enriquecer puntos limpios con datos oficiales
      if (location.city === 'Madrid') {
        context.log('Enriching Madrid recycling points with official data');
        try {
          const response = await axios.get('https://datos.madrid.es/egob/catalogo/200284-0-puntos-limpios.json', {
            timeout: 5000
          });
          
          if (response.data && response.data['@graph']) {
            const madridPoints = response.data['@graph'];
            
            // Enriquecer puntos limpios existentes de OSM con metadata de Madrid
            for (let i = 0; i < recyclingPoints.length; i++) {
              if (recyclingPoints[i].type === 'punto_limpio') {
                // Buscar punto coincidente en datos de Madrid (por cercanía < 100m)
                for (const madridPoint of madridPoints) {
                  if (madridPoint.location && madridPoint.location.latitude && madridPoint.location.longitude) {
                    const distance = calculateDistance(
                      madridPoint.location.latitude,
                      madridPoint.location.longitude,
                      parseFloat(recyclingPoints[i].lat) || lat,
                      parseFloat(recyclingPoints[i].lon) || lon
                    );
                    
                    if (distance < 100) {
                      // Enriquecer con datos oficiales
                      recyclingPoints[i].name = madridPoint.title || recyclingPoints[i].name;
                      recyclingPoints[i].address = madridPoint.address ? madridPoint.address['street-address'] : recyclingPoints[i].address;
                      recyclingPoints[i].schedule = madridPoint.organization?.schedule || recyclingPoints[i].schedule;
                      recyclingPoints[i].phone = madridPoint.organization?.telephone || recyclingPoints[i].phone;
                      recyclingPoints[i].source = 'OpenStreetMap + Madrid Open Data';
                      break;
                    }
                  }
                }
              }
            }
            
            // Si hay menos de 10 puntos OSM, añadir puntos limpios oficiales que falten
            if (recyclingPoints.length < 10) {
              for (const madridPoint of madridPoints) {
                if (madridPoint.location && madridPoint.location.latitude && madridPoint.location.longitude) {
                  const distance = calculateDistance(
                    lat, lon,
                    madridPoint.location.latitude,
                    madridPoint.location.longitude
                  );
                  
                  if (distance <= radius) {
                    // Evitar duplicados por distancia
                    const isDuplicate = recyclingPoints.some(p => 
                      calculateDistance(
                        madridPoint.location.latitude,
                        madridPoint.location.longitude,
                        parseFloat(p.lat) || lat,
                        parseFloat(p.lon) || lon
                      ) < 100
                    );
                    
                    if (!isDuplicate) {
                      recyclingPoints.push({
                        name: madridPoint.title || 'Punto Limpio',
                        type: 'punto_limpio',
                        address: madridPoint.address ? madridPoint.address['street-address'] : 'Madrid',
                        distance: Math.round(distance),
                        description: madridPoint.description || 'Acepta residuos voluminosos, electrónicos y peligrosos',
                        schedule: madridPoint.organization?.schedule || 'Consultar horarios',
                        phone: madridPoint.organization?.telephone || '',
                        source: 'Madrid Open Data',
                        lat: madridPoint.location.latitude,
                        lon: madridPoint.location.longitude
                      });
                    }
                  }
                }
              }
              
              recyclingPoints.sort((a, b) => a.distance - b.distance);
            }
          }
        } catch (apiError) {
          context.log('Error fetching Madrid data:', apiError.message);
        }
      }
      
      // Si aún no hay datos, generar puntos mock básicos con coordenadas aproximadas
      if (recyclingPoints.length === 0) {
        context.log('No real data found, generating mock data');
        const pointTypes = [
          { type: 'contenedor_vidrio', icon: '🟢', desc: 'Contenedor de vidrio' },
          { type: 'contenedor_papel', icon: '🔵', desc: 'Contenedor de papel y cartón' },
          { type: 'contenedor_plastico', icon: '🟡', desc: 'Contenedor de envases y plástico' }
        ];
        
        for (let i = 0; i < 3; i++) {
          const randomType = pointTypes[i % pointTypes.length];
          const distance = Math.floor(Math.random() * (radius / 2)) + 100;
          
          // Generar coordenadas cercanas (aproximadamente en el radio especificado)
          const angle = (Math.PI * 2 * i) / 3; // Distribuir en círculo
          const distanceInDegrees = (distance / 1000) / 111; // Aproximación simple
          const mockLat = lat + (Math.cos(angle) * distanceInDegrees);
          const mockLon = lon + (Math.sin(angle) * distanceInDegrees);
          
          recyclingPoints.push({
            name: `${randomType.icon} ${randomType.type.replace('_', ' ')} - ${location.city}`,
            type: randomType.type,
            address: `${location.city}, ${location.province}`,
            distance: distance,
            description: randomType.desc,
            schedule: 'Disponible 24h',
            phone: '',
            source: 'mock',
            lat: mockLat,
            lon: mockLon
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
      
      // Stats fijos pero realistas según la zona (NO ALEATORIOS)
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
          rate: isBigCity ? 52 : 61,  // Valores fijos
          points: isBigCity ? 8 : 6,
          description: `Puntos de reciclaje disponibles en ${zoneName}`
        },
        greenSpaces: {
          area: isBigCity ? 450000 : 150000,  // Valores fijos
          trees: isBigCity ? 35000 : 6000,
          parks: isBigCity ? 45 : 18,
          description: 'Espacios verdes y arbolado urbano'
        },
        transport: {
          publicTransport: isBigCity ? 'Extensa red de metro, autobuses y cercanías' : 'Red de autobuses urbanos',
          bikeSharing: isBigCity,
          walkability: isBigCity ? 78 : 85,  // Valores fijos
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
