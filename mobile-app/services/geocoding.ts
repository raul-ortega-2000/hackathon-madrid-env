// Madrid districts and areas with approximate coordinates
// Used to identify user's location area

interface MadridArea {
  name: string;
  lat: number;
  lon: number;
  radius: number; // in km
}

const MADRID_AREAS: MadridArea[] = [
  // Centro
  { name: 'Centro', lat: 40.4168, lon: -3.7038, radius: 2 },
  { name: 'Sol', lat: 40.4168, lon: -3.7038, radius: 0.5 },
  { name: 'Malasaña', lat: 40.4290, lon: -3.7020, radius: 0.5 },
  { name: 'Chueca', lat: 40.4250, lon: -3.6960, radius: 0.5 },
  
  // Norte
  { name: 'Chamartín', lat: 40.4620, lon: -3.6760, radius: 2 },
  { name: 'Tetuán', lat: 40.4600, lon: -3.7000, radius: 2 },
  { name: 'Fuencarral-El Pardo', lat: 40.4900, lon: -3.7200, radius: 3 },
  { name: 'Moncloa-Aravaca', lat: 40.4400, lon: -3.7200, radius: 2 },
  
  // Este
  { name: 'Salamanca', lat: 40.4300, lon: -3.6800, radius: 2 },
  { name: 'Retiro', lat: 40.4150, lon: -3.6800, radius: 2 },
  { name: 'Moratalaz', lat: 40.4000, lon: -3.6500, radius: 2 },
  { name: 'Vicálvaro', lat: 40.4000, lon: -3.6000, radius: 2 },
  { name: 'Villa de Vallecas', lat: 40.3700, lon: -3.6200, radius: 2 },
  { name: 'Villaverde', lat: 40.3500, lon: -3.7000, radius: 2 },
  
  // Sur
  { name: 'Usera', lat: 40.3900, lon: -3.7100, radius: 2 },
  { name: 'Carabanchel', lat: 40.3800, lon: -3.7400, radius: 2 },
  { name: 'Latina', lat: 40.3900, lon: -3.7500, radius: 2 },
  
  // Oeste
  { name: 'Arganzuela', lat: 40.4000, lon: -3.7000, radius: 2 },
  { name: 'Puente de Vallecas', lat: 40.3900, lon: -3.6500, radius: 2 },
  
  // Área Metropolitana
  { name: 'Pozuelo de Alarcón', lat: 40.4330, lon: -3.8130, radius: 3 },
  { name: 'Las Rozas', lat: 40.4920, lon: -3.8740, radius: 3 },
  { name: 'Majadahonda', lat: 40.4730, lon: -3.8720, radius: 3 },
  { name: 'Boadilla del Monte', lat: 40.4050, lon: -3.8770, radius: 3 },
  { name: 'Alcobendas', lat: 40.5470, lon: -3.6420, radius: 3 },
  { name: 'San Sebastián de los Reyes', lat: 40.5450, lon: -3.6250, radius: 3 },
  { name: 'Getafe', lat: 40.3050, lon: -3.7300, radius: 3 },
  { name: 'Leganés', lat: 40.3270, lon: -3.7630, radius: 3 },
  { name: 'Móstoles', lat: 40.3230, lon: -3.8650, radius: 3 },
  { name: 'Fuenlabrada', lat: 40.2830, lon: -3.7940, radius: 3 },
  { name: 'Alcorcón', lat: 40.3490, lon: -3.8290, radius: 3 },
];

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getMadridArea(lat: number, lon: number): string {
  let closestArea: MadridArea | null = null;
  let minDistance = Infinity;
  
  // Find the closest area
  for (const area of MADRID_AREAS) {
    const distance = calculateDistance(lat, lon, area.lat, area.lon);
    if (distance < area.radius && distance < minDistance) {
      minDistance = distance;
      closestArea = area;
    }
  }
  
  // If no specific area found, determine general region
  if (!closestArea) {
    if (lat > 40.45) return 'Área Norte';
    if (lat < 40.35) return 'Área Sur';
    if (lon > -3.65) return 'Área Este';
    if (lon < -3.75) return 'Área Oeste';
    return 'Área Metropolitana';
  }
  
  return closestArea.name;
}

