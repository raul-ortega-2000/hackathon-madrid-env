import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
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
        <Text style={styles.loadingText}>🌿 Cargando Madrid Ambiental...</Text>
      </View>
    );
  }

  if (errorMsg || !location) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>❌ {errorMsg || 'Error al obtener ubicación'}</Text>
        <Text style={styles.errorSubtext}>Por favor, permite el acceso a la ubicación</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌿 Madrid Ambiental</Text>
        <Text style={styles.headerSubtitle}>Datos en tiempo real</Text>
        <Text style={styles.locationText}>
          📍 {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {airQuality && (
          <View style={[styles.card, { borderLeftColor: getQualityColor(airQuality.quality.level) }]}>
            <Text style={styles.cardTitle}>🌡️ Calidad del Aire</Text>
            <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(airQuality.quality.level) }]}>
              <Text style={styles.qualityText}>{airQuality.quality.level.toUpperCase()}</Text>
            </View>
            <Text style={styles.cardSubtitle}>{airQuality.station}</Text>
            <Text style={styles.distance}>📍 {airQuality.distance.toFixed(2)} km de distancia</Text>
            
            <View style={styles.pollutants}>
              {Object.entries(airQuality.pollutants).map(([key, data]: [string, any]) => (
                <View key={key} style={styles.pollutant}>
                  <Text style={styles.pollutantName}>{key}</Text>
                  <Text style={styles.pollutantValue}>{data.value} {data.unit}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

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

        {recyclingPoints.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>♻️ Puntos de Reciclaje Cercanos</Text>
            {recyclingPoints.slice(0, 5).map((point) => (
              <View key={point.id} style={styles.recyclingPoint}>
                <Text style={styles.pointName}>{point.name}</Text>
                <Text style={styles.pointAddress}>{point.address}</Text>
                <Text style={styles.pointDistance}>📍 {point.distance.toFixed(0)}m de distancia</Text>
              </View>
            ))}
            {recyclingPoints.length > 5 && (
              <Text style={styles.moreText}>+{recyclingPoints.length - 5} puntos más</Text>
            )}
          </View>
        )}

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={() => location && loadData(location.coords.latitude, location.coords.longitude)}
        >
          <Text style={styles.refreshText}>🔄 Actualizar Datos</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Datos de datos.madrid.es</Text>
          <Text style={styles.footerText}>Hackathon Madrid 2025</Text>
        </View>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 20,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  content: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
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
    fontSize: 16,
  },
  pollutants: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  pollutant: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 85,
  },
  pollutantName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  pollutantValue: {
    fontSize: 16,
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
    fontSize: 28,
    marginRight: 12,
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  recDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  recyclingPoint: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  pointName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  pointAddress: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  pointDistance: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '600',
  },
  moreText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  refreshText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
