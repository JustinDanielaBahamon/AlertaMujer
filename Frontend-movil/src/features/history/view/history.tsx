import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect, useIsFocused, type NavigationProp, type ParamListBase } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useAuth } from "../../../contexts/AuthContext";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";
import type { AlertRecord } from "../models/AlertRecord";
import { createStyles, getAssistanceColors, getEmergencyColors } from "../style/history.style";
import { getAlertsByUser, transformAlert } from "../../../services/alerts.service";

export default function HistoryTab() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Colors by type derived from the active theme
  const emergencyColors = useMemo(() => getEmergencyColors(theme), [theme]);
  const assistanceColors = useMemo(() => getAssistanceColors(theme), [theme]);

  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [searchQuery, setSearchQuery]           = useState("");
  const [filteredAlerts, setFilteredAlerts]     = useState<AlertRecord[]>([]);
  const [refreshing, setRefreshing]             = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    if (!user?.id) {
      setFilteredAlerts([]);
      setError("No hay usuario autenticated");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const apiAlerts = await getAlertsByUser(user.id);
      const transformedAlerts = apiAlerts.map(transformAlert);
      setFilteredAlerts(transformedAlerts);
    } catch (error) {
      console.error("Error al cargar alertas:", error);
      setError("Error al cargar alertas. Verifica tu conexión.");
      setFilteredAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load on mount and every time the screen gets focus (to see alerts created elsewhere).
  const isFocused = useIsFocused();
  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [loadAlerts]),
  );

  // Fallback: reload when the component is mounted and becomes visible.
  useEffect(() => {
    if (isFocused) {
      loadAlerts();
    }
  }, [isFocused, loadAlerts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAlerts();
      setSearchQuery("");
    } catch (error) {
      console.error("Error al refrescar:", error);
    } finally {
      setRefreshing(false);
    }
  }, [loadAlerts]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      loadAlerts();
      return;
    }
    const filtered = filteredAlerts.filter((item) => {
      const itemData =
        `${item.date} ${item.time} ${item.location} ${item.status} ${item.type}`.toLowerCase();
      return itemData.includes(text.toLowerCase());
    });
    setFilteredAlerts(filtered);
  };

  const goToDetail = (alert: AlertRecord) => {
    const main = getMainStackNavigation(navigation);
    main?.navigate("AlertDetail", { alert: alert });
  };

  const stats = useMemo(
    () => ({
      total:     filteredAlerts.length,
      sent:      filteredAlerts.filter((a) => a.status === "Enviada").length,
      cancelled: filteredAlerts.filter((a) => a.status === "Cancelada").length,
      ongoing:   filteredAlerts.filter((a) => a.status === "En curso").length,
    }),
    [filteredAlerts]
  );

  // ─── Render of each card ──────────────────────────────────────────────────

  const renderItem = ({ item }: { item: AlertRecord }) => {
    const isEmergency = item.type === "Emergencia";
    const colors = isEmergency ? emergencyColors : assistanceColors;

    // Status: "Sent" shares colors with emergency / "Cancelled" with assistance
    const badgeBg   = item.status === "Cancelada" ? assistanceColors.badgeBg   : emergencyColors.badgeBg;
    const badgeText = item.status === "Cancelada" ? assistanceColors.badgeText : emergencyColors.badgeText;

    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => goToDetail(item)}
        activeOpacity={0.85}
      >
        <View style={[styles.card, { borderLeftColor: colors.border }]}>

          {/* ── LEFT COLUMN ── */}
          <View style={styles.leftColumn}>
            <View style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}>
              <Image
                source={require("../../../../assets/imagesAlertaMujer/ScHistorial/ubicacion.png")}
                style={[styles.icon, { tintColor: colors.iconTint }]}
              />
            </View>
            <View style={[styles.decorativeLine, { backgroundColor: colors.line + "55" }]} />
          </View>

          {/* ── RIGHT COLUMN ── */}
          <View style={styles.rightColumn}>

            {/* Header: type + time */}
            <View style={styles.headerRow}>
              <View style={styles.typePill}>
                <Text style={[styles.alertType, { color: colors.text }]}>
                  {item.type}
                </Text>
              </View>
              <View style={styles.timeRow}>
                <MaterialIcons name="access-time" size={13} color={colors.time} />
                <Text style={[styles.timeText, { color: colors.time }]}>{item.time}</Text>
              </View>
            </View>

            {/* Date */}
            <Text style={styles.dateText}>
              <MaterialIcons name="event" size={12} color={theme.contactSubtext} />{" "}
              {item.date}
            </Text>

            {/* Location + arrow */}
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>
                <MaterialIcons name="place" size={12} color={theme.contactSubtext} />{" "}
                {item.location}
              </Text>
              <MaterialIcons name="chevron-right" size={22} color={theme.contactSubtext} />
            </View>

            {/* Status badge */}
            <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.statusText, { color: badgeText }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>

          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── List header ──────────────────────────────────────────────────────────

  const ListHeader = useMemo(
    () => (
      <View>
        {/* GRADIENT HEADER */}
        <View style={styles.header}>
          <LinearGradient
            colors={[theme.headercolor1, theme.headercolor2]}
            start={{ x: 1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, { paddingTop: insets.top + 20 }]}
          >
            <View style={styles.headerContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>{t.historial.titulo}</Text>
                <Text style={styles.headerSubtitle}>
                  {t.historial.subtitulo}
                </Text>
              </View>
              <Image
                source={require("@assets/imagesAlertaMujer/ScHistorial/historial.png")}
                style={{ width: 100, height: 76, resizeMode: "cover" }}
              />
            </View>
          </LinearGradient>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color={theme.contactAccent}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t.historial.buscar}
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

        {/* STATISTICS */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t.historial.stats_total}</Text>
            <Text style={[styles.statNumber, { color: theme.text }]}>{stats.total}</Text>
            <Text style={styles.statSublabel}>{t.historial.stats_alertas}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: emergencyColors.text }]}>{t.historial.stats_enviadas}</Text>
            <Text style={[styles.statNumber, { color: emergencyColors.text }]}>{stats.sent}</Text>
            <Text style={styles.statSublabel}>{t.historial.stats_alertas}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: assistanceColors.text }]}>{t.historial.stats_canceladas}</Text>
            <Text style={[styles.statNumber, { color: assistanceColors.text }]}>{stats.cancelled}</Text>
            <Text style={styles.statSublabel}>{t.historial.stats_alertas}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: theme.contactSubtext }]}>{t.historial.stats_en_curso}</Text>
            <Text style={[styles.statNumber, { color: theme.contactSubtext }]}>{stats.ongoing}</Text>
            <Text style={styles.statSublabel}>{t.historial.stats_alertas}</Text>
          </View>
        </View>
      </View>
    ),
    [searchQuery, stats, theme, emergencyColors, assistanceColors, styles, t, insets.top]
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
          loading ? (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Text style={styles.emptyText}>Cargando alertas...</Text>
            </View>
          ) : error ? (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Text style={styles.emptyText}>{error}</Text>
            </View>
          ) : (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Text style={styles.emptyText}>{t.historial.sin_alertas}</Text>
            </View>
          )
        }
      />
    </View>
  );
}