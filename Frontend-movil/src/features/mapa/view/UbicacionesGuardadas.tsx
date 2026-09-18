import React, { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import type { MainStackParamList } from "../../../navigation/types";
import { createStyles } from "../styles/UbicacionesGuardadas.style";

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

type UbicacionGuardada = {
  id: string;
  nombre: string;
  latitude: number;
  longitude: number;
  direccion: string;
  barrio: string;
  municipio: string;
  ciudad: string;
  departamento: string;
  pais: string;
  fecha: string;
  estado: "Activo" | "Inactivo";
  precision: string;
  notas?: string;
  nivelRiesgo: "muy_segura" | "moderada" | "muy_insegura";
  descripcion: string;
};

export default function UbicacionesGuardadas() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<NavigationProp>();
  const styles = createStyles(theme);

  // Estado para las ubicaciones guardadas
  const [ubicaciones, setUbicaciones] = useState<UbicacionGuardada[]>([]);
  const [filtroRiesgo, setFiltroRiesgo] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  // Cargar ubicaciones cuando la pantalla gana foco
  useFocusEffect(
    React.useCallback(() => {
      cargarUbicaciones();
    }, [])
  );

  const cargarUbicaciones = async () => {
    try {
      const ubicacionesGuardadas = await AsyncStorage.getItem("ubicaciones_guardadas");
      if (ubicacionesGuardadas) {
        setUbicaciones(JSON.parse(ubicacionesGuardadas));
      } else {
        setUbicaciones([]);
      }
    } catch (error) {
      console.error("Error al cargar ubicaciones:", error);
      setUbicaciones([]);
    }
  };

  const getRiskColor = (nivel: string) => {
    switch (nivel) {
      case "muy_segura":
        return "#27AE60";
      case "moderada":
        return "#D89B00";
      case "muy_insegura":
        return "#E74C3C";
      default:
        return "#999";
    }
  };

  const getRiskLabel = (nivel: string) => {
    switch (nivel) {
      case "muy_segura":
        return "Muy segura";
      case "moderada":
        return "Moderada";
      case "muy_insegura":
        return "Muy insegura";
      default:
        return "Sin clasificar";
    }
  };

  const getRiskIcon = (nivel: string) => {
    switch (nivel) {
      case "muy_segura":
        return "verified-user";
      case "moderada":
        return "warning";
      case "muy_insegura":
        return "report";
      default:
        return "help";
    }
  };

  const handleCardPress = (ubicacion: UbicacionGuardada) => {
    // Navegar a la pantalla de edición con los datos de la ubicación
    navigation.navigate("ClasificarZona", {
      latitude: ubicacion.latitude,
      longitude: ubicacion.longitude,
      editarUbicacion: {
        id: ubicacion.id,
        nombre: ubicacion.nombre,
        notas: ubicacion.notas,
        nivelRiesgo: ubicacion.nivelRiesgo,
        descripcion: ubicacion.descripcion,
      },
    });
  };

  const handleDelete = async (id: string) => {
    try {
      // Confirmar eliminación usando Alert de React Native
      Alert.alert(
        "Eliminar ubicación",
        "¿Estás segura de eliminar esta ubicación?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              // Obtener ubicaciones actuales
              const ubicacionesGuardadas = await AsyncStorage.getItem("ubicaciones_guardadas");
              let ubicaciones = ubicacionesGuardadas ? JSON.parse(ubicacionesGuardadas) : [];

              // Filtrar para eliminar la ubicación
              ubicaciones = ubicaciones.filter((u: UbicacionGuardada) => u.id !== id);

              // Guardar la lista actualizada
              await AsyncStorage.setItem("ubicaciones_guardadas", JSON.stringify(ubicaciones));

              // Actualizar estado
              setUbicaciones(ubicaciones);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error al eliminar ubicación:", error);
      Alert.alert("Error", "No se pudo eliminar la ubicación");
    }
  };

  // Filtrar ubicaciones
  const ubicacionesFiltradas = ubicaciones.filter((ubicacion) => {
    // Filtro por nivel de riesgo
    if (filtroRiesgo && ubicacion.nivelRiesgo !== filtroRiesgo) {
      return false;
    }

    // Filtro por búsqueda (nombre o dirección)
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase();
      return (
        ubicacion.nombre.toLowerCase().includes(terminoBusqueda) ||
        ubicacion.direccion.toLowerCase().includes(terminoBusqueda) ||
        ubicacion.ciudad.toLowerCase().includes(terminoBusqueda)
      );
    }

    return true;
  });

  if (ubicaciones.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons
              name="arrow-back"
              size={22}
              color={theme.text}
            />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text
              style={[
                styles.headerTitle,
                { color: theme.text },
              ]}
            >
              Ubicaciones guardadas
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <MaterialIcons
              name="bookmark"
              size={22}
              color="#7B1DB2"
            />
          </View>
        </View>

        {/* ESTADO VACÍO */}
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="bookmark-border"
            size={64}
            color={theme.contactSubtext}
          />
          <Text
            style={[
              styles.emptyTitle,
              { color: theme.text },
            ]}
          >
            No hay ubicaciones guardadas
          </Text>
          <Text
            style={[
              styles.emptyDescription,
              { color: theme.contactSubtext },
            ]}
          >
            Guarda tus ubicaciones favoritas y clasifica su nivel de seguridad
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons
              name="arrow-back"
              size={22}
              color={theme.text}
            />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text
              style={[
                styles.headerTitle,
                { color: theme.text },
              ]}
            >
              Ubicaciones guardadas
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <MaterialIcons
              name="bookmark"
              size={22}
              color="#7B1DB2"
            />
          </View>
        </View>

        {/* BARRA DE BÚSQUEDA */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInput, { backgroundColor: theme.card }]}>
            <MaterialIcons
              name="search"
              size={18}
              color={theme.contactSubtext}
            />
            <TextInput
              style={[styles.searchText, { color: theme.text }]}
              placeholder="Buscar por nombre, dirección o ciudad"
              placeholderTextColor={theme.contactSubtext}
              value={busqueda}
              onChangeText={setBusqueda}
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => setBusqueda("")}>
                <MaterialIcons
                  name="close"
                  size={18}
                  color={theme.contactSubtext}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* FILTROS POR NIVEL DE RIESGO */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filtroRiesgo === null && styles.filterChipActive,
              { backgroundColor: filtroRiesgo === null ? "#7B1DB2" : theme.card },
            ]}
            onPress={() => setFiltroRiesgo(null)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filtroRiesgo === null ? "#fff" : theme.text },
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filtroRiesgo === "muy_segura" && styles.filterChipActive,
              { backgroundColor: filtroRiesgo === "muy_segura" ? "#27AE60" : theme.card },
            ]}
            onPress={() => setFiltroRiesgo("muy_segura")}
          >
            <MaterialIcons
              name="verified-user"
              size={14}
              color={filtroRiesgo === "muy_segura" ? "#fff" : "#27AE60"}
            />
            <Text
              style={[
                styles.filterText,
                { color: filtroRiesgo === "muy_segura" ? "#fff" : theme.text },
              ]}
            >
              Seguras
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filtroRiesgo === "moderada" && styles.filterChipActive,
              { backgroundColor: filtroRiesgo === "moderada" ? "#D89B00" : theme.card },
            ]}
            onPress={() => setFiltroRiesgo("moderada")}
          >
            <MaterialIcons
              name="warning"
              size={14}
              color={filtroRiesgo === "moderada" ? "#fff" : "#D89B00"}
            />
            <Text
              style={[
                styles.filterText,
                { color: filtroRiesgo === "moderada" ? "#fff" : theme.text },
              ]}
            >
              Moderadas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              filtroRiesgo === "muy_insegura" && styles.filterChipActive,
              { backgroundColor: filtroRiesgo === "muy_insegura" ? "#E74C3C" : theme.card },
            ]}
            onPress={() => setFiltroRiesgo("muy_insegura")}
          >
            <MaterialIcons
              name="report"
              size={14}
              color={filtroRiesgo === "muy_insegura" ? "#fff" : "#E74C3C"}
            />
            <Text
              style={[
                styles.filterText,
                { color: filtroRiesgo === "muy_insegura" ? "#fff" : theme.text },
              ]}
            >
              Inseguras
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONTADOR DE RESULTADOS */}
        {ubicacionesFiltradas.length !== ubicaciones.length && (
          <Text style={[styles.resultsCount, { color: theme.contactSubtext }]}>
            {ubicacionesFiltradas.length} de {ubicaciones.length} ubicaciones
          </Text>
        )}

        {/* LISTA DE UBICACIONES */}
        <View style={styles.listContainer}>
          {ubicacionesFiltradas.map((ubicacion) => (
            <TouchableOpacity
              key={ubicacion.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                },
              ]}
              onPress={() => handleCardPress(ubicacion)}
              activeOpacity={0.85}
            >
              {/* HEADER DE LA CARD */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View
                    style={[
                      styles.riskBadge,
                      { backgroundColor: getRiskColor(ubicacion.nivelRiesgo) + "20" },
                    ]}
                  >
                    <MaterialIcons
                      name={getRiskIcon(ubicacion.nivelRiesgo) as any}
                      size={16}
                      color={getRiskColor(ubicacion.nivelRiesgo)}
                    />
                    <Text
                      style={[
                        styles.riskText,
                        { color: getRiskColor(ubicacion.nivelRiesgo) },
                      ]}
                    >
                      {getRiskLabel(ubicacion.nivelRiesgo)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(ubicacion.id)}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={18}
                    color="#E74C3C"
                  />
                </TouchableOpacity>
              </View>

              {/* NOMBRE */}
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.text },
                ]}
              >
                {ubicacion.nombre}
              </Text>

              {/* DIRECCIÓN */}
              <Text
                style={[
                  styles.cardAddress,
                  { color: theme.contactSubtext },
                ]}
              >
                {ubicacion.direccion}
              </Text>

              {/* CIUDAD */}
              <Text
                style={[
                  styles.cardCity,
                  { color: theme.contactSubtext },
                ]}
              >
                {ubicacion.ciudad}, {ubicacion.departamento}
              </Text>

              {/* FOOTER */}
              <View style={styles.cardFooter}>
                <View style={styles.cardFooterLeft}>
                  <MaterialIcons
                    name="location-on"
                    size={12}
                    color={theme.contactSubtext}
                  />
                  <Text
                    style={[
                      styles.cardCoords,
                      { color: theme.contactSubtext },
                    ]}
                  >
                    {ubicacion.latitude.toFixed(5)}, {ubicacion.longitude.toFixed(5)}
                  </Text>
                </View>

                <MaterialIcons
                  name="chevron-right"
                  size={18}
                  color={theme.contactSubtext}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
