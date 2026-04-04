import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

/*
 componente que muestra un mapa con la ubicacion del usuario en tiempo real
*/
export default function Mapa() {

  /*
   estado donde se guarda la latitud y longitud del usuario
  */
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  /*
   se ejecuta al iniciar el componente
   pide permisos y obtiene la ubicacion continuamente
  */
  useEffect(() => {

    // guarda la suscripcion de la ubicacion
    let subscription: Location.LocationSubscription;

    (async () => {

      // solicita permisos de ubicacion
      let { status } = await Location.requestForegroundPermissionsAsync();

      // si no hay permisos, se detiene
      if (status !== "granted") {
        console.log("permiso denegado");
        return;
      }

      /*
       escucha cambios de ubicacion en tiempo real
      */
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 7000,
          distanceInterval: 1,
        },
        (loc) => {

          // actualiza la ubicacion
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );
    })();

    /*
     limpia la suscripcion al salir del componente
    */
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // mensaje mientras se obtiene la ubicacion
  if (!location) {
    return (
      <View style={styles.container}>
        <Text>obteniendo ubicacion...</Text>
      </View>
    );
  }

  // muestra el mapa con la ubicacion actual
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}

        /*
         centra el mapa segun la ubicacion
        */
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >

        {/* marcador en la posicion actual */}
        <Marker coordinate={location} title="estas aqui" />
      </MapView>
    </View>
  );
}

// estilos basicos del contenedor y mapa
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});