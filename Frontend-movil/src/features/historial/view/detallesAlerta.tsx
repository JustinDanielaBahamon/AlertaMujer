import { Feather, MaterialIcons } from "@expo/vector-icons";
import { NavigationProp, ParamListBase, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline } from "../../../components/mapa/MapaLibre";
import { COLOR_PUNTO_A, COLOR_PUNTO_B } from "../../mapa/coloresRecorrido";
import { useDetalleAlertaViewModel, type PasoAlerta } from "../viewModel/useDetalleAlertaViewModel";
import ContactosNotificadosModal, { ESTADOS, ICONO_CANAL } from "./ContactosNotificadosModal";
import { useTheme } from "../../../../src/contexts/ThemeContext";
import { useLocale } from "../../../../src/contexts/LocaleContext";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";
import type { MainStackParamList } from "../../../navigation/types";
import { createStyles } from "../style/detalle.Style";
import { getAsistenciaColors, getEmergenciaColors } from "../style/historial.style";

type DetalleAlertaRouteProp = RouteProp<MainStackParamList, "DetalleAlerta">;
type Coordenada = { latitude: number; longitude: number };

const ICONO_PASO: Record<PasoAlerta["icono"], keyof typeof MaterialIcons.glyphMap> = {
  alerta: "notifications-active",
  ubicacion: "my-location",
  fin: "check",
  curso: "radio-button-checked",
};

const COLOR_PASO: Record<PasoAlerta["icono"], string> = {
  alerta: COLOR_PUNTO_B,
  ubicacion: "#9333EA",
  fin: COLOR_PUNTO_A,
  curso: COLOR_PUNTO_B,
};

export default function DetalleAlerta() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<DetalleAlertaRouteProp>();
  const { alerta } = route.params;
  const {
    esEmergencia, compartiendo, compartirReporte, contactosNotificados, cargandoContactos, errorContactos,
    puntos, cargandoDetalle, direccion, metodo, mensaje, pasos,
  } = useDetalleAlertaViewModel(alerta);
  const recorrido = useMemo(() => puntos.map((p) => ({ latitude: p.latitude, longitude: p.longitude })), [puntos]);
  const mapaRef = useRef<MapView>(null);
  const [mapaListo, setMapaListo] = useState(false);
  const [verNotificados, setVerNotificados] = useState(false);
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
        // Si la alerta ya tiene coordenadas del backend, usarlas directamente
        if (recorrido.length > 0) {
          setCoordenadaAlerta(recorrido[0]);
          if (mounted) setCargandoMapa(false);
          return;
        }
        if (alerta.coords) {
          setCoordenadaAlerta(alerta.coords);
          if (mounted) setCargandoMapa(false);
          return;
        }

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
  }, [alerta.ubicacion, alerta.coords, recorrido]);

  // Encuadra todo el recorrido en el mapa pequeño
  useEffect(() => {
    if (!mapaListo || recorrido.length < 2) return;
    mapaRef.current?.fitToCoordinates(recorrido, {
      edgePadding: { top: 40, right: 40, bottom: 60, left: 40 },
      animated: false,
    });
  }, [mapaListo, recorrido]);

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
                <Text style={{ color: "white", fontSize: 25, fontWeight: "800" }}>{t.detalle.titulo}</Text>
                <Text style={{ color: "white", fontSize: 13, opacity: 0.8 }}>
                  {t.detalle.subtitulo}
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
          {/* RESUMEN */}
          <View style={styles.TarjetaResumen}>
            <View style={[styles.IconoResumen, { backgroundColor: alertColors.iconBg }]}>
              <MaterialIcons name={esEmergencia ? "warning" : "medical-services"} size={22} color={alertColors.iconTint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ResumenTipo}>{alerta.tipo}</Text>
              <View style={styles.ResumenFilaMeta}>
                <MaterialIcons name="access-time" size={14} color={theme.contactSubtext} />
                <Text style={styles.ResumenMetaTexto}>
                  {alerta.fecha} · {alerta.hora}
                </Text>
              </View>
              {!!direccion && (
                <View style={styles.ResumenFilaMeta}>
                  <MaterialIcons name="place" size={14} color={theme.contactSubtext} />
                  <Text style={styles.ResumenMetaTexto} numberOfLines={2}>{direccion}</Text>
                </View>
              )}
              {!!metodo && (
                <View style={[extra.chip, { backgroundColor: `${theme.contactAccent}1A` }]}>
                  <MaterialIcons name="bolt" size={13} color={theme.contactAccent} />
                  <Text style={[extra.chipTexto, { color: theme.contactAccent }]}>{metodo}</Text>
                </View>
              )}
            </View>
            <View style={[styles.BadgeResumenEstado, { backgroundColor: alertColors.badgeBg }]}>
              <Text style={[styles.BadgeResumenEstadoTexto, { color: alertColors.badgeText }]}>
                {alerta.estado.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* MAPA CON EL RECORRIDO */}
          <View style={styles.TarjetaMapa}>
            {coordenadaAlerta ? (
              <MapView
                ref={mapaRef}
                style={styles.MapaFondo}
                initialRegion={{
                  latitude: coordenadaAlerta.latitude,
                  longitude: coordenadaAlerta.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                onMapReady={() => setMapaListo(true)}
                pointerEvents="none"
              >
                {recorrido.length > 1 && (
                  <Polyline coordinates={recorrido} strokeWidth={4} strokeColor={COLOR_PUNTO_A} />
                )}
                <Marker coordinate={recorrido[0] ?? coordenadaAlerta} title="Inicio" pinColor={COLOR_PUNTO_A} />
                {recorrido.length > 1 && (
                  <Marker coordinate={recorrido[recorrido.length - 1]} title="Última ubicación" pinColor={COLOR_PUNTO_B} />
                )}
              </MapView>
            ) : (
              <LinearGradient
                colors={theme.mode === "dark" ? ["#2a1446", "#160a29"] : ["#efe3ff", "#dcc6fb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.MapaFondo, { alignItems: "center", justifyContent: "center" }]}
              >
                {cargandoMapa || cargandoDetalle ? (
                  <ActivityIndicator size="small" color={theme.contactAccent} />
                ) : (
                  <Text style={{ color: theme.text, fontSize: 13, fontWeight: "600", textAlign: "center" }}>
                    {t.detalle.no_pudo_cargar_mapa}
                  </Text>
                )}
              </LinearGradient>
            )}

            <Pressable onPress={abrirMapaCompleto} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />

            {coordenadaAlerta && (
              <View style={extra.mapaPie}>
                <TouchableOpacity style={extra.mapaBoton} onPress={abrirMapaCompleto}>
                  <MaterialIcons name="open-in-full" size={14} color="white" />
                  <Text style={extra.mapaBotonTexto}>
                    {recorrido.length > 1 ? `Ver recorrido (${recorrido.length} puntos)` : t.detalle.ver_mapa}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* LÍNEA DE TIEMPO */}
          {pasos.length > 0 && (
            <>
              <Text style={styles.SeccionTitulo}>Qué pasó</Text>
              <View style={[extra.tarjeta, { backgroundColor: theme.containerBackground }]}>
                {pasos.map((paso, i) => (
                  <View key={paso.titulo} style={extra.paso}>
                    <View style={extra.pasoGuia}>
                      <View style={[extra.pasoPunto, { backgroundColor: COLOR_PASO[paso.icono] }]}>
                        <MaterialIcons name={ICONO_PASO[paso.icono]} size={14} color="white" />
                      </View>
                      {i < pasos.length - 1 && <View style={[extra.pasoLinea, { backgroundColor: `${theme.contactAccent}40` }]} />}
                    </View>
                    <View style={extra.pasoTexto}>
                      <Text style={[extra.pasoTitulo, { color: theme.text }]}>{paso.titulo}</Text>
                      <Text style={[extra.pasoDetalle, { color: theme.contactSubtext }]}>{paso.detalle}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* CONTACTOS AVISADOS */}
          <View style={extra.seccionFila}>
            <Text style={styles.SeccionTitulo}>{t.detalle.notificados_titulo}</Text>
            {contactosNotificados.length > 0 && (
              <TouchableOpacity onPress={() => setVerNotificados(true)}>
                <Text style={[extra.verTodo, { color: theme.contactAccent }]}>Ver detalle</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={[extra.tarjeta, { backgroundColor: theme.containerBackground }]}>
            {cargandoContactos ? (
              <ActivityIndicator size="small" color={theme.contactAccent} />
            ) : errorContactos ? (
              <Text style={[extra.pasoDetalle, { color: theme.contactSubtext }]}>{t.detalle.notificados_error}</Text>
            ) : contactosNotificados.length === 0 ? (
              <Text style={[extra.pasoDetalle, { color: theme.contactSubtext }]}>{t.detalle.notificados_vacio}</Text>
            ) : (
              contactosNotificados.map((c) => (
                <TouchableOpacity key={String(c.contactId)} style={extra.contacto} onPress={() => setVerNotificados(true)}>
                  <View style={[extra.avatar, { backgroundColor: `${theme.contactAccent}1A` }]}>
                    <Text style={[extra.avatarTexto, { color: theme.contactAccent }]}>
                      {(c.name || "?").trim().charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[extra.pasoTitulo, { color: theme.text }]} numberOfLines={1}>{c.name}</Text>
                    {!!c.relationship && (
                      <Text style={[extra.pasoDetalle, { color: theme.contactSubtext }]}>{c.relationship}</Text>
                    )}
                  </View>
                  <View style={extra.canales}>
                    {c.channels.map((canal) => {
                      const estado = ESTADOS[canal.status] ?? ESTADOS.pending;
                      return (
                        <View
                          key={canal.channel}
                          style={[extra.canal, { backgroundColor: `${estado.color}1A`, borderColor: estado.color }]}
                        >
                          <MaterialIcons name={ICONO_CANAL[canal.channel] ?? "chat"} size={13} color={estado.color} />
                          <MaterialIcons name={estado.icono} size={13} color={estado.color} />
                        </View>
                      );
                    })}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* NOTA DE LA ALERTA */}
          {!!mensaje && (
            <View style={styles.TarjetaDescripcion}>
              <Text style={styles.DescripcionTitulo}>{t.detalle.descripcion}</Text>
              <Text style={styles.DescripcionTexto}>{mensaje}</Text>
            </View>
          )}
        </View>
        <View style={styles.Footer}>
            <Text style={styles.SeccionTitulo}>{t.detalle.acciones_rapidas}</Text>
            <View style={styles.FilaAcciones}>
              <TouchableOpacity style={styles.AccionItem} onPress={compartirReporte} disabled={compartiendo}>
                <View style={styles.AccionCirculo}>
                  <Feather name="share-2" size={18} color={theme.contactAccent} />
                </View>
                <Text style={styles.AccionTexto}>{compartiendo ? t.detalle.enviando : t.detalle.compartir}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.AccionItem} onPress={irAMapaInterno}>
                <View style={styles.AccionCirculo}>
                  <Feather name="navigation" size={18} color={theme.contactAccent} />
                </View>
                <Text style={styles.AccionTexto}>{t.detalle.navegar}</Text>
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
              {recorrido.length > 1 && (
                <Polyline coordinates={recorrido} strokeWidth={4} strokeColor={COLOR_PUNTO_A} />
              )}
              <Marker coordinate={recorrido[0] ?? coordenadaAlerta} title="Inicio" pinColor={COLOR_PUNTO_A} />
              {recorrido.length > 1 && (
                <Marker coordinate={recorrido[recorrido.length - 1]} title="Última ubicación" pinColor={COLOR_PUNTO_B} />
              )}
            </MapView>
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: theme.text }}>{t.detalle.no_pudo_cargar_mapa_punto}</Text>
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
            <Text style={{ color: "white", fontWeight: "700" }}>{t.detalle.cerrar_mapa}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <ContactosNotificadosModal
        visible={verNotificados}
        onCerrar={() => setVerNotificados(false)}
        contactos={contactosNotificados}
        cargando={cargandoContactos}
        error={errorContactos}
      />
    </>
  );
}

const extra = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  chipTexto: { fontSize: 12, fontWeight: "700" },
  mapaPie: { position: "absolute", left: 12, right: 12, bottom: 12, flexDirection: "row" },
  mapaBoton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(76, 29, 149, 0.85)",
  },
  mapaBotonTexto: { color: "white", fontSize: 12, fontWeight: "700" },
  tarjeta: { borderRadius: 18, padding: 16, marginBottom: 18, gap: 4 },
  paso: { flexDirection: "row", minHeight: 52 },
  pasoGuia: { width: 28, alignItems: "center" },
  pasoPunto: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  pasoLinea: { flex: 1, width: 2, marginVertical: 2 },
  pasoTexto: { flex: 1, paddingLeft: 10, paddingBottom: 10 },
  pasoTitulo: { fontSize: 14, fontWeight: "700" },
  pasoDetalle: { fontSize: 12, marginTop: 2 },
  seccionFila: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  verTodo: { fontSize: 13, fontWeight: "700", marginBottom: 10 },
  contacto: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarTexto: { fontSize: 15, fontWeight: "800" },
  canales: { flexDirection: "row", gap: 6 },
  canal: { flexDirection: "row", gap: 2, borderWidth: 1, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3 },
});
