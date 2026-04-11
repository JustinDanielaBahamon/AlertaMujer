import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Button,
  Linking,
  Modal,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { styles } from "./MapaStyles";

/*
 este modulo muestra un mapa con la ubicacion del usuario en tiempo real,
 permite verlo en pantalla completa con boton que aparece al tocar el mapa
 y registra automaticamente la ubicacion en el historial cada 10 minutos (ahora un minuto de prueba)
*/
export default function MapaView() {
  /*
   estado donde se guarda la latitud y longitud del usuario
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
   controlar si el boton de cerrar se muestra
  */
  const [showClose, setShowClose] = useState(false);

  /*
   guardar el historial de ubicaciones
  */
  const [historial, setHistorial] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  /*
   opacidad para el boton
  */
  const closeOpacity = useRef(new Animated.Value(0)).current;

  const [intentosPermiso, setIntentosPermiso] = useState(0);

  /*
   funcion para calcular distancia entre dos puntos en metros
  */
  const getDistanceFromLatLonInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371000; // radio de la tierra en metros
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
   se ejecuta al iniciar el modulo
   pide permiso, ademas registra la ubicacion en el historial cada 10 minutos
  */
  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        if (intentosPermiso === 0) {
          alert(
            "Permiso denegado. Para uso correcto de nuestra app, es recomendable que nos concedas el permiso a tu ubicacion",
          );
          return;
        }

        if (intentosPermiso === 1) {
          alert(
            "Permiso denegado nuevamente. Debes activar el permiso en configuracion",
          );
          return;
        }

        if (intentosPermiso >= 2) {
          alert("Activa el permiso desde configuracion");
          Linking.openSettings();
          return;
        }
      }

      // aqui sigue tu codigo normal si acepta
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

          // solo agregamos al historial si historial vacio o se movio mas de 20 metros
          if (historial.length === 0) {
            setHistorial([newLoc]);
          } else {
            const lastLoc = historial[historial.length - 1];
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
        },
      );

      const historialInterval = setInterval(() => {
        if (location) {
          setHistorial((prev) => [...prev, location]);
        }
      }, 300000); // 300000 = 5 minutos
      // 1000 = 1 segundo

      // limpia subscripcion e intervalo al salir

      return () => {
        if (subscription) subscription.remove();
        clearInterval(historialInterval);
      };
    })();
  }, [location, intentosPermiso]); // <-- cambio clave

  // mensaje mientras se obtiene la ubicacion
  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Obteniendo Ubicacion...</Text>

        {/* boton para reintentar permisos */}
        <Button
          title="Intentar de nuevo"
          onPress={() => setIntentosPermiso((prev) => prev + 1)}
          color="purple"
        />
      </View>
    );
  }

  /*
   abrir o cerrar pantalla completa
  */
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  /*
   funcion para mostrar el boton de cerrar con animacion
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
    }, 15000); // aqui puedes cambiar el tiempo de desaparicion del boton
  };
  // componente del mapa
  const mapComponent = (
    <MapView
      style={styles.map}
      region={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      onPress={fullscreen ? handleMapPress : toggleFullscreen} // un click abre pantalla completa, en fullscreen muestra boton
    >
      {/* marcador en la posicion actual */}

      <Marker coordinate={location} title="Aca te encuentras" pinColor="red" />

      {/* marcadores del historial */}
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
  {
    /* pantalla principal */
  }
  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Text style={styles.title}>Tu Ubicacion Actual</Text>
      </View>

      <View style={styles.mapContainer}>{mapComponent}</View>

      <View style={styles.bottomContainer}>
        <Text style={styles.historialText}>Historial De Ubicaciones</Text>
        {historial.map((pos, index) => (
          <Text key={index} style={styles.historialText}>
            {index + 1}: {pos.latitude.toFixed(5)}, {pos.longitude.toFixed(5)}
          </Text>
        ))}
      </View>

      {/* modo pantalla completa */}
      <Modal visible={fullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          {mapComponent}

          {/* boton de cerrar animado */}
          {showClose && (
            <Animated.View
              style={{
                position: "absolute",
                top: 20,
                right: 10,
                backgroundColor: "rgb(133, 64, 197)",
                padding: 15,
                borderRadius: 50,
                opacity: closeOpacity,
              }}
            >
              <TouchableWithoutFeedback onPress={toggleFullscreen}>
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  Cerrar Mapa
                </Text>
              </TouchableWithoutFeedback>
            </Animated.View>
          )}
        </View>
      </Modal>
    </View>
  );
}
