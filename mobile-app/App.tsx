import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { apiService, CategoryData, Recommendation } from './services/api';
import { getMadridArea } from './services/geocoding';
import MapViewComponent from './components/MapView';
import Chatbot from './components/Chatbot';

// Default location: Madrid Centro (Puerta del Sol)
const DEFAULT_LAT = 40.4168;
const DEFAULT_LON = -3.7038;

type UserRole = 'Ciudadano' | 'Turista' | 'Empresa' | 'Gobierno';

export interface CategoryInfo {
  id: string;
  title: string;
  data: CategoryData | null;
  loading: boolean;
}

export default function App() {
  const [location, setLocation] = useState<{ coords: { latitude: number; longitude: number } } | null>(null);
  const [categories, setCategories] = useState<Record<string, CategoryInfo>>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Ciudadano');
  const [loading, setLoading] = useState(true);
  const [currentZone, setCurrentZone] = useState<string>('Área Metropolitana');
  const [showChatbot, setShowChatbot] = useState(false);

  // Load all data from APIs
  const loadData = async (lat: number, lon: number) => {
    setLoading(true);
    
    try {
      // Fetch all categories in parallel
      const [
        airQuality,
        recycling,
        water,
        energy,
        greenSpaces,
        climate,
        heatWave,
        biodiversity
      ] = await Promise.all([
        apiService.getAirQuality(lat, lon),
        apiService.getRecyclingPoints(lat, lon, 1000),
        apiService.getWaterData(lat, lon),
        apiService.getEnergyData(lat, lon),
        apiService.getGreenSpacesData(lat, lon),
        apiService.getClimateData(lat, lon),
        apiService.getHeatWaveData(lat, lon),
        apiService.getBiodiversityData(lat, lon),
      ]);

      // Update categories state
      setCategories({
        airQuality: {
          id: 'airQuality',
          title: 'Contaminación Atmosférica / Calidad del aire',
          data: airQuality,
          loading: false,
        },
        recycling: {
          id: 'recycling',
          title: 'Residuos',
          data: recycling,
          loading: false,
        },
        water: {
          id: 'water',
          title: 'Gestión del Agua',
          data: water,
          loading: false,
        },
        energy: {
          id: 'energy',
          title: 'Uso Energético',
          data: energy,
          loading: false,
        },
        greenSpaces: {
          id: 'greenSpaces',
          title: 'Espacios Verdes y Suelos',
          data: greenSpaces,
          loading: false,
        },
        climate: {
          id: 'climate',
          title: 'Cambio Climático General',
          data: climate,
          loading: false,
        },
        heatWave: {
          id: 'heatWave',
          title: 'Olas de Calor',
          data: heatWave,
          loading: false,
        },
        biodiversity: {
          id: 'biodiversity',
          title: 'Biodiversidad',
          data: biodiversity,
          loading: false,
        },
      });

      // Generate recommendations based on all data
      const allData = {
        airQuality,
        recycling,
        water,
        energy,
        greenSpaces,
        climate,
        heatWave,
        biodiversity,
      };
      const recs = await apiService.getRecommendations(lat, lon, allData);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load data immediately with default location
    setLocation({ coords: { latitude: DEFAULT_LAT, longitude: DEFAULT_LON } });
    loadData(DEFAULT_LAT, DEFAULT_LON);
    
    // Try to get real location (optional, non-blocking)
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            maximumAge: 60000,
          });
      setLocation({ coords: { latitude: location.coords.latitude, longitude: location.coords.longitude } });
      const zone = getMadridArea(location.coords.latitude, location.coords.longitude);
      setCurrentZone(zone);
      loadData(location.coords.latitude, location.coords.longitude);
        }
      } catch (error) {
        console.log('Location optional, using default:', error);
      }
    })();
    
    // Set initial zone
    const initialZone = getMadridArea(DEFAULT_LAT, DEFAULT_LON);
    setCurrentZone(initialZone);
  }, []);

  const getQualityColor = (level?: string): string => {
    if (!level) return '#9E9E9E';
    switch (level.toLowerCase()) {
      case 'buena': return '#4CAF50'; // Green
      case 'media': 
      case 'regular': return '#FFC107'; // Yellow
      case 'mala': return '#F44336'; // Red
      default: return '#9E9E9E'; // Gray
    }
  };

  const displayLocation = location || {
    coords: { latitude: DEFAULT_LAT, longitude: DEFAULT_LON },
  };

  const roles: UserRole[] = ['Ciudadano', 'Turista', 'Empresa', 'Gobierno'];

  const renderDataCard = (category: CategoryInfo) => {
    const { data } = category;
    
    if (!data || !data.available) {
      return (
        <View style={styles.dataCard}>
          <Text style={styles.cardTitle}>{category.title}</Text>
          <Text style={[styles.cardStatus, { color: '#9E9E9E' }]}>
            Datos no disponibles
          </Text>
        </View>
      );
    }

    const color = getQualityColor(data.level);
    const message = data.message || 'Datos disponibles';

    return (
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>{category.title}</Text>
        <Text style={[styles.cardStatus, { color }]}>
          {data.level || 'Media'}
        </Text>
        <Text style={styles.cardMetric}>{message}</Text>
        {category.id === 'airQuality' && data.data?.pollutants && (
          <>
            <Text style={styles.cardMetric}>
              NO2 - {data.data.pollutants.NO2?.value || 0}µg/m³
            </Text>
            <Text style={styles.cardMetric}>
              O3 - {data.data.pollutants.O3?.value || 0} µg/m³
            </Text>
          </>
        )}
        {category.id === 'recycling' && data.data && (
          <>
            <Text style={styles.cardMetric}>
              {data.data.count || 0} centros de reciclaje
            </Text>
            <Text style={styles.cardMetric}>
              {data.data.batteryDeposits || 0} depósitos de pilas
            </Text>
          </>
        )}
        {category.id === 'water' && data.data && (
          <>
            <Text style={styles.cardMetric}>
              pH: {data.data.ph || 7.0}
            </Text>
            <Text style={styles.cardMetric}>
              Turbidez: {data.data.turbidity || 0} NTU
            </Text>
          </>
        )}
        {category.id === 'energy' && data.data && (
          <>
            <Text style={styles.cardMetric}>
              {data.data.renewable || 0}% renovable
            </Text>
            <Text style={styles.cardMetric}>
              Eficiencia: {data.data.efficiency || 'Media'}
            </Text>
          </>
        )}
        {category.id === 'greenSpaces' && data.data && (
          <>
            <Text style={styles.cardMetric}>
              {data.data.parks || 0} parques
            </Text>
            <Text style={styles.cardMetric}>
              {data.data.trees || 0} árboles
            </Text>
          </>
        )}
        {category.id === 'climate' && data.data && (
          <>
            <Text style={styles.cardMetric}>
              Temp: {data.data.temperature || 0}°C
            </Text>
            <Text style={styles.cardMetric}>
              Emisiones: {data.data.emissions || 0} CO2
            </Text>
          </>
        )}
        {category.id === 'heatWave' && data.data && (
          <>
            <Text style={styles.cardMetric}>
              {data.data.active ? 'Ola de calor activa' : 'Sin olas de calor'}
            </Text>
            <Text style={styles.cardMetric}>
              Temp: {data.data.temperature || 0}°C
            </Text>
          </>
        )}
        {category.id === 'biodiversity' && data.data && (
          <>
            <Text style={styles.cardMetric}>
              {data.data.species || 0} especies
            </Text>
            <Text style={styles.cardMetric}>
              {data.data.habitats || 0} hábitats
            </Text>
          </>
        )}
        {/* Show disclaimer for example data */}
        {data.isExample && (
          <Text style={styles.disclaimerText}>
            (Datos reales no disponibles en la zona. Los datos mostrados son datos ejemplo tomados de zonas cercanas)
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Consulta Ambiental Madrid</Text>
      </View>

      {/* Role Selector */}
      <View style={styles.roleSelector}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.roleTab, selectedRole === role && styles.roleTabActive]}
            onPress={() => setSelectedRole(role)}
          >
            <Text style={[styles.roleText, selectedRole === role && styles.roleTextActive]}>
              {role}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Cargando datos ambientales...</Text>
        </View>
      ) : selectedRole === 'Empresa' || selectedRole === 'Gobierno' ? (
        <View style={styles.enterpriseContainer}>
          <View style={styles.mapContainer}>
            <MapViewComponent
              latitude={displayLocation.coords.latitude}
              longitude={displayLocation.coords.longitude}
              recyclingPoints={categories.recycling?.data?.data?.points || []}
              airQuality={categories.airQuality?.data?.data}
            />
          </View>
          <View style={styles.enterpriseMessage}>
            <Text style={styles.enterpriseTitle}>
              La versión extensa para empresas/gobierno estará disponible pronto
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Map View */}
          <View style={styles.mapContainer}>
            <MapViewComponent
              latitude={displayLocation.coords.latitude}
              longitude={displayLocation.coords.longitude}
              recyclingPoints={categories.recycling?.data?.data?.points || []}
              airQuality={categories.airQuality?.data?.data}
            />
          </View>

          {/* Zone Label */}
          <View style={styles.zoneLabel}>
            <Text style={styles.zoneText}>Zona: {currentZone}</Text>
          </View>

          {/* Datos Section */}
          <View style={styles.datosSection}>
            <Text style={styles.sectionTitle}>Datos de la zona y áreas cercanas</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsContainer}>
              {Object.values(categories).map((category) => (
                <View key={category.id}>
                  {renderDataCard(category)}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Recomendaciones Section */}
          <View style={styles.recomendacionesSection}>
            <Text style={styles.sectionTitle}>Recomendaciones ajustadas a la zona y datos actuales</Text>
            
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <View style={styles.bulletPoint} />
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationText}>{rec.title}</Text>
                    {rec.description && (
                      <Text style={styles.recommendationDescription}>{rec.description}</Text>
                    )}
                    {rec.impact && (
                      <Text style={styles.recommendationImpact}>{rec.impact}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.recommendationItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.recommendationText}>No hay recomendaciones disponibles</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
      
      {/* Chatbot Button */}
      <TouchableOpacity
        style={styles.chatbotButton}
        onPress={() => setShowChatbot(true)}
      >
        <Text style={styles.chatbotButtonText}>💬 Consulta tu impacto ecológico</Text>
      </TouchableOpacity>
      
      {/* Chatbot Modal */}
      {showChatbot && (
        <Chatbot
          visible={showChatbot}
          onClose={() => setShowChatbot(false)}
          zone={currentZone}
          categories={categories}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#556B2F',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  roleTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  roleTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: 'white',
  },
  roleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
  },
  roleTextActive: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 350,
    marginTop: 0,
  },
  zoneLabel: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  zoneText: {
    fontSize: 16,
    color: 'white',
  },
  datosSection: {
    backgroundColor: '#000000',
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  dataCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    minHeight: 150,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  cardStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardMetric: {
    fontSize: 12,
    color: 'white',
    marginBottom: 4,
  },
  recomendacionesSection: {
    backgroundColor: '#000000',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    marginRight: 12,
    marginTop: 6,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    lineHeight: 22,
    marginBottom: 6,
  },
  recommendationDescription: {
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 18,
    marginBottom: 8,
  },
  recommendationImpact: {
    fontSize: 12,
    color: '#4CAF50',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  disclaimerText: {
    fontSize: 10,
    color: '#FFC107',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 14,
  },
  enterpriseContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  enterpriseMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#000000',
  },
  enterpriseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 26,
  },
  chatbotButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  chatbotButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
