import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { apiService, AirQualityData, RecyclingPoint, Recommendation } from './services/api';

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [recyclingPoints, setRecyclingPoints] = useState<RecyclingPoint[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permiso de ubicación denegado');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        
        // Cargar datos
        await loadData(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        setErrorMsg('Error al obtener ubicación');
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadData = async (lat: number, lon: number) => {
    try {
      const [airData, recycling, recs] = await Promise.all([
        apiService.getAirQuality(lat, lon),
        apiService.getRecyclingPoints(lat, lon, 1000),
        apiService.getRecommendations(lat, lon)
      ]);
      
      setAirQuality(airData);
      setRecyclingPoints(recycling);
      setRecommendations(recs);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos ambientales');
      console.error(error);
    }
  };

  const getQualityColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'buena': return '#4CAF50';
      case 'regular': return '#FFC107';
      case 'mala': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando datos ambientales...</Text>
      </View>
    );
  }

  if (errorMsg || !location) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>❌ {errorMsg || 'Error al obtener ubicación'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌿 Madrid Ambiental</Text>
        <Text style={styles.headerSubtitle}>Datos en tiempo real</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Mapa */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {/* Ubicación actual */}
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Tu ubicación"
              pinColor="blue"
            />

            {/* Puntos de reciclaje */}
            {recyclingPoints.map((point) => (
              <Marker
                key={point.id}
                coordinate={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
                title={point.name}
                description={point.type}
                pinColor="green"
              />
            ))}
          </MapView>
        </View>

        {/* Calidad del Aire */}
        {airQuality && (
          <View style={[styles.card, { borderLeftColor: getQualityColor(airQuality.quality.level) }]}>
            <Text style={styles.cardTitle}>🌡️ Calidad del Aire</Text>
            <View style={styles.qualityBadge} backgroundColor={getQualityColor(airQuality.quality.level)}>
              <Text style={styles.qualityText}>{airQuality.quality.level.toUpperCase()}</Text>
            </View>
            <Text style={styles.cardSubtitle}>{airQuality.station}</Text>
            <Text style={styles.distance}>📍 {airQuality.distance.toFixed(2)} km</Text>
            
            <View style={styles.pollutants}>
              {Object.entries(airQuality.pollutants).map(([key, data]) => (
                <View key={key} style={styles.pollutant}>
                  <Text style={styles.pollutantName}>{key}</Text>
                  <Text style={styles.pollutantValue}>{data.value} {data.unit}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recomendaciones */}
        {recommendations.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💡 Recomendaciones</Text>
            {recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendation}>
                <Text style={styles.recIcon}>{rec.icon}</Text>
                <View style={styles.recContent}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recDescription}>{rec.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Puntos de Reciclaje */}
        {recyclingPoints.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>♻️ Puntos de Reciclaje Cercanos</Text>
            {recyclingPoints.slice(0, 5).map((point) => (
              <View key={point.id} style={styles.recyclingPoint}>
                <Text style={styles.pointName}>{point.name}</Text>
                <Text style={styles.pointAddress}>{point.address}</Text>
                <Text style={styles.pointDistance}>📍 {point.distance.toFixed(0)}m</Text>
              </View>
            ))}
          </View>
        )}

        {/* Refresh Button */}
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => loadData(location.coords.latitude, location.coords.longitude)}
        >
          <Text style={styles.refreshText}>🔄 Actualizar Datos</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    textAlign: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 250,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  map: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  distance: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  qualityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  qualityText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pollutants: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  pollutant: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 80,
  },
  pollutantName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  pollutantValue: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  recommendation: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  recIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recDescription: {
    fontSize: 12,
    color: '#666',
  },
  recyclingPoint: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  pointName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  pointAddress: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  pointDistance: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  refreshText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
