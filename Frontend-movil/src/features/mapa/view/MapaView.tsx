import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation,useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../../navigation/types";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {Animated,FlatList,Image,Linking,Modal,Text,TouchableOpacity,TouchableWithoutFeedback,View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "../../../contexts/ThemeContext";
import { styles } from "../styles/MapaStyles";

type Coordenada = {
  latitude: number;
  longitude: number;
};

type MapaRouteParams = {
  direccionObjetivo?: string;
};

export default function MapaView() {
  const { theme } = useTheme();
  const route = useRoute();
  const navigation =
  useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const params = (route.params ?? {}) as MapaRouteParams;

  const [location, setLocation]                       = useState<Coordenada | null>(null);
  const [fullscreen, setFullscreen]                   = useState(false);
  const [showClose, setShowClose]                     = useState(false);
  const [historial, setHistorial]                     = useState<Coordenada[]>([]);
  const [intentosPermiso, setIntentosPermiso]         = useState(0);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const [destinoAlerta, setDestinoAlerta]             = useState<{
    direccion: string;
    coordenada: Coordenada;
  } | null>(null);

  const closeOpacity = useRef(new Animated.Value(0)).current;

  // ─── GEOLOCALIZAR DIRECCIÓN RECIBIDA POR PARÁMETRO ───────────────────────
  useEffect(() => {
    const direccion = params.direccionObjetivo?.trim();

    if (!direccion) {
      setDestinoAlerta(null);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const resultados = await Location.geocodeAsync(
          `${direccion}, Colombia`
        );

        if (!mounted) return;

        if (resultados.length > 0) {
          const { latitude, longitude } = resultados[0];
          setDestinoAlerta({
            direccion,
            coordenada: { latitude, longitude },
          });
        } else {
          setDestinoAlerta(null);
        }
      } catch {
        if (mounted) setDestinoAlerta(null);
      }
    })();

    return () => { mounted = false; };
  }, [params.direccionObjetivo]);

  // ─── FÓRMULA HAVERSINE — distancia entre dos coordenadas en metros ────────
  const getDistanceFromLatLonInMeters = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ) => {
    const R    = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ─── GPS PRINCIPAL — posición real, sin números aleatorios ───────────────
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let historialInterval: NodeJS.Timeout;

    const iniciarUbicacion = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        if (intentosPermiso === 0) { alert("Permiso denegado. Se recomienda activarlo."); return; }
        if (intentosPermiso === 1) { alert("Permiso denegado nuevamente."); return; }
        if (intentosPermiso >= 2) { alert("Activa el permiso desde configuración."); Linking.openSettings(); return; }
      }

      // POSICIÓN INICIAL REAL
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const firstLoc: Coordenada = {
        latitude:  currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(firstLoc);
      setUltimaActualizacion(new Date());
      // Una sola posición real como punto de partida
      setHistorial([firstLoc]);

      // WATCH POSITION — solo registra si se movió más de 10 metros
      subscription = await Location.watchPositionAsync(
        {
          accuracy:         Location.Accuracy.Balanced,
          timeInterval:     15000, // mínimo 15 segundos entre actualizaciones
          distanceInterval: 10,    // solo si se movió más de 10 metros
        },
        (loc) => {
          const newLoc: Coordenada = {
            latitude:  loc.coords.latitude,
            longitude: loc.coords.longitude,
          };

          setLocation(newLoc);
          setUltimaActualizacion(new Date());

          setHistorial((prev) => {
            const ultimo = prev[prev.length - 1];
            if (!ultimo) return [newLoc];

            const distancia = getDistanceFromLatLonInMeters(
              ultimo.latitude,  ultimo.longitude,
              newLoc.latitude,  newLoc.longitude
            );

            if (distancia >= 10) {
              // Máximo 20 items — evita que el array crezca infinito
              return [...prev, newLoc].slice(-20);
            }

            return prev;
          });
        }
      );

      // REFRESH AUTOMÁTICO CADA 60 SEGUNDOS
      // Solo actualiza posición visible, agrega al historial solo si hubo movimiento
      historialInterval = setInterval(async () => {
        try {
          const current = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          const newLoc: Coordenada = {
            latitude:  current.coords.latitude,
            longitude: current.coords.longitude,
          };

          setLocation(newLoc);
          setUltimaActualizacion(new Date());

          setHistorial((prev) => {
            const ultimo = prev[prev.length - 1];
            if (!ultimo) return [newLoc];

            const distancia = getDistanceFromLatLonInMeters(
              ultimo.latitude,  ultimo.longitude,
              newLoc.latitude,  newLoc.longitude
            );

            if (distancia >= 10) {
              return [...prev, newLoc].slice(-20);
            }

            return prev;
          });
        } catch (error) {
          console.error("Error en refresh automático:", error);
        }
      }, 60000);
    };

    iniciarUbicacion();

    return () => {
      if (subscription)      subscription.remove();
      if (historialInterval) clearInterval(historialInterval);
    };
  }, [intentosPermiso]);

  // ─── REFRESH MANUAL — solo actualiza posición, no reinicia el useEffect ──
  const refrescarUbicacion = async () => {
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLoc: Coordenada = {
        latitude:  current.coords.latitude,
        longitude: current.coords.longitude,
      };

      setLocation(newLoc);
      setUltimaActualizacion(new Date());

    } catch (error) {
      console.error("Error al refrescar ubicación:", error);
    }
  };

  // ─── BOTÓN CERRAR MAPA EN PANTALLA COMPLETA ───────────────────────────────
  const handleMapPress = () => {
    if (showClose) return;

    setShowClose(true);

    Animated.timing(closeOpacity, {
      toValue: 1, duration: 300, useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(closeOpacity, {
        toValue: 0, duration: 300, useNativeDriver: true,
      }).start(() => setShowClose(false));
    }, 15000);
  };

  // ─── FORMATEAR HORA ───────────────────────────────────────────────────────
  const formatearHora = (fecha: Date) =>
    fecha.toLocaleTimeString("es-CO", {
      hour:   "2-digit",
      minute: "2-digit",
    });

  // ─── ETIQUETAS DEL HISTORIAL ──────────────────────────────────────────────
  const formatearFechaHistorial = (index: number) => {
    if (index === 0) {
      return `Hoy, ${
        ultimaActualizacion ? formatearHora(ultimaActualizacion) : "--:--"
      }`;
    }
    if (index === 1) return "Hace unos minutos";
    return "Movimiento reciente";
  };

  // ─── PANTALLA DE CARGA ────────────────────────────────────────────────────
  if (!location) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <MaterialIcons name="location-searching" size={48} color="#7B1DB2" />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Obteniendo ubicación...
        </Text>
        <TouchableOpacity
          style={styles.botonReintentar}
          onPress={() => setIntentosPermiso((prev) => prev + 1)}
        >
          <Text style={styles.botonReintentarTexto}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const coordenadaCentro = destinoAlerta?.coordenada ?? location;

  // ─── BOTONES DE ACCIÓN ────────────────────────────────────────────────────
  const acciones = [
    {
      icono: "share",
      label: "Compartir",
      accion: () => {},
    },
    {
      icono: "refresh",
      label: "Actualizar",
      accion: refrescarUbicacion,
    },
    {
      icono: "navigation",
      label: "Navegar",
      accion: () => {},
    },
    {
      icono: "bookmark",
      label: "Guardar",
    
      accion: async () => {
    
        if (!location) return;
    
        try {
    
          // ✅ OBTENER DIRECCIÓN REAL
          const reverse = await Location.reverseGeocodeAsync({
            latitude: location.latitude,
            longitude: location.longitude,
          });
    
          const info = reverse[0];
    
          navigation.navigate("historialMapa", {

            ubicacion: {
          
              id: Date.now().toString(),
          
              latitude: location.latitude,
              longitude: location.longitude,
          
              direccion:
                `${info?.street || "Sin calle"} ${info?.streetNumber || ""}`,
          
              barrio:
                info?.district &&
                info?.district !== info?.city
                  ? info.district
                  : "Sector desconocido",
          
              municipio:
                info?.city ||
                info?.district ||
                "Municipio desconocido",
          
              ciudad:
                info?.city ||
                info?.subregion ||
                info?.district ||
                "Ciudad desconocida",
          
              departamento:
                info?.region ||
                "Departamento desconocido",
          
              pais:
                info?.country ||
                "País desconocido",
          
              fecha: new Date().toISOString(),
          
              estado: "Activo",
          
              precision: "Alta (±5m)",
          
              notas: "Ubicación guardada desde el mapa",
            },
          });
    
        } catch (error) {
    
          console.log("ERROR UBICACIÓN:", error);
    
          alert("No se pudo obtener la dirección");
    
        }
      },
    },
  ] as const;

  // ─── COMPONENTE DEL MAPA ──────────────────────────────────────────────────
  const mapComponent = (
    <MapView
      style={styles.map}
  
      initialRegion={{
        latitude: coordenadaCentro.latitude,
        longitude: coordenadaCentro.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
  
      // 👇 SOLO interactivo cuando está fullscreen
      scrollEnabled={fullscreen}
      zoomEnabled={fullscreen}
      rotateEnabled={fullscreen}
      pitchEnabled={fullscreen}
  
      onPress={
        fullscreen
          ? handleMapPress
          : () => setFullscreen(true)
      }
    >
      <Marker
        coordinate={location}
        title="Tu ubicación"
        pinColor="red"
      />
  
      {destinoAlerta && (
        <Marker
          coordinate={destinoAlerta.coordenada}
          title="Dirección de alerta"
          description={destinoAlerta.direccion}
          pinColor="#7B1DB2"
        />
      )}
  
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

  // Solo muestra los últimos 5 en las cards
  const historialItems = historial.slice().reverse().slice(0, 5);

  // ─── RENDER PRINCIPAL ─────────────────────────────────────────────────────
  return (
    <View style={[styles.contenedorPrincipal, { backgroundColor: theme.background }]}>

      <FlatList
        data={historialItems}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{ paddingBottom: 100 }}

        ListHeaderComponent={
          <View>
            {/* HEADER GRADIENTE */}
            <LinearGradient
              colors={[theme.headercolor1, theme.headercolor2]}
              start={{ x: 1, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradiente}
            >
              <View style={styles.headerContenido}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tituloHeader}>Tu ubicación</Text>
                  <Text style={styles.SubtituloHeader}>
                    Aquí se muestra tu ubicación actual
                  </Text>
                  <View style={styles.filaUbicacion}>
                    <MaterialIcons
                      name="place"
                      size={14}
                      color="rgba(255,255,255,0.9)"
                    />
                    <Text style={styles.subtituloHeader}>
                      {location
                        ? `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`
                        : "Obteniendo..."}
                    </Text>
                  </View>
                </View>
                <Image
                  source={require("../../../../assets/imagesAlertaMujer/ScMapa/iconoUbi.png")}
                  style={{ width: 100, height: 85, resizeMode: "cover" }}
                />
              </View>
            </LinearGradient>

            {/* MAPA */}
            <View style={styles.contenedorMapa}>
              {mapComponent}
            </View>

            {/* BOTONES DE ACCIÓN */}
            <View style={styles.filaBotones}>
              {acciones.map((a) => (
                <TouchableOpacity
                  key={a.label}
                  style={styles.botonAccion}
                  onPress={a.accion}
                >
                  <View style={styles.circuloBoton}>
                    <MaterialIcons name={a.icono} size={22} color="#7B1DB2" />
                  </View>
                  <Text style={[styles.labelBoton, { color: theme.text }]}>
                    {a.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* TARJETA COORDENADAS */}
            <View style={[styles.tarjetaCoordenadas, { backgroundColor: theme.card }]}>
              <View style={{ flexDirection: "row" }}>
                <View style={styles.columnaCoord}>
                  <Text style={[styles.labelCoord, { color: theme.contactSubtext }]}>
                    Latitud
                  </Text>
                  <Text style={[styles.valorCoord, { color: theme.text }]}>
                    {location.latitude.toFixed(5)}
                  </Text>
                </View>
                <View style={styles.columnaCoord}>
                  <Text style={[styles.labelCoord, { color: theme.contactSubtext }]}>
                    Longitud
                  </Text>
                  <Text style={[styles.valorCoord, { color: theme.text }]}>
                    {location.longitude.toFixed(5)}
                  </Text>
                </View>
              </View>

              <View style={styles.filaActivo}>
                <Text style={[styles.textoActualizacion, { color: theme.contactSubtext }]}>
                  Última actualización:{" "}
                  {ultimaActualizacion
                    ? `Hoy, ${formatearHora(ultimaActualizacion)}`
                    : "--"}
                </Text>
                <View style={styles.badgeActivo}>
                  <View style={styles.puntoActivo} />
                  <Text style={styles.textoActivo}>Activo</Text>
                </View>
              </View>
            </View>

            {/* TÍTULO HISTORIAL */}
            <View style={styles.filaTituloHistorial}>
              <Text style={[styles.tituloHistorial, { color: theme.text }]}>
                Historial reciente
              </Text>
              <TouchableOpacity>
                <Text style={styles.verTodo}>Ver todo &gt;</Text>
              </TouchableOpacity>
            </View>
          </View>
        }

        renderItem={({ item, index }) => (

  <TouchableOpacity
    style={[
      styles.itemHistorial,
      {
        backgroundColor: theme.card,
      },
    ]}

    onPress={async () => {

      try {

        // ✅ OBTENER DIRECCIÓN REAL
        const reverse = await Location.reverseGeocodeAsync({
          latitude: item.latitude,
          longitude: item.longitude,
        });

        const info = reverse[0];

        navigation.navigate("historialMapa", {

          ubicacion: {
        
            id: Date.now().toString(),
        
            latitude: location.latitude,
            longitude: location.longitude,
        
            direccion:
              `${info?.street || "Sin calle"} ${info?.streetNumber || ""}`,
        
            barrio:
              info?.district &&
              info?.district !== info?.city
                ? info.district
                : "Sector desconocido",
        
            municipio:
              info?.city ||
              info?.district ||
              "Municipio desconocido",
        
            ciudad:
              info?.city ||
              info?.subregion ||
              info?.district ||
              "Ciudad desconocida",
        
            departamento:
              info?.region ||
              "Departamento desconocido",
        
            pais:
              info?.country ||
              "País desconocido",
        
            fecha: new Date().toISOString(),
        
            estado: "Activo",
        
            precision: "Alta (±5m)",
        
            notas: "Ubicación guardada desde el mapa",
          },
        });

      } catch (error) {

        console.log(error);

        alert("No se pudo abrir la ubicación");

      }
    }}
  >

    <View style={styles.numeroBurbuja}>
      <Text style={styles.numeroTexto}>
        {index + 1}
      </Text>
    </View>

    <View style={{ flex: 1 }}>

      <Text
        style={[
          styles.fechaItem,
          { color: theme.text },
        ]}
      >
        {formatearFechaHistorial(index)}
      </Text>

      <Text
        style={[
          styles.coordItem,
          {
            color: theme.contactSubtext,
          },
        ]}
      >
        {item.latitude.toFixed(5)},
        {" "}
        {item.longitude.toFixed(5)}
      </Text>

    </View>

    <MaterialIcons
      name="chevron-right"
      size={20}
      color={theme.contactSubtext}
    />

  </TouchableOpacity>
)}

        ListEmptyComponent={
          <View style={styles.sinHistorial}>
            <Text style={[styles.textoSinHistorial, { color: theme.contactSubtext }]}>
              Sin historial aún.
            </Text>
          </View>
        }
      />

      {/* MODAL PANTALLA COMPLETA */}
      <Modal visible={fullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          {mapComponent}
          {showClose && (
            <Animated.View style={[styles.botonCerrarMapa, { opacity: closeOpacity }]}>
              <TouchableWithoutFeedback onPress={() => setFullscreen(false)}>
                <Text style={styles.textoCerrar}>Cerrar mapa</Text>
              </TouchableWithoutFeedback>
            </Animated.View>
          )}
        </View>
      </Modal>

    </View>
  );
}