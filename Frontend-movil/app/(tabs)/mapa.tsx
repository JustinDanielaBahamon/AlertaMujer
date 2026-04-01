import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function Mapa() {
  const [location, setLocation] = useState<{
  latitude: number;
  longitude: number;
} | null>(null);

  useEffect(() => {
    (async () => {
      // 1. Pedir permiso
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Permiso denegado");
        return;
      }

      // 2. Obtener ubicación
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // 3. Mientras carga
  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Obteniendo ubicación...</Text>
      </View>
    );
  }

  // 4. Mostrar mapa con ubicación real
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Estás aquí"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
    width: "100%",
  },
});