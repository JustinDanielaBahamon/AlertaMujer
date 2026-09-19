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
import { styles } from "../styles/HistorialRecorridos.style";

type HistorialItem = {
  id: string;
  fecha: string;
  hora: string;
  direccion: string;
  barrio: string;
  municipio: string;
  departamento: string;
  pais: string;
  coordenada: {
    latitude: number;
    longitude: number;
  };
  precision: string;
};

export default function HistorialRecorridos() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<any>();

  const [fullscreen, setFullscreen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistorialItem | null>(null);

  // Datos de ejemplo del historial de recorridos
  const historialRecorridos: HistorialItem[] = [
    {
      id: "1",
      fecha: "2024-01-15",
      hora: "14:30",
      direccion: "Calle 10 #5-20",
      barrio: "Centro",
      municipio: "Neiva",
      departamento: "Huila",
      pais: "Colombia",
      coordenada: { latitude: 2.962828, longitude: -75.2855952 },
      precision: "Alta (±5m)",
    },
    {
      id: "2",
      fecha: "2024-01-15",
      hora: "12:15",
      direccion: "Carrera 8 #15-30",
      barrio: "Santa Inés",
      municipio: "Neiva",
      departamento: "Huila",
      pais: "Colombia",
      coordenada: { latitude: 2.965, longitude: -75.28 },
      precision: "Alta (±5m)",
    },
    {
      id: "3",
      fecha: "2024-01-14",
      hora: "18:45",
      direccion: "Calle 3 #8-15",
      barrio: "La Libertad",
      municipio: "Neiva",
      departamento: "Huila",
      pais: "Colombia",
      coordenada: { latitude: 2.96, longitude: -75.29 },
      precision: "Media (±10m)",
    },
    {
      id: "4",
      fecha: "2024-01-14",
      hora: "09:20",
      direccion: "Carrera 10 #5-40",
      barrio: "San Jorge",
      municipio: "Neiva",
      departamento: "Huila",
      pais: "Colombia",
      coordenada: { latitude: 2.958, longitude: -75.288 },
      precision: "Alta (±5m)",
    },
  ];

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
            <Text style={styles.headerTitle}>{t.mapa.historial_recorridos}</Text>
            <Text style={styles.headerSubtitle}>
              {t.mapa.historial_recorridos_desc}
            </Text>
          </View>
        </LinearGradient>

        {/* LISTA DE HISTORIAL */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t.mapa.historial_reciente}
        </Text>

        {historialRecorridos.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.historyCard, { backgroundColor: theme.card }]}
            onPress={() => setSelectedItem(item)}
            activeOpacity={0.85}
          >
            <View style={styles.historyIcon}>
              <MaterialIcons name="history" size={24} color="#7B1DB2" />
            </View>

            <View style={styles.historyInfo}>
              <View style={styles.dateRow}>
                <MaterialIcons
                  name="calendar-today"
                  size={16}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.dateText, { color: theme.contactSubtext }]}>
                  {formatearFecha(item.fecha)}
                </Text>
                <MaterialIcons
                  name="access-time"
                  size={16}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.timeText, { color: theme.contactSubtext }]}>
                  {item.hora}
                </Text>
              </View>

              <Text style={[styles.addressText, { color: theme.text }]}>
                {item.direccion}
              </Text>

              <View style={styles.locationRow}>
                <MaterialIcons
                  name="place"
                  size={14}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.locationText, { color: theme.contactSubtext }]}>
                  {item.barrio}, {item.municipio}
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
      <Modal visible={!!selectedItem} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setSelectedItem(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                {selectedItem && (
                  <>
                    <View style={styles.modalHeader}>
                      <View style={styles.modalIcon}>
                        <MaterialIcons name="history" size={32} color="#7B1DB2" />
                      </View>
                      <Text style={[styles.modalTitle, { color: theme.text }]}>
                        {t.mapa.historial_recorridos}
                      </Text>
                    </View>

                    <View style={styles.modalBody}>
                      <InfoRow
                        icon="calendar-today"
                        label={t.mapa.fecha_hora}
                        value={`${formatearFecha(selectedItem.fecha)}, ${selectedItem.hora}`}
                        theme={theme}
                      />
                      <InfoRow
                        icon="place"
                        label={t.mapa.direccion}
                        value={selectedItem.direccion}
                        theme={theme}
                      />
                      <InfoRow
                        icon="home"
                        label={t.mapa.barrio}
                        value={selectedItem.barrio}
                        theme={theme}
                      />
                      <InfoRow
                        icon="location-city"
                        label={t.mapa.municipio}
                        value={selectedItem.municipio}
                        theme={theme}
                      />
                      <InfoRow
                        icon="public"
                        label={t.mapa.pais}
                        value={selectedItem.pais}
                        theme={theme}
                      />
                      <InfoRow
                        icon="my-location"
                        label={t.mapa.latitud}
                        value={selectedItem.coordenada.latitude.toFixed(5)}
                        theme={theme}
                      />
                      <InfoRow
                        icon="location-on"
                        label={t.mapa.longitud}
                        value={selectedItem.coordenada.longitude.toFixed(5)}
                        theme={theme}
                      />
                      <InfoRow
                        icon="gps-fixed"
                        label={t.mapa.precision}
                        value={selectedItem.precision}
                        theme={theme}
                      />
                    </View>

                    {/* MAPA PREVIEW */}
                    <View style={styles.mapPreview}>
                      <MapView
                        style={styles.map}
                        initialRegion={{
                          latitude: selectedItem.coordenada.latitude,
                          longitude: selectedItem.coordenada.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        rotateEnabled={false}
                        pitchEnabled={false}
                      >
                        <Marker
                          coordinate={selectedItem.coordenada}
                          title={selectedItem.direccion}
                          pinColor="#7B1DB2"
                        />
                      </MapView>
                    </View>

                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setSelectedItem(null)}
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
