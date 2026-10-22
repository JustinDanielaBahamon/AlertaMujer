import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ActivityIndicator, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { createActivationMethodsStyles, getHeaderColors } from "../../settings/styles/activationMethods.styles";
import { usePermissionsViewModel } from "../usePermissionsViewModel";

/** "Permissions and protection": what is missing for an alert to work and a button to enable it. */
export default function PermissionsScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createActivationMethodsStyles(theme), [theme]);
  const { text } = getHeaderColors(theme);
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  const { items, readyItems: readyItems, total, loading, activate: activate, health: health, evidence: evidence, goBack } = usePermissionsViewModel();
  const percentage = total > 0 ? Math.round((readyItems / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <StatusBar style={text === "#1a1a1a" ? "dark" : "light"} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={goBack} style={styles.returnBtn} accessibilityRole="button">
            <Ionicons name="arrow-back" size={22} color={text} />
          </TouchableOpacity>
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitleText}>Permisos y protección</Text>
            <Text style={styles.headerSubtitleText}>Lo que necesita la app para protegerte</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="shield-checkmark" size={22} color={text} />
          </View>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {readyItems}/{total} listos
          </Text>
          <View style={styles.barBackground}>
            <View style={[styles.barFill, { width: `${percentage}%` as `${number}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Los marcados como importantes son necesarios para que tus alertas lleguen. Si Android ya no
          deja preguntar, el botón abre los ajustes de AlertaMujer.
        </Text>

        {loading && <ActivityIndicator color={theme.contactAccent} style={{ marginTop: 24 }} />}

        {/* Protection without interruptions: checked with the exits Android records */}
        {!loading && health && (
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <View style={styles.iconWrap}>
                <MaterialIcons
                  name={health.times === 0 ? "verified-user" : "report"}
                  size={22}
                  color={health.times === 0 ? theme.contactAccent : "#C026D3"}
                />
              </View>
              <View style={styles.titleWrap}>
                <Text style={styles.methodTitle}>
                  {health.times === 0
                    ? "Protección sin interrupciones"
                    : `La protección se detuvo ${health.times} ${health.times === 1 ? "vez" : "veces"}`}
                </Text>
                <Text style={{ fontSize: 12, color: theme.contactSubtext }}>Últimos 7 días</Text>
              </View>
            </View>
            {health.explanation ? (
              <>
                <Text style={[styles.methodDescription, { fontWeight: "700" }]}>{health.explanation.title}</Text>
                <Text style={styles.methodDescription}>{health.explanation.fixItem}</Text>
              </>
            ) : (
              <Text style={styles.methodDescription}>
                Tu teléfono no ha cerrado la protección. Lo revisamos cada vez que abres esta pantalla.
              </Text>
            )}
            {health.canFix && (
              <TouchableOpacity
                onPress={health.fix}
                accessibilityRole="button"
                style={{
                  marginTop: 12,
                  alignSelf: "flex-start",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  borderRadius: 20,
                  backgroundColor: theme.contactAccent,
                }}
              >
                <MaterialIcons name="autorenew" size={16} color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>Permitir inicio automático</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!loading &&
          items.map((item) => {
            const ready = item.status?.granted === true;
            const unverified = item.status?.granted === null;
            return (
              <View key={item.id} style={[styles.card, !ready && styles.inactiveCard]}>
                <View style={styles.titleRow}>
                  <View style={styles.iconWrap}>
                    <MaterialIcons name={item.icon as never} size={22} color={theme.contactAccent} />
                  </View>
                  <View style={styles.titleWrap}>
                    <Text style={styles.methodTitle}>{item.title}</Text>
                    {item.critical && !ready && (
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#C026D3" }}>Importante</Text>
                    )}
                  </View>
                  <View style={[styles.statusChip, ready && styles.activeStatusChip]}>
                    <Text style={[styles.chipText, ready && styles.activeChipText]}>
                      {ready ? "Activo" : unverified ? "Revisar" : "Falta"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.methodDescription}>{item.description}</Text>
                {!ready && (
                  <TouchableOpacity
                    onPress={() => activate(item.id)}
                    accessibilityRole="button"
                    style={{
                      marginTop: 12,
                      alignSelf: "flex-start",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      paddingHorizontal: 16,
                      paddingVertical: 9,
                      borderRadius: 20,
                      backgroundColor: theme.contactAccent,
                    }}
                  >
                    <MaterialIcons
                      name={item.status?.canAsk === false || unverified ? "settings" : "check-circle"}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
                      {item.status?.canAsk === false || unverified ? "Abrir ajuste" : "Activar"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

        {/* Automatic evidence: what is recorded when an alert is activated */}
        {!loading && (
          <>
            <Text style={[styles.intro, { fontWeight: "800", letterSpacing: 1.2, fontSize: 12, marginTop: 8 }]}>
              {t.permisos.seccion_evidencias}
            </Text>
            <Text style={styles.intro}>{t.permisos.seccion_evidencias_desc}</Text>
            {[
              { id: "video", icon: "videocam", title: t.ajustes.grabar_video, desc: t.ajustes.grabar_video_desc, status: evidence.video, change: evidence.changeVideo },
              { id: "audio", icon: "mic", title: t.ajustes.grabar_audio, desc: t.ajustes.grabar_audio_desc, status: evidence.audio, change: evidence.changeAudio },
            ].map((g) => (
              <View key={g.id} style={[styles.card, !g.status.enabled && styles.inactiveCard]}>
                <View style={styles.titleRow}>
                  <View style={styles.iconWrap}>
                    <MaterialIcons name={g.icon as never} size={22} color={theme.contactAccent} />
                  </View>
                  <View style={styles.titleWrap}>
                    <Text style={styles.methodTitle}>{g.title}</Text>
                    {g.status.noPermission && (
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#C026D3" }}>{t.permisos.sin_permiso_grabacion}</Text>
                    )}
                  </View>
                  <Switch
                    value={g.status.enabled}
                    onValueChange={g.change}
                    trackColor={{ false: "#ccc", true: theme.contactAccent }}
                    thumbColor="#fff"
                  />
                </View>
                <Text style={styles.methodDescription}>{g.desc}</Text>
                {g.status.noPermission && (
                  <TouchableOpacity
                    onPress={() => g.change(true)}
                    accessibilityRole="button"
                    style={{
                      marginTop: 12,
                      alignSelf: "flex-start",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      paddingHorizontal: 16,
                      paddingVertical: 9,
                      borderRadius: 20,
                      backgroundColor: theme.contactAccent,
                    }}
                  >
                    <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
                    <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>Activar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
