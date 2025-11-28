import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface RecyclingPoint {
  id: number | string;
  name?: string;
  type?: string;
  address?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  location?: {
    lat: number;
    lon: number;
  };
}

interface AirQualityData {
  station?: string;
  distance?: number;
  pollutants?: {
    NO2?: { value: number; unit: string };
    O3?: { value: number; unit: string };
  };
  quality?: {
    level?: string;
    color?: string;
  };
}

interface MapViewProps {
  latitude: number;
  longitude: number;
  recyclingPoints: RecyclingPoint[];
  airQuality?: AirQualityData | null;
}

export default function MapViewComponent({ latitude, longitude, recyclingPoints, airQuality }: MapViewProps) {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={false}
      >
        {/* User location marker */}
        <Marker
          coordinate={{ latitude, longitude }}
          title="Tu ubicación"
          description="Ubicación actual"
          pinColor="#4CAF50"
        />

        {/* Air quality station marker - using approximate position based on distance */}
        {airQuality && airQuality.distance && airQuality.distance < 5000 && (
          <Marker
            coordinate={{
              latitude: latitude + (airQuality.distance / 111000) * Math.cos(Math.PI / 4),
              longitude: longitude + (airQuality.distance / 111000) * Math.sin(Math.PI / 4),
            }}
            title={airQuality.station || 'Estación de calidad del aire'}
            description={`Calidad: ${airQuality.quality?.level || 'Media'} - ${(airQuality.distance / 1000).toFixed(2)} km`}
            pinColor={airQuality.quality?.color === '#4CAF50' ? 'green' : airQuality.quality?.color === '#FFC107' ? 'orange' : 'red'}
          />
        )}

        {/* Recycling points markers */}
        {recyclingPoints.slice(0, 10).map((point, index) => {
          const lat = point.latitude || point.location?.lat;
          const lon = point.longitude || point.location?.lon;
          if (!lat || !lon) return null;
          
          return (
            <Marker
              key={point.id || index}
              coordinate={{
                latitude: lat,
                longitude: lon,
              }}
              title={point.name || 'Punto de reciclaje'}
              description={`${point.type || 'Reciclaje'} - ${point.distance ? point.distance.toFixed(0) + 'm' : ''}`}
              pinColor="#2196F3"
            />
          );
        })}
      </MapView>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Tu ubicación</Text>
        </View>
        {airQuality && airQuality.quality && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: airQuality.quality.color || '#9E9E9E' }]} />
            <Text style={styles.legendText}>Estación calidad aire</Text>
          </View>
        )}
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
          <Text style={styles.legendText}>Puntos reciclaje</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 350,
    margin: 0,
    marginTop: 0,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  map: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 10,
    color: 'white',
  },
});

