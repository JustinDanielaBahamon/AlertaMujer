import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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

  /*
   se ejecuta al iniciar el modulo
   pide permiso, ademas registra la ubicacion en el historial cada 10 minutos
  */
  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        alert("permiso denegado");
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 7000,
          distanceInterval: 1,
        },
        (loc) => {
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        },
      );

      // guardar ubicacion en el historial cada 10 minutos
      const historialInterval = setInterval(() => {
        if (location) {
          setHistorial((prev) => [...prev, location]);
        }
      }, 1000); // 600000 = 10 minutos 
      // 1000 = 1 minuto

      // limpia subscripcion e intervalo al salir
      return () => {
        if (subscription) subscription.remove();
        clearInterval(historialInterval);
      };
    })();
  }, [location]);

  // mensaje mientras se obtiene la ubicacion
  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Obteniendo Ubicacion...</Text>
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

    // desaparecer despues de 10 segundos
    setTimeout(() => {
      Animated.timing(closeOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowClose(false));
    }, 10000); // <--- aqui puedes cambiar el tiempo de desaparicion
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
      <Marker coordinate={location} title="Aca estas" />

      {/* marcadores del historial */}
      {historial.map((pos, index) => (
        <Marker
          key={index}
          coordinate={pos}
          title={`Historial ${index + 1}`}
        />
      ))}
    </MapView>
  );

  // pantalla principal
  return (
    <View style={styles.container}>
      {/* arriba */}
      <View style={styles.topContainer}>
        <Text style={styles.title}>Tu Ubicacion Actual</Text>
      </View>

      {/* mapa */}
      <View style={styles.mapContainer}>{mapComponent}</View>

      {/* abajo */}
      <View style={styles.bottomContainer}>
        <Text style={styles.historialText}>Historial De Ubicaciones</Text>
      </View>

      // modo pantalla completa
      <Modal visible={fullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          {mapComponent}

          // boton de cerrar animado
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
