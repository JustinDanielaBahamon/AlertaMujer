import { Feather, MaterialIcons } from "@expo/vector-icons";
import { NavigationProp, ParamListBase, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useDetalleAlertaViewModel } from "../viewModel/useDetalleAlertaViewModel";
import { useTheme } from "../../../../src/contexts/ThemeContext";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";
import type { MainStackParamList } from "../../../navigation/types";
import { createStyles } from "../style/detalle.Style";
import { getAsistenciaColors, getEmergenciaColors } from "../style/historial.style";

type DetalleAlertaRouteProp = RouteProp<MainStackParamList, "DetalleAlerta">;
type Coordenada = { latitude: number; longitude: number };

export default function DetalleAlerta() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<DetalleAlertaRouteProp>();
  const { alerta } = route.params;
  const { esEmergencia, compartiendo, compartirReporte } = useDetalleAlertaViewModel(alerta);
  const [coordenadaAlerta, setCoordenadaAlerta] = useState<Coordenada | null>(null);
  const [cargandoMapa, setCargandoMapa] = useState(true);
  const [mapaPantallaCompleta, setMapaPantallaCompleta] = useState(false);

  const emergencyColors = useMemo(() => getEmergenciaColors(theme), [theme]);
  const assistanceColors = useMemo(() => getAsistenciaColors(theme), [theme]);
  const alertColors = esEmergencia ? emergencyColors : assistanceColors;

  const irAMapaInterno = () => {
    const main = getMainStackNavigation(navigation);
    main?.navigate("DrawerHome", {
      screen: "Inicio",
      params: {
        screen: "Mapa",
        params: { direccionObjetivo: alerta.ubicacion },
      },
    } as never);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const direccion = alerta.ubicacion?.trim();
        if (!direccion) {
          if (mounted) setCoordenadaAlerta(null);
          return;
        }
        const resultados = await Location.geocodeAsync(`${direccion}, Colombia`);
        if (!mounted) return;
        if (resultados.length > 0) {
          const { latitude, longitude } = resultados[0];
          setCoordenadaAlerta({ latitude, longitude });
        } else {
          setCoordenadaAlerta(null);
        }
      } catch {
        if (mounted) setCoordenadaAlerta(null);
      } finally {
        if (mounted) setCargandoMapa(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [alerta.ubicacion]);

  const accionLlamar = () => Alert.alert("Llamar", "Esta accion estara disponible pronto.");
  const accionReportar = () => Alert.alert("Reportar", "Gracias, pronto podras enviar reportes desde aqui.");
  const abrirMapaCompleto = () => coordenadaAlerta && setMapaPantallaCompleta(true);

  return (
    <>
      <ScrollView
        style={styles.ContenedorPrincipal}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <LinearGradient
          colors={[theme.headercolor1, theme.headercolor2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.Gradiente}
        >
          <TouchableOpacity style={styles.BotonVolver} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={22} color="white" />
          </TouchableOpacity>

          <View style={styles.HeaderContenido}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "white", fontSize: 25, fontWeight: "800" }}>Detalle de la alerta</Text>
                <Text style={{ color: "white", fontSize: 13, opacity: 0.8 }}>
                  Informacion completa del evento y la ubicacion registrada.
                </Text>
              </View>
              <Image
                source={require("@assets/imagesAlertaMujer/ScHistorial/alertaDTLL.png")}
                style={{ width: 90, height: 69, resizeMode: "cover" }}
              />
            </View>
          </View>
        </LinearGradient>

        <View style={styles.Cuerpo}>
          <View style={styles.TarjetaResumen}>
            <View style={[styles.IconoResumen, { backgroundColor: alertColors.iconBg }]}>
              <MaterialIcons name="place" size={22} color={alertColors.iconTint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ResumenTipo}>{alerta.tipo}</Text>
              <View style={styles.ResumenFilaMeta}>
                <MaterialIcons name="access-time" size={14} color={theme.contactSubtext} />
                <Text style={styles.ResumenMetaTexto}>
                  {alerta.fecha} - {alerta.hora}
                </Text>
              </View>
              <View style={styles.ResumenFilaMeta}>
                <MaterialIcons name="place" size={14} color={theme.contactSubtext} />
                <Text style={styles.ResumenMetaTexto}>{alerta.ubicacion}</Text>
              </View>
            </View>
            <View style={[styles.BadgeResumenEstado, { backgroundColor: alertColors.badgeBg }]}>
              <Text style={[styles.BadgeResumenEstadoTexto, { color: alertColors.badgeText }]}>
                {alerta.estado.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.TarjetaMapa}>
            {coordenadaAlerta ? (
              <MapView
                style={styles.MapaFondo}
                region={{
                  latitude: coordenadaAlerta.latitude,
                  longitude: coordenadaAlerta.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                pointerEvents="none"
              >
                <Marker coordinate={coordenadaAlerta} title={alerta.ubicacion} pinColor="#E53935" />
              </MapView>
            ) : (
              <LinearGradient
                colors={theme.mode === "dark" ? ["#1f2e4f", "#141d34"] : ["#cde6ff", "#b3d8fc"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.MapaFondo}
              >
                {cargandoMapa ? (
                  <ActivityIndicator size="small" color={theme.contactAccent} />
                ) : (
                  <Text style={{ color: theme.text, fontSize: 13, fontWeight: "600", textAlign: "center", marginTop: 100 }}>
                    No se pudo cargar el mapa
                  </Text>
                )}
              </LinearGradient>
            )}

            <Pressable onPress={abrirMapaCompleto} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />

            <View
              style={{
                position: "absolute",
                left: 12,
                right: 12,
                bottom: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: "rgba(17, 24, 39, 0.65)",
                }}
                onPress={irAMapaInterno}
              >
                <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Ver mapa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.BotonCentroMapa} onPress={irAMapaInterno}>
                <MaterialIcons name="my-location" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.SeccionTitulo}>Informacion</Text>
          <View style={styles.GridInformacion}>
            <View style={styles.InfoCard}>
              <View style={styles.InfoHeader}>
                <MaterialIcons name="event" size={18} color={theme.contactAccent} />
                <Text style={styles.InfoLabel}>Fecha</Text>
              </View>
              <Text style={styles.InfoValue}>{alerta.fecha}</Text>
            </View>
            <View style={styles.InfoCard}>
              <View style={styles.InfoHeader}>
                <MaterialIcons name="schedule" size={18} color={theme.contactAccent} />
                <Text style={styles.InfoLabel}>Hora</Text>
              </View>
              <Text style={styles.InfoValue}>{alerta.hora}</Text>
            </View>
            <View style={styles.InfoCard}>
              <View style={styles.InfoHeader}>
                <MaterialIcons name="near-me" size={18} color={theme.contactAccent} />
                <Text style={styles.InfoLabel}>Estado</Text>
              </View>
              <Text style={styles.InfoValue}>{alerta.estado}</Text>
            </View>
            <View style={styles.InfoCard}>
              <View style={styles.InfoHeader}>
                <MaterialIcons name="groups" size={18} color={theme.contactAccent} />
                <Text style={styles.InfoLabel}>Contactos</Text>
              </View>
              <Text style={styles.InfoValue}>3 notificados</Text>
            </View>
          </View>

          <View style={styles.TarjetaDescripcion}>
            <Text style={styles.DescripcionTitulo}>Descripcion</Text>
            <Text style={styles.DescripcionTexto}>Emergencia activada por la usuaria.</Text>
          </View>
        </View>
        <View style={styles.Footer}>
            <Text style={styles.SeccionTitulo}>Acciones rapidas</Text>
            <View style={styles.FilaAcciones}>
              <TouchableOpacity style={styles.AccionItem} onPress={compartirReporte} disabled={compartiendo}>
                <View style={styles.AccionCirculo}>
                  <Feather name="share-2" size={18} color={theme.contactAccent} />
                </View>
                <Text style={styles.AccionTexto}>{compartiendo ? "Enviando..." : "Compartir"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.AccionItem} onPress={irAMapaInterno}>
                <View style={styles.AccionCirculo}>
                  <Feather name="navigation" size={18} color={theme.contactAccent} />
                </View>
                <Text style={styles.AccionTexto}>Navegar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.AccionItem} onPress={accionLlamar}>
                <View style={styles.AccionCirculo}>
                  <Feather name="phone" size={18} color={theme.contactAccent} />
                </View>
                <Text style={styles.AccionTexto}>Llamar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.AccionItem} onPress={accionReportar}>
                <View style={styles.AccionCirculo}>
                  <MaterialIcons name="warning-amber" size={20} color={theme.contactAccent} />
                </View>
                <Text style={styles.AccionTexto}>Reportar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.SeparadorFinal} />
          </View>
      </ScrollView>

      <Modal visible={mapaPantallaCompleta} animationType="slide" onRequestClose={() => setMapaPantallaCompleta(false)}>
        <View style={{ flex: 1, backgroundColor: theme.background }}>
          {coordenadaAlerta ? (
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: coordenadaAlerta.latitude,
                longitude: coordenadaAlerta.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={coordenadaAlerta} title={alerta.ubicacion} pinColor="#E53935" />
            </MapView>
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: theme.text }}>No se pudo cargar el mapa.</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => setMapaPantallaCompleta(false)}
            style={{
              position: "absolute",
              top: 50,
              right: 16,
              backgroundColor: "rgba(17, 24, 39, 0.75)",
              borderRadius: 24,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>Cerrar mapa</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}
