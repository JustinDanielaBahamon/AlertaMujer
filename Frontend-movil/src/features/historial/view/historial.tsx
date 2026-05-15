import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, type NavigationProp, type ParamListBase } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Image, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../../src/contexts/ThemeContext";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";
import type { Alerta, EstadoAlerta } from "../models/Alerta";
import { createStyles, getAsistenciaColors, getEmergenciaColors } from "../style/historial.style";

const mockAlerts: Alerta[] = [
  { id: "1", tipo: "Emergencia", fecha: "30 Mar, 2026", hora: "14:32", ubicacion: "Neiva, Huila",   estado: "Enviada"   as EstadoAlerta },
  { id: "2", tipo: "Asistencia", fecha: "29 Mar, 2026", hora: "20:10", ubicacion: "Campoalegre",    estado: "Cancelada" as EstadoAlerta },
  { id: "3", tipo: "Emergencia", fecha: "28 Mar, 2026", hora: "09:15", ubicacion: "Neiva, Huila",   estado: "Enviada"   as EstadoAlerta },
  { id: "4", tipo: "Asistencia", fecha: "27 Mar, 2026", hora: "18:40", ubicacion: "Palermo, Huila", estado: "Cancelada" as EstadoAlerta },
  { id: "5", tipo: "Asistencia", fecha: "26 Mar, 2026", hora: "11:05", ubicacion: "Rivera, Huila",  estado: "En curso"  as EstadoAlerta },
];

export default function Historial() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Colores por tipo derivados del tema activo
  const emergencyColors = useMemo(() => getEmergenciaColors(theme), [theme]);
  const assistanceColors = useMemo(() => getAsistenciaColors(theme), [theme]);

  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [searchQuery, setSearchQuery]           = useState("");
  const [filteredAlerts, setFilteredAlerts]     = useState(mockAlerts);
  const [refreshing, setRefreshing]             = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setFilteredAlerts(mockAlerts);
      setSearchQuery("");
    } catch (error) {
      console.error("Error al refrescar:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = mockAlerts.filter((item) => {
      const itemData =
        `${item.fecha} ${item.hora} ${item.ubicacion} ${item.estado} ${item.tipo}`.toLowerCase();
      return itemData.includes(text.toLowerCase());
    });
    setFilteredAlerts(filtered);
  };

  const goToDetail = (alert: (typeof mockAlerts)[0]) => {
    const main = getMainStackNavigation(navigation);
    main?.navigate("DetalleAlerta", { alerta: alert });
  };

  const stats = useMemo(
    () => ({
      total:     mockAlerts.length,
      sent:      mockAlerts.filter((a) => a.estado === "Enviada").length,
      cancelled: mockAlerts.filter((a) => a.estado === "Cancelada").length,
      ongoing:   mockAlerts.filter((a) => a.estado === "En curso").length,
    }),
    []
  );

  // ─── Render de cada card ──────────────────────────────────────────────────

  const renderItem = ({ item }: { item: (typeof mockAlerts)[0] }) => {
    const isEmergency = item.tipo === "Emergencia";
    const colors = isEmergency ? emergencyColors : assistanceColors;

    // Estado: "Enviada" comparte colores con emergencia / "Cancelada" con asistencia
    const badgeBg   = item.estado === "Cancelada" ? assistanceColors.badgeBg   : emergencyColors.badgeBg;
    const badgeText = item.estado === "Cancelada" ? assistanceColors.badgeText : emergencyColors.badgeText;

    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => goToDetail(item)}
        activeOpacity={0.85}
      >
        <View style={[styles.card, { borderLeftColor: colors.border }]}>

          {/* ── COLUMNA IZQUIERDA ── */}
          <View style={styles.leftColumn}>
            <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
              <Image
                source={require("../../../../assets/imagesAlertaMujer/ScHistorial/ubicacion.png")}
                style={[styles.icon, { tintColor: colors.iconTint }]}
              />
            </View>
            <View style={[styles.decorativeLine, { backgroundColor: colors.line + "55" }]} />
          </View>

          {/* ── COLUMNA DERECHA ── */}
          <View style={styles.rightColumn}>

            {/* Encabezado: tipo + hora */}
            <View style={styles.headerRow}>
              <View style={styles.typePill}>
                <Text style={[styles.alertType, { color: colors.text }]}>
                  {item.tipo}
                </Text>
              </View>
              <View style={styles.timeRow}>
                <MaterialIcons name="access-time" size={13} color={colors.hora} />
                <Text style={[styles.timeText, { color: colors.hora }]}>{item.hora}</Text>
              </View>
            </View>

            {/* Fecha */}
            <Text style={styles.dateText}>
              <MaterialIcons name="event" size={12} color={theme.contactSubtext} />{" "}
              {item.fecha}
            </Text>

            {/* Ubicación + flecha */}
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>
                <MaterialIcons name="place" size={12} color={theme.contactSubtext} />{" "}
                {item.ubicacion}
              </Text>
              <MaterialIcons name="chevron-right" size={22} color={theme.contactSubtext} />
            </View>

            {/* Badge de estado */}
            <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.statusText, { color: badgeText }]}>
                {item.estado.toUpperCase()}
              </Text>
            </View>

          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Header de la lista ───────────────────────────────────────────────────

  const ListHeader = useMemo(
    () => (
      <View>
        {/* HEADER GRADIENTE */}
        <View style={styles.header}>
          <LinearGradient
            colors={[theme.headercolor1, theme.headercolor2]}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.headerContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Historial de Alertas</Text>
                <Text style={styles.headerSubtitle}>
                  Consulta el registro de tus alertas y su estado actual.
                </Text>
              </View>
              <Image
                source={require("@assets/imagesAlertaMujer/ScHistorial/historial.png")}
                style={{ width: 100, height: 76, resizeMode: "cover" }}
              />
            </View>
          </LinearGradient>
        </View>

        {/* BUSCADOR */}
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color={theme.contactAccent}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por fecha, lugar o estado..."
            placeholderTextColor={theme.contactSubtext}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <MaterialIcons name="close" size={18} color={theme.contactSubtext} />
            </TouchableOpacity>
          )}
        </View>

        {/* ESTADÍSTICAS */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={[styles.statNumber, { color: theme.text }]}>{stats.total}</Text>
            <Text style={styles.statSublabel}>alertas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: emergencyColors.text }]}>Enviadas</Text>
            <Text style={[styles.statNumber, { color: emergencyColors.text }]}>{stats.sent}</Text>
            <Text style={styles.statSublabel}>alertas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: assistanceColors.text }]}>Canceladas</Text>
            <Text style={[styles.statNumber, { color: assistanceColors.text }]}>{stats.cancelled}</Text>
            <Text style={styles.statSublabel}>alertas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.contactSubtext }]}>En curso</Text>
            <Text style={[styles.statNumber, { color: theme.contactSubtext }]}>{stats.ongoing}</Text>
            <Text style={styles.statSublabel}>alertas</Text>
          </View>
        </View>
      </View>
    ),
    [searchQuery, stats, theme, emergencyColors, assistanceColors, styles]
  );

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.contactAccent]}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Text style={styles.emptyText}>No se encontraron alertas.</Text>
          </View>
        }
      />
    </View>
  );
}