import ScreenHeader from "../../../components/ui/ScreenHeader/ScreenHeader";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  createActivationMethodsStyles,
} from "../styles/activationMethods.styles";
import { useActivationMethodsViewModel } from "../viewModel/useActivationMethodsViewModel";

export default function ActivationMethodsScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const styles = useMemo(() => createActivationMethodsStyles(theme), [theme]);
  const { methods: methods, activeItems: activeItems, total, setMethod: setMethod } =
    useActivationMethodsViewModel();
  const m = t.metodosActivacion;

  const percentage = total > 0 ? Math.round((activeItems / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <ScreenHeader title={m.titulo_header} subtitle={m.subtitulo_header} icon="flash">
          <View style={[styles.summaryRow, { marginTop: 16 }]}>
            <Text style={styles.summaryText}>
              {activeItems}/{total} {m.resumen_activos}
            </Text>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  { width: `${percentage}%` as `${number}%` },
                ]}
              />
            </View>
          </View>
      </ScreenHeader>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>{m.intro}</Text>

        {methods.map((method) => (
          <View
            key={method.id}
            style={[styles.card, !method.enabled && styles.inactiveCard]}
          >
            <View style={styles.titleRow}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name={method.icon as any}
                  size={22}
                  color={theme.icon}
                />
              </View>

              <View style={styles.titleWrap}>
                <Text style={styles.methodTitle}>{method.title}</Text>
                <View
                  style={[
                    styles.statusChip,
                    method.enabled && styles.activeStatusChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      method.enabled && styles.activeChipText,
                    ]}
                  >
                    {method.locked ? m.estado_siempre : method.enabled ? m.estado_activo : m.estado_inactivo}
                  </Text>
                </View>
              </View>

              <Switch
                value={method.enabled}
                disabled={method.locked}
                onValueChange={(value) => {
                  if (method.id !== "viaje") setMethod(method.id, value);
                }}
                trackColor={{ false: "#ccc", true: theme.tabActiveColor }}
                thumbColor="#fff"
              />
            </View>

            <Text style={styles.methodDescription}>{method.description}</Text>

            <View style={method.enabled ? styles.steps : styles.inactiveSteps}>
              {method.steps.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step.text}</Text>
                </View>
              ))}
            </View>

            {(!!method.brandRecommendation || !!method.recommendations?.length) && (
              <View style={styles.recommendationsWrap}>
                <View style={styles.recommendationsTitleRow}>
                  <Ionicons name="bulb-outline" size={16} color={theme.icon} />
                  <Text style={styles.recommendationsTitle}>{m.recomendaciones_titulo}</Text>
                </View>
                {!!method.brandRecommendation && (
                  <View style={styles.brandRecommendation}>
                    <Ionicons name="warning-outline" size={16} color="#b45309" />
                    <Text style={styles.brandRecommendationText}>{method.brandRecommendation}</Text>
                  </View>
                )}
                {method.recommendations?.map((text, i) => (
                  <View key={i} style={styles.recommendationRow}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>{text}</Text>
                  </View>
                ))}
              </View>
            )}

            {!!method.action && (
              <TouchableOpacity
                style={styles.methodAction}
                onPress={method.action.onPressed}
                accessibilityRole="button"
              >
                <Ionicons name={method.action.icon as never} size={18} color="#fff" />
                <Text style={styles.methodActionText}>{method.action.text}</Text>
              </TouchableOpacity>
            )}

            {method.pending && (
              <View style={styles.noticeWrap}>
                <Ionicons
                  name="construct-outline"
                  size={16}
                  color={theme.icon}
                />
                <Text style={styles.noticeText}>{m.aviso_pendiente}</Text>
              </View>
            )}
          </View>
        ))}

        <View style={styles.noteWrap}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={theme.icon}
          />
          <Text style={styles.noteText}>{m.nota}</Text>
        </View>
      </ScrollView>
    </View>
  );
}