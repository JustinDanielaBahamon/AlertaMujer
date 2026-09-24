import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useRecorridos } from "../../../contexts/RecorridosContext";
import { styles } from "../styles/GuardarRecorrido.style";

type PuntoSeleccionado = {
  latitude: number;
  longitude: number;
  nombre?: string;
  direccion?: string;
};

type MetodoSeleccion = "mapa" | "ubicaciones";

export default function GuardarRecorrido() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<any>();
  const { agregarRecorridoManual } = useRecorridos();

  const [puntoA, setPuntoA] = useState<PuntoSeleccionado | null>(null);
  const [puntoB, setPuntoB] = useState<PuntoSeleccionado | null>(null);
  const [nombrePuntoA, setNombrePuntoA] = useState("");
  const [nombrePuntoB, setNombrePuntoB] = useState("");
  const [nombreRecorrido, setNombreRecorrido] = useState("");
  const [metodoSeleccion, setMetodoSeleccion] = useState<MetodoSeleccion>("mapa");
  const [modalUbicacionesVisible, setModalUbicacionesVisible] = useState(false);
  const [puntoSeleccionando, setPuntoSeleccionando] = useState<"A" | "B" | null>(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);

  // Ubicaciones guardadas simuladas
  const ubicacionesGuardadas = [
    { id: "1", nombre: "Casa", latitude: 2.9271, longitude: -75.2874, direccion: "Calle 10 #5-20" },
    { id: "2", nombre: "Trabajo", latitude: 2.9285, longitude: -75.2859, direccion: "Carrera 8 #15-30" },
    { id: "3", nombre: "Gimnasio", latitude: 2.9302, longitude: -75.2841, direccion: "Calle 3 #8-15" },
    { id: "4", nombre: "Supermercado", latitude: 2.9320, longitude: -75.2825, direccion: "Carrera 10 #5-40" },
  ];

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    if (puntoSeleccionando === "A") {
      setPuntoA({ latitude, longitude });
      setPuntoSeleccionando(null);
    } else if (puntoSeleccionando === "B") {
      setPuntoB({ latitude, longitude });
      setPuntoSeleccionando(null);
    }
  };

  const seleccionarDesdeUbicaciones = (ubicacion: any, punto: "A" | "B") => {
    const puntoSeleccionado = {
      latitude: ubicacion.latitude,
      longitude: ubicacion.longitude,
      nombre: ubicacion.nombre,
      direccion: ubicacion.direccion,
    };

    if (punto === "A") {
      setPuntoA(puntoSeleccionado);
    } else {
      setPuntoB(puntoSeleccionado);
    }
    setModalUbicacionesVisible(false);
  };

  const iniciarSeleccionPunto = (punto: "A" | "B") => {
    setPuntoSeleccionando(punto);
    if (metodoSeleccion === "ubicaciones") {
      setModalUbicacionesVisible(true);
    }
  };

  const guardarRecorrido = () => {
    if (!puntoA || !puntoB) {
      alert("Por favor selecciona ambos puntos del recorrido");
      return;
    }

    // Crear un recorrido manual con los puntos seleccionados
    const hoy = new Date();
    const fecha = hoy.toISOString().split('T')[0];
    const horaInicio = hoy.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    
    // Simular hora fin (5 minutos después)
    const horaFin = new Date(hoy.getTime() + 5 * 60000).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    const nuevoRecorrido = {
      fecha,
      horaInicio,
      horaFin,
      barrioInicio: nombrePuntoA || puntoA.nombre || "Punto seleccionado",
      barrioFin: nombrePuntoB || puntoB.nombre || "Punto seleccionado",
      municipio: "Neiva",
      departamento: "Huila",
      pais: "Colombia",
      puntos: [
        {
          latitude: puntoA.latitude,
          longitude: puntoA.longitude,
          timestamp: horaInicio,
        },
        {
          latitude: puntoB.latitude,
          longitude: puntoB.longitude,
          timestamp: horaFin,
        },
      ],
      cantidadPuntos: 2,
      nombrePersonalizado: nombreRecorrido || `Ruta ${nombrePuntoA || puntoA.nombre || "A"} → ${nombrePuntoB || puntoB.nombre || "B"}`,
      importante: true, // Por defecto importantes
    };

    agregarRecorridoManual(nuevoRecorrido);
    alert("Recorrido guardado exitosamente");
    navigation.goBack();
  };

  const limpiarSeleccion = () => {
    setPuntoA(null);
    setPuntoB(null);
    setPuntoSeleccionando(null);
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
            <Text style={styles.headerTitle}>Guardar Recorrido</Text>
            <Text style={styles.headerSubtitle}>
              Define la ruta de punto A a punto B
            </Text>
          </View>
        </LinearGradient>

        {/* MÉTODO DE SELECCIÓN */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Método de selección
          </Text>
          
          <View style={styles.metodoContainer}>
            <TouchableOpacity
              style={[
                styles.metodoButton,
                metodoSeleccion === "mapa" && styles.metodoButtonActive,
                { borderColor: metodoSeleccion === "mapa" ? theme.tabActiveColor : theme.contactSubtext }
              ]}
              onPress={() => setMetodoSeleccion("mapa")}
            >
              <MaterialIcons 
                name="map" 
                size={20} 
                color={metodoSeleccion === "mapa" ? "#7B1DB2" : theme.contactSubtext} 
              />
              <Text style={[
                styles.metodoButtonText,
                { color: metodoSeleccion === "mapa" ? "#7B1DB2" : theme.text }
              ]}>
                Mapa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.metodoButton,
                metodoSeleccion === "ubicaciones" && styles.metodoButtonActive,
                { borderColor: metodoSeleccion === "ubicaciones" ? theme.tabActiveColor : theme.contactSubtext }
              ]}
              onPress={() => setMetodoSeleccion("ubicaciones")}
            >
              <MaterialIcons 
                name="bookmark" 
                size={20} 
                color={metodoSeleccion === "ubicaciones" ? "#7B1DB2" : theme.contactSubtext} 
              />
              <Text style={[
                styles.metodoButtonText,
                { color: metodoSeleccion === "ubicaciones" ? "#7B1DB2" : theme.text }
              ]}>
                Ubicaciones
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MAPA */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 2.9271,
              longitude: -75.2874,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            onPress={handleMapPress}
          >
            {puntoA && (
              <Marker
                coordinate={puntoA}
                title="Punto A - Inicio"
                description={puntoA.nombre || puntoA.direccion}
                pinColor="#4CAF50"
              />
            )}
            
            {puntoB && (
              <Marker
                coordinate={puntoB}
                title="Punto B - Fin"
                description={puntoB.nombre || puntoB.direccion}
                pinColor="#F44336"
              />
            )}
          </MapView>

          {puntoSeleccionando && (
            <View style={styles.instructionOverlay}>
              <Text style={styles.instructionText}>
                Toca en el mapa para seleccionar {puntoSeleccionando === "A" ? "Punto A" : "Punto B"}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.openMapButton}
            onPress={() => setMapFullscreen(true)}
          >
            <MaterialIcons name="open-in-full" size={18} color="#fff" />
            <Text style={styles.openMapText}>Abrir mapa completo</Text>
          </TouchableOpacity>
        </View>

        {/* SELECCIÓN DE PUNTOS */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Puntos del recorrido
          </Text>

          {/* PUNTO A */}
          <TouchableOpacity
            style={[
              styles.puntoButton,
              puntoA && styles.puntoButtonSelected,
              { borderColor: puntoA ? "#4CAF50" : theme.contactSubtext }
            ]}
            onPress={() => iniciarSeleccionPunto("A")}
          >
            <View style={[styles.puntoIcon, { backgroundColor: puntoA ? "#4CAF50" : "#E0E0E0" }]}>
              <MaterialIcons name="radio-button-checked" size={24} color="#fff" />
            </View>
            <View style={styles.puntoInfo}>
              <Text style={[styles.puntoLabel, { color: theme.text }]}>
                Punto A - Inicio
              </Text>
              {puntoA ? (
                <Text style={[styles.puntoCoordenadas, { color: theme.contactSubtext }]}>
                  {puntoA.nombre || puntoA.direccion || `${puntoA.latitude.toFixed(4)}, ${puntoA.longitude.toFixed(4)}`}
                </Text>
              ) : (
                <Text style={[styles.puntoPlaceholder, { color: theme.contactSubtext }]}>
                  {metodoSeleccion === "mapa" ? "Toca el mapa para seleccionar" : "Selecciona de ubicaciones guardadas"}
                </Text>
              )}
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
          </TouchableOpacity>

          {/* Campo de nombre para Punto A */}
          {puntoA && (
            <View style={[styles.nombreInputContainer, { backgroundColor: theme.background }]}>
              <MaterialIcons name="edit" size={18} color={theme.contactSubtext} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.nombreInput, { color: theme.text }]}
                placeholder="Nombre del punto A (ej: Casa, Trabajo)"
                placeholderTextColor={theme.contactSubtext}
                value={nombrePuntoA}
                onChangeText={setNombrePuntoA}
              />
            </View>
          )}

          {/* PUNTO B */}
          <TouchableOpacity
            style={[
              styles.puntoButton,
              puntoB && styles.puntoButtonSelected,
              { borderColor: puntoB ? "#F44336" : theme.contactSubtext }
            ]}
            onPress={() => iniciarSeleccionPunto("B")}
          >
            <View style={[styles.puntoIcon, { backgroundColor: puntoB ? "#F44336" : "#E0E0E0" }]}>
              <MaterialIcons name="radio-button-checked" size={24} color="#fff" />
            </View>
            <View style={styles.puntoInfo}>
              <Text style={[styles.puntoLabel, { color: theme.text }]}>
                Punto B - Fin
              </Text>
              {puntoB ? (
                <Text style={[styles.puntoCoordenadas, { color: theme.contactSubtext }]}>
                  {puntoB.nombre || puntoB.direccion || `${puntoB.latitude.toFixed(4)}, ${puntoB.longitude.toFixed(4)}`}
                </Text>
              ) : (
                <Text style={[styles.puntoPlaceholder, { color: theme.contactSubtext }]}>
                  {metodoSeleccion === "mapa" ? "Toca el mapa para seleccionar" : "Selecciona de ubicaciones guardadas"}
                </Text>
              )}
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
          </TouchableOpacity>

          {/* Campo de nombre para Punto B */}
          {puntoB && (
            <View style={[styles.nombreInputContainer, { backgroundColor: theme.background }]}>
              <MaterialIcons name="edit" size={18} color={theme.contactSubtext} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.nombreInput, { color: theme.text }]}
                placeholder="Nombre del punto B (ej: Gimnasio, Supermercado)"
                placeholderTextColor={theme.contactSubtext}
                value={nombrePuntoB}
                onChangeText={setNombrePuntoB}
              />
            </View>
          )}
        </View>

        {/* NOMBRE DEL RECORRIDO */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Nombre del recorrido
          </Text>
          <View style={[styles.nombreInputContainer, { backgroundColor: theme.background }]}>
            <MaterialIcons name="route" size={18} color={theme.contactSubtext} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.nombreInput, { color: theme.text }]}
              placeholder="Ej: Camino seguro Sanjuan - Plaza, Recorrido de la tarde..."
              placeholderTextColor={theme.contactSubtext}
              value={nombreRecorrido}
              onChangeText={setNombreRecorrido}
            />
          </View>
          <Text style={[styles.helperText, { color: theme.contactSubtext }]}>
            Si no ingresas un nombre, se generará uno automáticamente
          </Text>
        </View>

        {/* ACCIONES */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={limpiarSeleccion}
          >
            <Text style={styles.secondaryButtonText}>Limpiar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.primaryButton,
              (!puntoA || !puntoB) && styles.primaryButtonDisabled
            ]}
            onPress={guardarRecorrido}
            disabled={!puntoA || !puntoB}
          >
            <Text style={styles.primaryButtonText}>Guardar Recorrido</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL DE UBICACIONES GUARDADAS */}
      <Modal visible={modalUbicacionesVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setModalUbicacionesVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Seleccionar {puntoSeleccionando === "A" ? "Punto A" : "Punto B"}
                  </Text>
                  <TouchableOpacity onPress={() => setModalUbicacionesVisible(false)}>
                    <MaterialIcons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalList}>
                  {ubicacionesGuardadas.map((ubicacion) => (
                    <TouchableOpacity
                      key={ubicacion.id}
                      style={[styles.ubicacionItem, { backgroundColor: theme.background }]}
                      onPress={() => seleccionarDesdeUbicaciones(ubicacion, puntoSeleccionando!)}
                    >
                      <View style={styles.ubicacionIcon}>
                        <MaterialIcons name="place" size={20} color="#7B1DB2" />
                      </View>
                      <View style={styles.ubicacionInfo}>
                        <Text style={[styles.ubicacionNombre, { color: theme.text }]}>
                          {ubicacion.nombre}
                        </Text>
                        <Text style={[styles.ubicacionDireccion, { color: theme.contactSubtext }]}>
                          {ubicacion.direccion}
                        </Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={20} color={theme.contactSubtext} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL MAPA COMPLETO */}
      <Modal visible={mapFullscreen} animationType="slide">
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: 2.9271,
              longitude: -75.2874,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            onPress={handleMapPress}
          >
            {puntoA && (
              <Marker
                coordinate={puntoA}
                title="Punto A - Inicio"
                description={puntoA.nombre || puntoA.direccion}
                pinColor="#4CAF50"
              />
            )}
            
            {puntoB && (
              <Marker
                coordinate={puntoB}
                title="Punto B - Fin"
                description={puntoB.nombre || puntoB.direccion}
                pinColor="#F44336"
              />
            )}
          </MapView>

          <TouchableOpacity
            style={styles.fullscreenCloseButton}
            onPress={() => setMapFullscreen(false)}
          >
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}