import React, { useCallback, useState } from "react";
import {
  Alert,
  BackHandler,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useAuth } from "../../../contexts/AuthContext";
import type { MainStackParamList } from "../../../navigation/types";
import { createStyles } from "../styles/UbicacionesGuardadas.style";
import {
  frequentLocationsService,
  type FrequentLocationApi,
} from "../../../services/frequent-locations.service";

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

type SavedLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  neighborhood: string;
  municipality: string;
  city: string;
  department: string;
  country: string;
  date: string;
  status: "Activo" | "Inactivo";
  precision: string;
  notes?: string;
  riskLevel: "muy_segura" | "moderada" | "muy_insegura";
  description: string;
};

const mapFrequentToLocation = (u: FrequentLocationApi): SavedLocation => ({
  id: String(u.id),
  name: u.name,
  latitude: Number(u.latitude),
  longitude: Number(u.longitude),
  address: u.address ?? "",
  neighborhood: "",
  municipality: u.city ?? "",
  city: u.city ?? "",
  department: "",
  country: "",
  date: u.createdAt,
  status: u.isActive ? "Activo" : "Inactivo",
  precision: "Alta",
  notes: u.notes,
  riskLevel:
    u.riskLevel === "muy_segura" || u.riskLevel === "muy_insegura" ? u.riskLevel : "moderada",
  description: u.notes ?? "",
});

export default function UbicacionesGuardadas() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation<NavigationProp>();
  const styles = createStyles(theme);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [riskFilter, setRiskFilter] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  // Volver siempre lleva al módulo de Mapa (también justo después de guardar una ubicación,
  // cuando por detrás todavía está la pantalla de "Clasificar zona").
  const goToMap = useCallback(() => {
    const destination = { screen: "Home", params: { screen: "Map" } } as never;
    try {
      (navigation as any).popTo("DrawerHome", destination);
    } catch {
      navigation.navigate("DrawerHome", destination);
    }
  }, [navigation]);

  const loadLocations = useCallback(async () => {
    try {
      if (!user?.id) {
        setLocations([]);
        return;
      }
      const apiLocations = await frequentLocationsService.getByUser(user.id);
      setLocations(apiLocations.map(mapFrequentToLocation));
    } catch (error) {
      console.error("Error al cargar ubicaciones:", error);
      setLocations([]);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadLocations();

      // Botón "atrás" del celular: mismo comportamiento que la flecha del encabezado
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        goToMap();
        return true;
      });
      return () => sub.remove();
    }, [loadLocations, goToMap])
  );

  const getRiskColor = (level: string) => {
    switch (level) {
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

  const getRiskLabel = (level: string) => {
    switch (level) {
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

  const getRiskIcon = (level: string) => {
    switch (level) {
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

  const handleCardPress = (location: SavedLocation) => {
    navigation.navigate("ClassifyZone", {
      latitude: location.latitude,
      longitude: location.longitude,
      locationToEdit: {
        id: location.id,
        name: location.name,
        notes: location.notes,
        riskLevel: location.riskLevel,
        description: location.description,
      },
    });
  };

  const handleDelete = async (id: string) => {
    try {
      Alert.alert(
        "Eliminar ubicación",
        "¿Estás segura de eliminar esta ubicación?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              // delete via API (no local storage)
              try {
                await frequentLocationsService.remove(id);
                setLocations((prev) => prev.filter((u) => u.id !== id));
              } catch (apiErr) {
                console.error("Error al eliminar en backend:", apiErr);
                Alert.alert("Error", "No se pudo eliminar la ubicación");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error al eliminar ubicación:", error);
      Alert.alert("Error", "No se pudo eliminar la ubicación");
    }
  };

  const filteredLocations = locations.filter((location) => {
    if (riskFilter && location.riskLevel !== riskFilter) {
      return false;
    }

    if (searchText.trim()) {
      const searchTerm = searchText.toLowerCase();
      return (
        location.name.toLowerCase().includes(searchTerm) ||
        location.address.toLowerCase().includes(searchTerm) ||
        location.city.toLowerCase().includes(searchTerm)
      );
    }

    return true;
  });

  // Encabezado redondeado (mismo diseño que el de "Tu ubicación")
  const heading = (
    <LinearGradient
      colors={[theme.headercolor1, theme.headercolor2]}
      start={{ x: 1, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 20 }]}
    >
      <TouchableOpacity style={styles.backButton} onPress={goToMap}>
        <MaterialIcons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{t.mapa.ubicaciones_guardadas}</Text>
        <Text style={styles.headerSubtitle}>Tus lugares guardados y clasificados</Text>
      </View>

      <View style={styles.headerIcon}>
        <MaterialIcons name="bookmark" size={30} color="#fff" />
      </View>
    </LinearGradient>
  );

  if (locations.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {heading}

        {/* ESTADO VACÍO */}
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="bookmark-border"
            size={64}
            color={theme.contactSubtext}
          />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No hay ubicaciones guardadas
          </Text>
          <Text style={[styles.emptyDescription, { color: theme.contactSubtext }]}>
            Guarda tus ubicaciones favoritas y clasifica su nivel de seguridad
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {heading}

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
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")}>
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
              riskFilter === null && styles.filterChipActive,
              { backgroundColor: riskFilter === null ? "#7B1DB2" : theme.card },
            ]}
            onPress={() => setRiskFilter(null)}
          >
            <Text
              style={[
                styles.filterText,
                { color: riskFilter === null ? "#fff" : theme.text },
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              riskFilter === "muy_segura" && styles.filterChipActive,
              { backgroundColor: riskFilter === "muy_segura" ? "#27AE60" : theme.card },
            ]}
            onPress={() => setRiskFilter("muy_segura")}
          >
            <MaterialIcons
              name="verified-user"
              size={14}
              color={riskFilter === "muy_segura" ? "#fff" : "#27AE60"}
            />
            <Text
              style={[
                styles.filterText,
                { color: riskFilter === "muy_segura" ? "#fff" : theme.text },
              ]}
            >
              Seguras
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              riskFilter === "moderada" && styles.filterChipActive,
              { backgroundColor: riskFilter === "moderada" ? "#D89B00" : theme.card },
            ]}
            onPress={() => setRiskFilter("moderada")}
          >
            <MaterialIcons
              name="warning"
              size={14}
              color={riskFilter === "moderada" ? "#fff" : "#D89B00"}
            />
            <Text
              style={[
                styles.filterText,
                { color: riskFilter === "moderada" ? "#fff" : theme.text },
              ]}
            >
              Moderadas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              riskFilter === "muy_insegura" && styles.filterChipActive,
              { backgroundColor: riskFilter === "muy_insegura" ? "#E74C3C" : theme.card },
            ]}
            onPress={() => setRiskFilter("muy_insegura")}
          >
            <MaterialIcons
              name="report"
              size={14}
              color={riskFilter === "muy_insegura" ? "#fff" : "#E74C3C"}
            />
            <Text
              style={[
                styles.filterText,
                { color: riskFilter === "muy_insegura" ? "#fff" : theme.text },
              ]}
            >
              Inseguras
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONTADOR DE RESULTADOS */}
        {filteredLocations.length !== locations.length && (
          <Text style={[styles.resultsCount, { color: theme.contactSubtext }]}>
            {filteredLocations.length} de {locations.length} ubicaciones
          </Text>
        )}

        {/* LISTA DE UBICACIONES */}
        <View style={styles.listContainer}>
          {filteredLocations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={[styles.card, { backgroundColor: theme.card }]}
              onPress={() => handleCardPress(location)}
              activeOpacity={0.85}
            >
              {/* HEADER DE LA CARD */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View
                    style={[
                      styles.riskBadge,
                      { backgroundColor: getRiskColor(location.riskLevel) + "20" },
                    ]}
                  >
                    <MaterialIcons
                      name={getRiskIcon(location.riskLevel) as any}
                      size={16}
                      color={getRiskColor(location.riskLevel)}
                    />
                    <Text
                      style={[
                        styles.riskText,
                        { color: getRiskColor(location.riskLevel) },
                      ]}
                    >
                      {getRiskLabel(location.riskLevel)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(location.id)}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={18}
                    color="#E74C3C"
                  />
                </TouchableOpacity>
              </View>

              {/* NOMBRE */}
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {location.name}
              </Text>

              {/* DIRECCIÓN */}
              <Text style={[styles.cardAddress, { color: theme.contactSubtext }]}>
                {location.address}
              </Text>

              {/* CIUDAD */}
              <Text style={[styles.cardCity, { color: theme.contactSubtext }]}>
                {location.city}, {location.department}
              </Text>

              {/* FOOTER */}
              <View style={styles.cardFooter}>
                <View style={styles.cardFooterLeft}>
                  <MaterialIcons
                    name="location-on"
                    size={12}
                    color={theme.contactSubtext}
                  />
                  <Text style={[styles.coordsCard, { color: theme.contactSubtext }]}>
                    {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
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