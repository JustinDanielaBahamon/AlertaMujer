import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Button, Modal, Text, TouchableWithoutFeedback, View, ScrollView, Linking } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { styles } from "./MapaStyles";
import { useTheme } from "../../../contexts/ThemeContext";

export default function MapaView() {
  const { theme } = useTheme(); // colores del tema activo

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null); // ubicación actual
  const [fullscreen, setFullscreen] = useState(false);   // modo pantalla completa
  const [showClose, setShowClose] = useState(false);     // mostrar botón cerrar
  const [historial, setHistorial] = useState<{ latitude: number; longitude: number }[]>([]); // posiciones guardadas
  const [intentosPermiso, setIntentosPermiso] = useState(0); // intentos de permiso GPS

  const closeOpacity = useRef(new Animated.Value(0)).current; // animación botón cerrar
  const locationRef = useRef(location);   // referencia para usar en intervals
  const historialRef = useRef(historial); // referencia para usar en intervals

  useEffect(() => { locationRef.current = location; }, [location]);
  useEffect(() => { historialRef.current = historial; }, [historial]);

  // Calcula distancia en metros entre dos coordenadas (fórmula Haversine)
  const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Pide permiso GPS y activa seguimiento en tiempo real
  // Solo guarda en historial si el usuario se movió más de 30 metros
  // También guarda cada 5 minutos si hubo movimiento
  useEffect(() => {
    let subscription: Location.LocationSubscription;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (intentosPermiso === 0) { alert("Permiso denegado. Se recomienda activarlo."); return; }
        if (intentosPermiso === 1) { alert("Permiso denegado nuevamente."); return; }
        if (intentosPermiso >= 2) { alert("Activa el permiso desde configuracion."); Linking.openSettings(); return; }
      }

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 80000, distanceInterval: 1 },
        (loc) => {
          const newLoc = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setLocation(newLoc);
          const currentHistorial = historialRef.current;
          if (currentHistorial.length === 0) { setHistorial([newLoc]); return; }
          const lastLoc = currentHistorial[currentHistorial.length - 1];
          if (getDistanceFromLatLonInMeters(lastLoc.latitude, lastLoc.longitude, newLoc.latitude, newLoc.longitude) >= 30)
            setHistorial((prev) => [...prev, newLoc]);
        }
      );

      const historialInterval = setInterval(() => {
        const loc = locationRef.current;
        const currentHistorial = historialRef.current;
        if (!loc) return;
        if (currentHistorial.length === 0) { setHistorial([loc]); return; }
        const lastLoc = currentHistorial[currentHistorial.length - 1];
        if (getDistanceFromLatLonInMeters(lastLoc.latitude, lastLoc.longitude, loc.latitude, loc.longitude) >= 30)
          setHistorial((prev) => [...prev, loc]);
      }, 300000); // cada 5 minutos

      return () => { if (subscription) subscription.remove(); clearInterval(historialInterval); };
    })();
  }, [intentosPermiso]);

  // Pantalla de carga mientras no hay GPS
  if (!location) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <Text style={[styles.loading, { color: theme.text }]}>Obteniendo ubicacion...</Text>
          <Button title="Intentar de nuevo" onPress={() => setIntentosPermiso((prev) => prev + 1)} />
        </View>
      </View>
    );
  }

  const toggleFullscreen = () => setFullscreen(!fullscreen);

  // Muestra botón cerrar al tocar el mapa en pantalla completa, desaparece a los 15s
  const handleMapPress = () => {
    if (showClose) return;
    setShowClose(true);
    Animated.timing(closeOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(closeOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
        .start(() => setShowClose(false));
    }, 15000);
  };

  // Mapa reutilizable en vista normal y pantalla completa
  const mapComponent = (
    <MapView
      style={styles.map}
      region={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
      onPress={fullscreen ? handleMapPress : toggleFullscreen}
    >
      <Marker coordinate={location} title="Tu ubicacion" pinColor="red" />
      {historial.map((pos, index) => (
        <Marker key={index} coordinate={pos} title={`Historial ${index + 1}`}
          pinColor={`hsl(${(index * 50) % 360}, 20%, 50%)`} />
      ))}
    </MapView>
  );

  // Pantalla principal
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>

        <View style={styles.topContainer}>
          <Text style={[styles.title, { color: theme.text }]}>Tu ubicacion</Text>
        </View>

        <View style={styles.mapContainer}>{mapComponent}</View>

        {/* Tabla historial */}
        <View style={[styles.bottomContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Historial de ubicacion</Text>
          <ScrollView style={{ width: "100%" }}>
            <View style={styles.table}>
              <View style={[styles.rowHeader, { backgroundColor: theme.tabBackground }]}>
                <Text style={[styles.cellHeader, { color: theme.headerText }]}>Orden</Text>
                <Text style={[styles.cellHeader, { color: theme.headerText }]}>Latitud</Text>
                <Text style={[styles.cellHeader, { color: theme.headerText }]}>Longitud</Text>
              </View>
              {historial.map((pos, index) => (
                <View key={index} style={[styles.row, {
                  backgroundColor: index % 2 === 0 ? theme.containerBackground : theme.card
                }]}>
                  <Text style={[styles.cell, { color: theme.text }]}>{index + 1}</Text>
                  <Text style={[styles.cell, { color: theme.text }]}>{pos.latitude.toFixed(5)}</Text>
                  <Text style={[styles.cell, { color: theme.text }]}>{pos.longitude.toFixed(5)}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Modal pantalla completa */}
      <Modal visible={fullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          {mapComponent}
          {showClose && (
            <Animated.View style={{
              position: "absolute", top: 20, right: 10,
              backgroundColor: theme.tabBackground, padding: 15, borderRadius: 50, opacity: closeOpacity,
            }}>
              <TouchableWithoutFeedback onPress={toggleFullscreen}>
                <Text style={{ color: theme.headerText, fontWeight: "bold" }}>Cerrar mapa</Text>
              </TouchableWithoutFeedback>
            </Animated.View>
          )}
        </View>
      </Modal>
    </View>
  );
}