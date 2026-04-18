import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Button,
  Modal,
  Text,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Linking
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./MapaStyles";

/*
 este modulo muestra un mapa con la ubicacion del usuario en tiempo real,
 permite verlo en pantalla completa con boton,
 registra la ubicacion evitando duplicados y controla el historial
*/
export default function MapaView() {

  /*
   estado donde se guarda la ubicacion actual
  */
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  /*
   pantalla completa
  */
  const [fullscreen, setFullscreen] = useState(false);

  /*
   controla si se muestra el boton cerrar
  */
  const [showClose, setShowClose] = useState(false);

  /*
   historial de ubicaciones
  */
  const [historial, setHistorial] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  /*
   contador de intentos de permiso
  */
  const [intentosPermiso, setIntentosPermiso] = useState(0);

  /*
   opacidad del boton cerrar
  */
  const closeOpacity = useRef(new Animated.Value(0)).current;

  /*
   referencias para evitar renders innecesarios
  */
  const locationRef = useRef(location);
  const historialRef = useRef(historial);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    historialRef.current = historial;
  }, [historial]);

  /*
   calcula la distancia entre dos puntos en metros
  */
  const getDistanceFromLatLonInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  /*
   se ejecuta al iniciar
   pide permisos y activa el seguimiento de ubicacion
  */
  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      /*
       control de permisos
      */
      if (status !== "granted") {

        if (intentosPermiso === 0) {
          alert("Permiso denegado. Se recomienda activarlo para el perfecto funcionamiento de nuestra app.");
          return;
        }

        if (intentosPermiso === 1) {
          alert("Permiso denegado nuevamente.");
          return;
        }

        if (intentosPermiso >= 2) {
          alert("Si desea tener toda la experiencia de nuestra app, por favor, activa el permiso desde configuracion.");
          Linking.openSettings();
          return;
        }
      }

      /*
       seguimiento en tiempo real
      */
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 80000,
          distanceInterval: 1,
        },
        (loc) => {
          const newLoc = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };

          setLocation(newLoc);

          const currentHistorial = historialRef.current;

          /*
           guardar solo si hay cambio real
          */
          if (currentHistorial.length === 0) {
            setHistorial([newLoc]);
            return;
          }

          const lastLoc = currentHistorial[currentHistorial.length - 1];

          const distance = getDistanceFromLatLonInMeters(
            lastLoc.latitude,
            lastLoc.longitude,
            newLoc.latitude,
            newLoc.longitude,
          );

          if (distance >= 30) {
            setHistorial((prev) => [...prev, newLoc]);
          }
        }
      );

      /*
        registrar ubicacion cada cierto tiempo
      */
      const historialInterval = setInterval(() => {

        const loc = locationRef.current;
        const currentHistorial = historialRef.current;

        if (!loc) return;

        if (currentHistorial.length === 0) {
          setHistorial([loc]);
          return;
        }

        const lastLoc = currentHistorial[currentHistorial.length - 1];

        const distance = getDistanceFromLatLonInMeters(
          lastLoc.latitude,
          lastLoc.longitude,
          loc.latitude,
          loc.longitude,
        );

        /*
         evita guardar ubicaciones iguales
        */
        if (distance >= 30) {
          setHistorial((prev) => [...prev, loc]);
        }

      }, 300000); // cada 5 minutos

      /*
       limpieza al salir
      */
      return () => {
        if (subscription) subscription.remove();
        clearInterval(historialInterval);
      };

    })();

  }, [intentosPermiso]);

  /*
   pantalla de carga
  */
  if (!location) {
    return (
      <LinearGradient colors={["#6356d7b9", "#ff00009a"]} style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.loading}>Obteniendo ubicacion...</Text>

          <Button
            title="Intentar de nuevo"
            onPress={() => setIntentosPermiso((prev) => prev + 1)}
          />
        </View>
      </LinearGradient>
    );
  }

  /*
   abrir o cerrar pantalla completa
  */
  const toggleFullscreen = () => setFullscreen(!fullscreen);

  /*
   mostrar boton cerrar con animacion
  */
  const handleMapPress = () => {
    if (showClose) return;

    setShowClose(true);

    Animated.timing(closeOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(closeOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowClose(false));
    }, 15000);
  };

  /*
   componente del mapa
  */
  const mapComponent = (
    <MapView
      style={styles.map}
      region={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      onPress={fullscreen ? handleMapPress : toggleFullscreen}
    >
      <Marker coordinate={location} title="Tu ubicacion" pinColor="red" />

      {historial.map((pos, index) => (
        <Marker
          key={index}
          coordinate={pos}
          title={`Historial ${index + 1}`}
          pinColor={`hsl(${(index * 50) % 360}, 20%, 50%)`}
        />
      ))}
    </MapView>
  );

  /*
   pantalla principal
  */
  return (
    <LinearGradient colors={["#6356d7b9", "#ff00009a"]} style={styles.container}>
      <View style={styles.card}>

        <View style={styles.topContainer}>
          <Text style={styles.title}>Tu ubicacion</Text>
        </View>

        <View style={styles.mapContainer}>{mapComponent}</View>

        <View style={styles.bottomContainer}>
          <Text style={styles.subtitle}>Historial de ubicacion</Text>

          <ScrollView style={{ width: "100%" }}>
            <View style={styles.table}>

              <View style={styles.rowHeader}>
                <Text style={styles.cellHeader}>Orden</Text>
                <Text style={styles.cellHeader}>Latitud</Text>
                <Text style={styles.cellHeader}>Longitud</Text>
              </View>

              {historial.map((pos, index) => (
                <View key={index} style={styles.row}>
                  <Text style={styles.cell}>{index + 1}</Text>
                  <Text style={styles.cell}>{pos.latitude.toFixed(5)}</Text>
                  <Text style={styles.cell}>{pos.longitude.toFixed(5)}</Text>
                </View>
              ))}

            </View>
          </ScrollView>
        </View>
      </View>
     {/* Boton de cerrar mapa en pantalla completa */}
      <Modal visible={fullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          {mapComponent}

          {showClose && (
            <Animated.View
              style={{
                position: "absolute",
                top: 20,
                right: 10,
                backgroundColor: "#6a11cb",
                padding: 15,
                borderRadius: 50,
                opacity: closeOpacity,
              }}
            >
              <TouchableWithoutFeedback onPress={toggleFullscreen}>
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Cerrar mapa
                </Text>
              </TouchableWithoutFeedback>
            </Animated.View>
          )}
        </View>
      </Modal>
    </LinearGradient>
  );
}