import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { styles } from "../styles/ZonasAuxiliares.style";

type ZonaAuxiliar = {
  id: string;
  nombre: string;
  tipo: "segura" | "riesgo" | "asistencia" | "policia";
  coordenada: {
    latitude: number;
    longitude: number;
  };
  direccion: string;
  distancia?: number;
};

export default function ZonasAuxiliares() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<any>();

  const [fullscreen, setFullscreen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ZonaAuxiliar | null>(null);

  // Datos de ejemplo de zonas auxiliares
  const zonasAuxiliares: ZonaAuxiliar[] = [
    {
      id: "1",
      nombre: "CAI Centro",
      tipo: "policia",
      coordenada: { latitude: 2.962828, longitude: -75.2855952 },
      direccion: "Calle 5 #10-20",
      distancia: 350,
    },
    {
      id: "2",
      nombre: "Estación de Policía Norte",
      tipo: "policia",
      coordenada: { latitude: 2.965, longitude: -75.28 },
      direccion: "Carrera 8 #15-30",
      distancia: 520,
    },
    {
      id: "3",
      nombre: "Punto de Asistencia Mujer",
      tipo: "asistencia",
      coordenada: { latitude: 2.96, longitude: -75.29 },
      direccion: "Calle 3 #8-15",
      distancia: 280,
    },
    {
      id: "4",
      nombre: "Zona Segura Comercial",
      tipo: "segura",
      coordenada: { latitude: 2.958, longitude: -75.288 },
      direccion: "Carrera 10 #5-40",
      distancia: 410,
    },
    {
      id: "5",
      nombre: "Zona de Alto Riesgo",
      tipo: "riesgo",
      coordenada: { latitude: 2.967, longitude: -75.275 },
      direccion: "Calle 7 #12-50",
      distancia: 620,
    },
  ];

  const getZoneColor = (tipo: string) => {
    switch (tipo) {
      case "segura":
        return "#27AE60";
      case "riesgo":
        return "#E74C3C";
      case "asistencia":
        return "#3498DB";
      case "policia":
        return "#9B59B6";
      default:
        return "#7B1DB2";
    }
  };

  const getZoneIcon = (tipo: string) => {
    switch (tipo) {
      case "segura":
        return "verified-user";
      case "riesgo":
        return "warning";
      case "asistencia":
        return "medical-services";
      case "policia":
        return "local-police";
      default:
        return "location-on";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* HEADER */}
        <LinearGradient
          colors={[theme.headercolor1, theme.headercolor2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{t.mapa.zonas_auxiliares}</Text>
            <Text style={styles.headerSubtitle}>
              {t.mapa.zonas_auxiliares_desc}
            </Text>
          </View>
        </LinearGradient>

        {/* MAPA */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 2.962828,
              longitude: -75.2855952,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            {zonasAuxiliares.map((zona) => (
              <Marker
                key={zona.id}
                coordinate={zona.coordenada}
                title={zona.nombre}
                description={zona.direccion}
                pinColor={getZoneColor(zona.tipo)}
              />
            ))}
          </MapView>

          <TouchableOpacity
            style={styles.openMapButton}
            onPress={() => setFullscreen(true)}
          >
            <MaterialIcons name="open-in-full" size={18} color="#fff" />
            <Text style={styles.openMapText}>{t.mapa.abrir_mapa_completo}</Text>
          </TouchableOpacity>
        </View>

        {/* LEYENDA */}
        <View style={[styles.legendContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.legendTitle, { color: theme.text }]}>
            {t.mapa.leyenda}
          </Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#27AE60" }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>
                {t.mapa.zona_segura}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#E74C3C" }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>
                {t.mapa.zona_riesgo}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#3498DB" }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>
                {t.mapa.punto_asistencia}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#9B59B6" }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>
                {t.mapa.policia}
              </Text>
            </View>
          </View>
        </View>

        {/* LISTA DE ZONAS */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t.mapa.zonas_cercanas}
        </Text>

        {zonasAuxiliares.map((zona) => (
          <TouchableOpacity
            key={zona.id}
            style={[styles.zoneCard, { backgroundColor: theme.card }]}
            onPress={() => setSelectedZone(zona)}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.zoneIcon,
                { backgroundColor: getZoneColor(zona.tipo) + "20" },
              ]}
            >
              <MaterialIcons
                name={getZoneIcon(zona.tipo) as any}
                size={24}
                color={getZoneColor(zona.tipo)}
              />
            </View>

            <View style={styles.zoneInfo}>
              <Text style={[styles.zoneName, { color: theme.text }]}>
                {zona.nombre}
              </Text>
              <Text style={[styles.zoneAddress, { color: theme.contactSubtext }]}>
                {zona.direccion}
              </Text>
              <View style={styles.zoneMeta}>
                <MaterialIcons
                  name="directions-walk"
                  size={14}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.zoneDistance, { color: theme.contactSubtext }]}>
                  {zona.distancia}m
                </Text>
              </View>
            </View>

            <MaterialIcons
              name="chevron-right"
              size={20}
              color={theme.contactSubtext}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* MODAL DETALLE */}
      <Modal visible={!!selectedZone} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setSelectedZone(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                {selectedZone && (
                  <>
                    <View style={styles.modalHeader}>
                      <View
                        style={[
                          styles.modalIcon,
                          { backgroundColor: getZoneColor(selectedZone.tipo) + "20" },
                        ]}
                      >
                        <MaterialIcons
                          name={getZoneIcon(selectedZone.tipo) as any}
                          size={32}
                          color={getZoneColor(selectedZone.tipo)}
                        />
                      </View>
                      <Text style={[styles.modalTitle, { color: theme.text }]}>
                        {selectedZone.nombre}
                      </Text>
                    </View>

                    <View style={styles.modalBody}>
                      <InfoRow
                        icon="place"
                        label={t.mapa.direccion}
                        value={selectedZone.direccion}
                        theme={theme}
                      />
                      <InfoRow
                        icon="category"
                        label={t.mapa.tipo}
                        value={t.mapa[`zona_${selectedZone.tipo}`] || selectedZone.tipo}
                        theme={theme}
                      />
                      <InfoRow
                        icon="directions-walk"
                        label={t.mapa.distancia}
                        value={`${selectedZone.distancia}m`}
                        theme={theme}
                      />
                      <InfoRow
                        icon="my-location"
                        label={t.mapa.latitud}
                        value={selectedZone.coordenada.latitude.toFixed(5)}
                        theme={theme}
                      />
                      <InfoRow
                        icon="location-on"
                        label={t.mapa.longitud}
                        value={selectedZone.coordenada.longitude.toFixed(5)}
                        theme={theme}
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setSelectedZone(null)}
                    >
                      <Text style={styles.modalCloseText}>{t.mapa.cerrar}</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL MAPA COMPLETO */}
      <Modal visible={fullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 2.962828,
              longitude: -75.2855952,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {zonasAuxiliares.map((zona) => (
              <Marker
                key={zona.id}
                coordinate={zona.coordenada}
                title={zona.nombre}
                description={zona.direccion}
                pinColor={getZoneColor(zona.tipo)}
              />
            ))}
          </MapView>

          <TouchableOpacity
            style={styles.fullscreenCloseButton}
            onPress={() => setFullscreen(false)}
          >
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

type InfoRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  theme: any;
};

function InfoRow({ icon, label, value, theme }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={20} color="#7B1DB2" />
      <Text style={[styles.infoLabel, { color: theme.contactSubtext }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}
