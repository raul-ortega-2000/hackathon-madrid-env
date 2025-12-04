import React, { useState, useEffect } from 'react';
import { getAirQuality, getRecyclingPoints, getRecommendations } from './services/api';
import MapView from './MapView';
import './App.css';

// Componente principal
function App() {
  const [location, setLocation] = useState({ lat: 40.4168, lon: -3.7038 }); // Madrid centro
  const [airQuality, setAirQuality] = useState(null);
  const [recyclingPoints, setRecyclingPoints] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Intentar obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('No se pudo obtener ubicación, usando Madrid centro');
        }
      );
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [location]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [airData, recyclingData, recommendationsData] = await Promise.all([
        getAirQuality(location.lat, location.lon),
        getRecyclingPoints(location.lat, location.lon, 1000),
        getRecommendations(location.lat, location.lon)
      ]);

      setAirQuality(airData);
      setRecyclingPoints(recyclingData.points || []);
      setRecommendations(recommendationsData.recommendations || []);
    } catch (err) {
      setError('Error cargando datos. Por favor intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌍 España Ambiental</h1>
        <p>Datos medioambientales en tiempo real de España</p>
      </header>

      {loading && <div className="loading">Cargando datos...</div>}
      {error && <div className="error">{error}</div>}

      <div className="container">
        {/* Sección de Calidad del Aire */}
        {airQuality && (
          <div className="card air-quality-card">
            <h2>📊 Calidad del Aire</h2>
            <div className="air-quality-badge" style={{ backgroundColor: airQuality.airQuality.color }}>
              {airQuality.airQuality.level}
            </div>
            <div className="metrics">
              <div className="metric">
                <span className="label">NO₂</span>
                <span className="value">{airQuality.airQuality.NO2} µg/m³</span>
              </div>
              <div className="metric">
                <span className="label">PM10</span>
                <span className="value">{airQuality.airQuality.PM10} µg/m³</span>
              </div>
              <div className="metric">
                <span className="label">PM2.5</span>
                <span className="value">{airQuality.airQuality.PM2_5} µg/m³</span>
              </div>
              <div className="metric">
                <span className="label">O₃</span>
                <span className="value">{airQuality.airQuality.O3} µg/m³</span>
              </div>
            </div>
            <p className="recommendation">{airQuality.recommendation}</p>
            <p className="station-info">
              Estación: {airQuality.station.name} ({airQuality.station.distance}m)
            </p>
          </div>
        )}

        {/* Sección de Recomendaciones */}
        {recommendations.length > 0 && (
          <div className="card recommendations-card">
            <h2>💡 Recomendaciones</h2>
            {recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-item ${rec.priority}`}>
                <div className="rec-header">
                  <span className="rec-icon">{rec.icon}</span>
                  <h3>{rec.title}</h3>
                </div>
                <p>{rec.message}</p>
                {rec.actions && (
                  <ul className="actions">
                    {rec.actions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                )}
                {rec.alternatives && (
                  <div className="alternatives">
                    {rec.alternatives.map((alt, i) => (
                      <div key={i} className="alternative">
                        <strong>{alt.name}</strong> - {alt.distance}m - {alt.improvement}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sección de Puntos de Reciclaje */}
        {recyclingPoints.length > 0 && (
          <div className="card recycling-card">
            <h2>♻️ Puntos de Reciclaje Cercanos</h2>
            <p className="points-count">{recyclingPoints.length} puntos encontrados</p>
            <div className="recycling-list">
              {recyclingPoints.slice(0, 5).map((point, index) => (
                <div key={index} className="recycling-point">
                  <div className="point-header">
                    <span className="point-icon">
                      {point.type === 'punto_limpio' ? '🏢' : '🗑️'}
                    </span>
                    <h4>{point.name}</h4>
                  </div>
                  <p className="point-address">{point.address}</p>
                  <p className="point-distance">{point.distance}m de distancia</p>
                  {point.description && <p className="point-desc">{point.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mapa Simple (placeholder) */}
        <div className="card map-card">
          <h2>🗺️ Mapa</h2>
          <div className="map-content">
            <MapView lat={location.lat} lon={location.lon} />
            <button onClick={fetchAllData} className="refresh-btn" style={{ marginTop: "10px" }}>
              🔄 Actualizar Datos
            </button>
          </div>
        </div>
      </div>

      <footer className="App-footer">
        <p>Datos de <a href="https://datos.madrid.es" target="_blank" rel="noopener noreferrer">datos.madrid.es</a></p>
        <p>España Ambiental - Información medioambiental en tiempo real</p>
      </footer>
    </div>
  );
}

export default App;
