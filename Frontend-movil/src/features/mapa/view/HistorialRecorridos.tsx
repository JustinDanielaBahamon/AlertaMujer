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
  SafeAreaView,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useAjustesViewModel } from "../../settings/viewModel/useAjustesViewModel";
import { useRecorridos } from "../../../contexts/RecorridosContext";
import { styles } from "../styles/HistorialRecorridos.style";
import { Alert } from "react-native";

type PuntoGPS = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

type Recorrido = {
  id: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  barrioInicio: string;
  barrioFin: string;
  municipio: string;
  departamento: string;
  pais: string;
  puntos: PuntoGPS[];
  cantidadPuntos: number;
  distanciaEstimada?: string; // Opcional para futuro
  esManual?: boolean; // Para distinguir recorridos manuales de automáticos
  nombrePersonalizado?: string; // Para recorridos manuales
  importante: boolean; // Para mostrar en el mapa principal
};

export default function HistorialRecorridos() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<any>();
  const { mostrarRecorridos } = useAjustesViewModel();
  const { recorridos: recorridosManuales, eliminarRecorrido, toggleImportante } = useRecorridos();

  const [fullscreen, setFullscreen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Recorrido | null>(null);

  // Combinar recorridos simulados con recorridos manuales
  const recorridosSimulados: Recorrido[] = [
    {
      id: "sim-1",
      fecha: "2024-09-10",
      horaInicio: "10:35",
      horaFin: "11:20",
      barrioInicio: "Centro",
      barrioFin: "Altico",
      municipio: "Neiva",
      departamento: "Huila",
      pais: "Colombia",
      puntos: [
        { latitude: 2.9271, longitude: -75.2874, timestamp: "10:35" },
        { latitude: 2.9285, longitude: -75.2859, timestamp: "10:40" },
        { latitude: 2.9302, longitude: -75.2841, timestamp: "10:45" },
        { latitude: 2.9320, longitude: -75.2825, timestamp: "10:50" },
        { latitude: 2.9335, longitude: -75.2808, timestamp: "10:55" },
        { latitude: 2.9350, longitude: -75.2792, timestamp: "11:00" },
        { latitude: 2.9365, longitude: -75.2775, timestamp: "11:05" },
        { latitude: 2.9380, longitude: -75.2758, timestamp: "11:10" },
        { latitude: 2.9395, longitude: -75.2741, timestamp: "11:15" },
        { latitude: 2.9410, longitude: -75.2724, timestamp: "11:20" },
      ],
      cantidadPuntos: 10,
      importante: true,
    },
    {
      id: "sim-2",
      fecha: "2024-09-10",
      horaInicio: "14:10",
      horaFin: "14:45",
      barrioInicio: "Altico",
      barrioFin: "El Jardín",
      municipio: "Neiva",
      departamento: "Huila",
      pais: "Colombia",
      puntos: [
        { latitude: 2.9410, longitude: -75.2724, timestamp: "14:10" },
        { latitude: 2.9425, longitude: -75.2707, timestamp: "14:15" },
        { latitude: 2.9440, longitude: -75.2690, timestamp: "14:20" },
        { latitude: 2.9455, longitude: -75.2673, timestamp: "14:25" },
        { latitude: 2.9470, longitude: -75.2656, timestamp: "14:30" },
        { latitude: 2.9485, longitude: -75.2639, timestamp: "14:35" },
        { latitude: 2.9500, longitude: -75.2622, timestamp: "14:40" },
        { latitude: 2.9515, longitude: -75.2605, timestamp: "14:45" },
      ],
      cantidadPuntos: 8,
      importante: true,
    },
    {
      id: "sim-3",
      fecha: "2024-09-09",
      horaInicio: "08:20",
      horaFin: "09:05",
      barrioInicio: "La Libertad",
      barrioFin: "Centro",
      municipio: "Neiva",
      departamento: "Huila",
      pais: "Colombia",
      puntos: [
        { latitude: 2.9200, longitude: -75.2900, timestamp: "08:20" },
        { latitude: 2.9215, longitude: -75.2883, timestamp: "08:25" },
        { latitude: 2.9230, longitude: -75.2866, timestamp: "08:30" },
        { latitude: 2.9245, longitude: -75.2849, timestamp: "08:35" },
        { latitude: 2.9260, longitude: -75.2832, timestamp: "08:40" },
        { latitude: 2.9275, longitude: -75.2815, timestamp: "08:45" },
        { latitude: 2.9290, longitude: -75.2798, timestamp: "08:50" },
        { latitude: 2.9305, longitude: -75.2781, timestamp: "08:55" },
        { latitude: 2.9320, longitude: -75.2764, timestamp: "09:00" },
        { latitude: 2.9335, longitude: -75.2747, timestamp: "09:05" },
      ],
      cantidadPuntos: 10,
      importante: false,
    },
    {
      id: "sim-4",
      fecha: "2024-09-08",
      horaInicio: "16:30",
      horaFin: "17:15",
      barrioInicio: "San Jorge",
      barrioFin: "Santa Inés",
      municipio: "Neiva",
      departamento: "Huila",
      pais: "Colombia",
      puntos: [
        { latitude: 2.9150, longitude: -75.2950, timestamp: "16:30" },
        { latitude: 2.9165, longitude: -75.2933, timestamp: "16:35" },
        { latitude: 2.9180, longitude: -75.2916, timestamp: "16:40" },
        { latitude: 2.9195, longitude: -75.2899, timestamp: "16:45" },
        { latitude: 2.9210, longitude: -75.2882, timestamp: "16:50" },
        { latitude: 2.9225, longitude: -75.2865, timestamp: "16:55" },
        { latitude: 2.9240, longitude: -75.2848, timestamp: "17:00" },
        { latitude: 2.9255, longitude: -75.2831, timestamp: "17:05" },
        { latitude: 2.9270, longitude: -75.2814, timestamp: "17:10" },
        { latitude: 2.9285, longitude: -75.2797, timestamp: "17:15" },
      ],
      cantidadPuntos: 10,
      importante: false,
    },
  ];

  // Combinar ambos arrays
  const todosLosRecorridos = [...recorridosManuales, ...recorridosSimulados];

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const confirmarEliminar = (id: string, nombre: string) => {
    Alert.alert(
      "Eliminar recorrido",
      `¿Estás segura de que quieres eliminar el recorrido "${nombre}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => eliminarRecorrido(id),
        },
      ]
    );
  };

  const toggleImportanteHandler = (id: string) => {
    toggleImportante(id);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER MEJORADO */}
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
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t.mapa.historial_recorridos}</Text>
          <Text style={styles.headerSubtitle}>
            {t.mapa.historial_recorridos_desc}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => {
            // Navegar al mapa principal para ver recorridos
            navigation.navigate("DrawerHome", {
              screen: "Inicio",
              params: { screen: "Mapa" },
            } as never);
          }}
        >
          <MaterialIcons name="map" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >

        {/* LISTA DE HISTORIAL */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t.mapa.historial_reciente}
        </Text>

        {!mostrarRecorridos ? (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <MaterialIcons name="location-off" size={48} color={theme.contactSubtext} />
            <Text style={[styles.emptyStateText, { color: theme.contactSubtext }]}>
              Los recorridos están ocultos
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.contactSubtext }]}>
              Activa "Mostrar recorridos en mapa" en Ajustes
            </Text>
          </View>
        ) : (
          todosLosRecorridos.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.historyCard, { backgroundColor: theme.card }]}
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.85}
            >
              <View style={styles.historyIcon}>
                <MaterialIcons name="route" size={24} color="#7B1DB2" />
              </View>

            <View style={styles.historyInfo}>
              <View style={styles.dateRow}>
                <MaterialIcons
                  name="calendar-today"
                  size={16}
                  color={theme.contactSubtext}
                />
                <MaterialIcons
                  name="access-time"
                  size={16}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.timeText, { color: theme.contactSubtext }]}>
                  {item.horaInicio} → {item.horaFin}
                </Text>
              </View>

              <Text style={[styles.locationText, { color: "black" }]}>
                {item.nombrePersonalizado || `${item.barrioInicio} → ${item.barrioFin}`}
              </Text>

              <View style={styles.locationRow}>
                <MaterialIcons
                  name="place"
                  size={14}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.dateText, { color: theme.contactSubtext }]}>
                  {formatearFecha(item.fecha)}
                </Text>
                
              </View>

              <View style={styles.locationRow}>
                <MaterialIcons
                  name="my-location"
                  size={14}
                  color={theme.contactSubtext}
                />
                <Text style={[styles.addressText, { color: "black" }]}>
                  {item.municipio}, {item.departamento}
                </Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => toggleImportanteHandler(item.id)}
              >
                <MaterialIcons
                  name={item.importante ? "star" : "star-border"}
                  size={20}
                  color={item.importante ? "#FFD700" : theme.contactSubtext}
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => confirmarEliminar(item.id, item.nombrePersonalizado || `${item.barrioInicio} → ${item.barrioFin}`)}
              >
                <MaterialIcons
                  name="delete"
                  size={20}
                  color="#F44336"
                />
              </TouchableOpacity>

              <MaterialIcons
                name="chevron-right"
                size={20}
                color={theme.contactSubtext}
              />
            </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* MODAL DETALLE MEJORADO */}
      <Modal visible={!!selectedItem} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setSelectedItem(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                {selectedItem && (
                  <>
                    {/* HEADER DEL MODAL */}
                    <View style={styles.modalHeaderImproved}>
                      <View style={styles.modalIcon}>
                        <MaterialIcons name="route" size={32} color="#7B1DB2" />
                      </View>
                      <Text style={[styles.modalTitle, { color: theme.text }]}>
                        {selectedItem.nombrePersonalizado || `Recorrido #${selectedItem.id}`}
                      </Text>
                    </View>

                    <View style={styles.modalBody}>
                      <InfoRow
                        icon="calendar-today"
                        label="Fecha"
                        value={formatearFecha(selectedItem.fecha)}
                        theme={theme}
                      />
                      <InfoRow
                        icon="schedule"
                        label="Duración"
                        value={`${selectedItem.horaInicio} - ${selectedItem.horaFin}`}
                        theme={theme}
                      />
                      <InfoRow
                        icon="my-location"
                        label="Puntos registrados"
                        value={selectedItem.cantidadPuntos.toString()}
                        theme={theme}
                      />
                      <InfoRow
                        icon="home"
                        label="Barrio inicial"
                        value={selectedItem.barrioInicio}
                        theme={theme}
                      />
                      <InfoRow
                        icon="location-on"
                        label="Barrio final"
                        value={selectedItem.barrioFin}
                        theme={theme}
                      />
                      <InfoRow
                        icon="location-city"
                        label="Municipio"
                        value={`${selectedItem.municipio}, ${selectedItem.departamento}`}
                        theme={theme}
                      />
                    </View>

                    {/* MAPA PREVIEW CON POLYLINE */}
                    <View style={styles.mapPreview}>
                      <MapView
                        style={styles.map}
                        initialRegion={{
                          latitude: selectedItem.puntos[0].latitude,
                          longitude: selectedItem.puntos[0].longitude,
                          latitudeDelta: 0.02,
                          longitudeDelta: 0.02,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        rotateEnabled={false}
                        pitchEnabled={false}
                      >
                        {/* Línea del recorrido */}
                        <Polyline
                          coordinates={selectedItem.puntos.map(punto => ({
                            latitude: punto.latitude,
                            longitude: punto.longitude,
                          }))}
                          strokeWidth={4}
                          strokeColor="#7B1DB2"
                        />

                        {/* Marcador de inicio */}
                        <Marker
                          coordinate={selectedItem.puntos[0]}
                          title="Inicio"
                          pinColor="#4CAF50"
                        />

                        {/* Marcador de fin */}
                        <Marker
                          coordinate={selectedItem.puntos[selectedItem.puntos.length - 1]}
                          title="Fin"
                          pinColor="#F44336"
                        />
                      </MapView>
                    </View>

                    {/* BOTONES DE ACCIÓN */}
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={[styles.modalActionButton, styles.modalButtonSecondary]}
                        onPress={() => setSelectedItem(null)}
                      >
                        <MaterialIcons name="close" size={20} color={theme.text} />
                        <Text style={[styles.modalActionText, { color: theme.text }]}>
                          {t.modal.cerrar}
                        </Text>
                      </TouchableOpacity>

                     
                    </View>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
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
