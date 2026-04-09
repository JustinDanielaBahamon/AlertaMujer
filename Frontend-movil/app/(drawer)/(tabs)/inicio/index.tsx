import {
  View,
  Text,
  TouchableOpacity,
  Vibration,
  ActivityIndicator,
  Image,
} from "react-native";
import { styles } from "./inicio.styles";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";

export default function Inicio() {
  const navigation = useNavigation<any>();
  const [pressed, setPressed] = useState(false);

  const [ubicacionNombre, setUbicacionNombre] = useState("Obteniendo ubicación...");
  const [cargando, setCargando] = useState(false);

  const obtenerUbicacion = async () => {
    try {
      setCargando(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setUbicacionNombre("Permiso denegado");
        setCargando(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      let direccion = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (direccion.length > 0) {
        let lugar = direccion[0];
        const nombreFinal = lugar.name || lugar.street || "Ubicación desconocida";
        setUbicacionNombre(`${nombreFinal}, ${lugar.city}`);
      }
    } catch (error) {
      setUbicacionNombre("Error al actualizar");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerUbicacion();
  }, []);

  const activarAlerta = () => {
    Vibration.vibrate(200);
    navigation.navigate("Activacion");
  };

  return(
    <View style={styles.container}>

       {/* este el boton que hizo desde un principio Maicol aun asi lo deje por ahora */}
       <View style={styles.topSection}>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              
            <Text style={styles.botonLogin}>Presiona para ir login</Text>
        
          </TouchableOpacity> 
      </View>

       {/* el contenedor de la ubicación actual */}
      <View style={styles.containerUbicacion}>
        <MaterialIcons name="location-on" size={24} color="#7B2CBF" />
        <Text style={styles.iconoUbicacion}></Text>
        
        <View style={styles.infoUbicacion}>
          <Text style={styles.tituloUbicacion}>Ubicación actual</Text>
          {/* Aquí mostramos el estado de la ubicación dinámicamente */}
          <Text style={styles.textoUbicacion} numberOfLines={1}>
            {ubicacionNombre}
          </Text>
        </View>

        {/* Botón de recargar con lógica de carga */}
        <TouchableOpacity onPress={obtenerUbicacion} disabled={cargando}>
          {cargando ? (
            <ActivityIndicator size="small" color="#7B2CBF" />
          ) : (
            <MaterialIcons name="refresh" size={24} color="#7B2CBF" />
          )}
        </TouchableOpacity>

      </View>

      {/* boton de alerta  */}
       <View style={styles.centerSection}>
        <TouchableOpacity  
          activeOpacity={1}  // esto desactiva el efecto por defecto de touchableOpacity. esto me sirve para yo poder contrarla manualmente transparencia 
          onPressIn={() => setPressed(true)}  // esto activa el efecto de presionar que se hunda el boton 
          onPressOut={() => setPressed(false)}  // esto lo que hace que el boton regrese a su estado normal 
          onPress={activarAlerta}  // desde aqui enpieza la logica de que el boton vibre
          style={[
            styles.botonAlerta,
            {
              transform: [{ scale: pressed ? 0.92 : 1 }],// Cambia el tamaño del botón
              opacity: pressed ? 0.85 : 1,// Cambia la transparencia
              shadowOffset: {
                width: 0,
                height: pressed ? 2 : 10,
              },
              shadowOpacity: pressed ? 0.2 : 0.5,
              elevation: pressed ? 4 : 12,
            }
          ]}
        >
          <Image
            source={require('../../../../assets/imagesAlertaMujer/ScInicio/boton2.png')}
            style={styles.imagen}
          />
        </TouchableOpacity>
        <Text style={styles.textoAlerta}>
          Presiona en caso de Emergencia
        </Text>
      </View>

    </View>
  );
}