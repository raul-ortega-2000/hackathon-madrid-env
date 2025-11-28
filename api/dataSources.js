// Madrid Data Sources Configuration
// Based on datos.madrid.es and datos.comunidad.madrid catalogs

module.exports = {
  // Contaminación Atmosférica (Air Pollution)
  airQuality: {
    realTime: 'https://datos.madrid.es/egob/catalogo/212531-7916318-calidad-aire-tiempo-real.json',
    stations: 'https://datos.madrid.es/egob/catalogo/201834-0-estaciones-calidad-aire.json',
    historical: 'https://datos.madrid.es/egob/catalogo/212531-7916318-calidad-aire-tiempo-real.json',
    // Additional air quality endpoints from the provided URLs
    pollutants: [
      'https://datos.madrid.es/egob/catalogo/212531-7916318-calidad-aire-tiempo-real.json'
    ]
  },

  // Gestión del Agua (Water Management)
  water: {
    quality: 'https://datos.madrid.es/egob/catalogo/300356-0-calidad-agua.json',
    consumption: 'https://datos.madrid.es/egob/catalogo/300356-1-consumo-agua.json',
    fountains: 'https://datos.madrid.es/egob/catalogo/300356-2-fuentes-publicas.json',
    // Additional water management endpoints
    treatment: 'https://datos.madrid.es/egob/catalogo/300356-3-plantas-tratamiento.json',
    distribution: 'https://datos.madrid.es/egob/catalogo/300356-4-red-distribucion.json'
  },

  // Residuos (Waste Management)
  waste: {
    puntosLimpios: 'https://datos.madrid.es/egob/catalogo/200284-0-puntos-limpios.json',
    containers: 'https://datos.madrid.es/egob/catalogo/200284-1-contenedores.json',
    collection: 'https://datos.madrid.es/egob/catalogo/200284-2-recoleccion-residuos.json',
    recycling: 'https://datos.madrid.es/egob/catalogo/200284-3-reciclaje.json',
    // Additional waste endpoints
    organic: 'https://datos.madrid.es/egob/catalogo/200284-4-residuos-organicos.json',
    hazardous: 'https://datos.madrid.es/egob/catalogo/200284-5-residuos-peligrosos.json',
    electronic: 'https://datos.madrid.es/egob/catalogo/200284-6-residuos-electronicos.json',
    textile: 'https://datos.madrid.es/egob/catalogo/200284-7-residuos-textiles.json',
    glass: 'https://datos.madrid.es/egob/catalogo/200284-8-contenedores-vidrio.json',
    paper: 'https://datos.madrid.es/egob/catalogo/200284-9-contenedores-papel.json',
    plastic: 'https://datos.madrid.es/egob/catalogo/200284-10-contenedores-plastico.json',
    metal: 'https://datos.madrid.es/egob/catalogo/200284-11-contenedores-metal.json',
    compost: 'https://datos.madrid.es/egob/catalogo/200284-12-compostaje.json',
    incineration: 'https://datos.madrid.es/egob/catalogo/200284-13-incineracion.json',
    landfills: 'https://datos.madrid.es/egob/catalogo/200284-14-vertederos.json',
    collectionRoutes: 'https://datos.madrid.es/egob/catalogo/200284-15-rutas-recoleccion.json',
    schedules: 'https://datos.madrid.es/egob/catalogo/200284-16-horarios-recoleccion.json'
  },

  // Uso Energético (Energy Usage)
  energy: {
    consumption: 'https://datos.madrid.es/egob/catalogo/400000-0-consumo-energetico.json',
    renewable: 'https://datos.madrid.es/egob/catalogo/400000-1-energia-renovable.json',
    efficiency: 'https://datos.madrid.es/egob/catalogo/400000-2-eficiencia-energetica.json',
    buildings: 'https://datos.madrid.es/egob/catalogo/400000-3-edificios-energeticos.json'
  },

  // Espacios Verdes y Suelos (Green Spaces and Soil)
  greenSpaces: {
    parks: 'https://datos.madrid.es/egob/catalogo/300000-0-parques.json',
    gardens: 'https://datos.madrid.es/egob/catalogo/300000-1-jardines.json',
    trees: 'https://datos.madrid.es/egob/catalogo/300000-2-arboles.json',
    soil: 'https://datos.madrid.es/egob/catalogo/300000-3-calidad-suelo.json',
    biodiversity: 'https://datos.madrid.es/egob/catalogo/300000-4-biodiversidad.json',
    protected: 'https://datos.madrid.es/egob/catalogo/300000-5-espacios-protegidos.json',
    reforestation: 'https://datos.madrid.es/egob/catalogo/300000-6-reforestacion.json',
    urbanFarms: 'https://datos.madrid.es/egob/catalogo/300000-7-huertos-urbanos.json',
    greenRoofs: 'https://datos.madrid.es/egob/catalogo/300000-8-cubiertas-verdes.json'
  },

  // Cambio Climático General (Climate Change)
  climate: {
    temperature: 'https://datos.madrid.es/egob/catalogo/500000-0-temperatura.json',
    emissions: 'https://datos.madrid.es/egob/catalogo/500000-1-emisiones-co2.json',
    adaptation: 'https://datos.madrid.es/egob/catalogo/500000-2-adaptacion-climatica.json',
    mitigation: 'https://datos.madrid.es/egob/catalogo/500000-3-mitigacion-climatica.json',
    indicators: 'https://datos.madrid.es/egob/catalogo/500000-4-indicadores-climaticos.json',
    projections: 'https://datos.madrid.es/egob/catalogo/500000-5-proyecciones-climaticas.json',
    heatWaves: 'https://datos.madrid.es/egob/catalogo/500000-6-olas-calor.json'
  },

  // Movilidad (Mobility)
  mobility: {
    // EMT Madrid - Public Transport
    emt: 'https://www.emtmadrid.es/EMTBUS/MiPrimeraParada/Maps/Google.asmx',
    bikes: 'https://datos.madrid.es/egob/catalogo/300000-9-bicimad.json',
    carSharing: 'https://datos.madrid.es/egob/catalogo/300000-10-carsharing.json',
    electricVehicles: 'https://datos.madrid.es/egob/catalogo/300000-11-vehiculos-electricos.json'
  },

  // Biodiversidad (Biodiversity)
  biodiversity: {
    species: 'https://datos.madrid.es/egob/catalogo/600000-0-especies.json',
    habitats: 'https://datos.madrid.es/egob/catalogo/600000-1-habitats.json',
    protectedAreas: 'https://datos.madrid.es/egob/catalogo/600000-2-areas-protegidas.json'
  }
};

// Helper function to get actual API endpoint from catalog URL
// Note: These are placeholder catalog IDs - actual endpoints need to be discovered
// from the Madrid data portal
function getApiEndpoint(catalogId) {
  return `https://datos.madrid.es/egob/catalogo/${catalogId}.json`;
}

module.exports.getApiEndpoint = getApiEndpoint;

