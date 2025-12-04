import React from 'react';

const MapView = ({ lat, lon }) => {
  // Usar OpenStreetMap Static Map API (gratuito)
  const zoom = 14;
  const width = 450;
  const height = 300;
  
  // StaticMap de OpenStreetMap usando Leaflet
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.02},${lat - 0.01},${lon + 0.02},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;
  
  return (
    <div className="map-container" style={{ width: '100%', height: '300px', position: 'relative' }}>
      <iframe
        title="Mapa de Madrid"
        width="100%"
        height="300"
        frameBorder="0"
        scrolling="no"
        marginHeight="0"
        marginWidth="0"
        src={mapUrl}
        style={{ border: 'none', borderRadius: '8px' }}
      />
      <div style={{ 
        position: 'absolute', 
        bottom: '10px', 
        left: '10px', 
        background: 'rgba(255,255,255,0.9)', 
        padding: '5px 10px', 
        borderRadius: '4px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        📍 {lat.toFixed(4)}, {lon.toFixed(4)}
      </div>
    </div>
  );
};

export default MapView;
