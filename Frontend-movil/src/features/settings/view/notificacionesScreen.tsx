import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { createAjustesPantallaStyles } from "../styles/ajustesPantalla.styles";
import {
    CampoHora,
    PASO_MINUTOS,
    formatearHora,
    useNotificacionesViewModel,
} from "../viewModel/useNotificacionesViewModel";

export default function NotificacionesScreen() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const styles = useMemo(() => createAjustesPantallaStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const {
    config,
    volver,
    cambiarActivadas,
    cambiarVibracion,
    cambiarNoMolestar,
    moverHora,
  } = useNotificacionesViewModel();

  const trackColor = { false: "#ccc", true: theme.tabActiveColor };
  const subOpcionesBloqueadas = !config.activadas;
  const horasBloqueadas = !config.activadas || !config.noMolestar;

  const renderHora = (etiqueta: string, campo: CampoHora) => (
    <View style={[styles.filaHora, horasBloqueadas && styles.deshabilitado]}>
      <Text style={styles.etiquetaHora}>{etiqueta}</Text>
      <View style={styles.selectorHora}>
        <TouchableOpacity
          disabled={horasBloqueadas}
          onPress={() => moverHora(campo, -PASO_MINUTOS)}
          style={styles.btnHora}
        >
          <Ionicons name="remove" size={18} color={theme.icono} />
        </TouchableOpacity>
        <Text style={styles.textoHora}>{formatearHora(config[campo])}</Text>
        <TouchableOpacity
          disabled={horasBloqueadas}
          onPress={() => moverHora(campo, PASO_MINUTOS)}
          style={styles.btnHora}
        >
          <Ionicons name="add" size={18} color={theme.icono} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />

      <View style={styles.header}>
        <TouchableOpacity onPress={volver} style={styles.btnVolver}>
          <Ionicons name="arrow-back" size={22} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>
          {t.notificaciones.titulo_header}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>{t.notificaciones.intro}</Text>

        {/* Activar / desactivar notificaciones */}
        <View style={styles.tarjeta}>
          <View style={styles.filaTitulo}>
            <View style={styles.iconoWrap}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={theme.icono}
              />
            </View>
            <Text style={styles.titulo}>{t.notificaciones.activar}</Text>
            <Switch
              value={config.activadas}
              onValueChange={cambiarActivadas}
              trackColor={trackColor}
              thumbColor="#fff"
            />
          </View>
          <Text style={styles.descripcion}>
            {t.notificaciones.activar_desc}
          </Text>
        </View>

        {/* Vibración */}
        <View
          style={[
            styles.tarjeta,
            subOpcionesBloqueadas && styles.deshabilitado,
          ]}
        >
          <View style={styles.filaTitulo}>
            <View style={styles.iconoWrap}>
              <Ionicons
                name="phone-portrait-outline"
                size={22}
                color={theme.icono}
              />
            </View>
            <Text style={styles.titulo}>{t.notificaciones.vibracion}</Text>
            <Switch
              value={config.vibracion}
              onValueChange={cambiarVibracion}
              disabled={subOpcionesBloqueadas}
              trackColor={trackColor}
              thumbColor="#fff"
            />
          </View>
          <Text style={styles.descripcion}>
            {t.notificaciones.vibracion_desc}
          </Text>
        </View>

        {/* Horas silenciosas (no molestar) */}
        <View
          style={[
            styles.tarjeta,
            subOpcionesBloqueadas && styles.deshabilitado,
          ]}
        >
          <View style={styles.filaTitulo}>
            <View style={styles.iconoWrap}>
              <Ionicons name="moon-outline" size={22} color={theme.icono} />
            </View>
            <Text style={styles.titulo}>{t.notificaciones.no_molestar}</Text>
            <Switch
              value={config.noMolestar}
              onValueChange={cambiarNoMolestar}
              disabled={subOpcionesBloqueadas}
              trackColor={trackColor}
              thumbColor="#fff"
            />
          </View>
          <Text style={styles.descripcion}>
            {t.notificaciones.no_molestar_desc}
          </Text>

          <View style={styles.divisor} />
          {renderHora(t.notificaciones.desde, "horaInicio")}
          {renderHora(t.notificaciones.hasta, "horaFin")}
        </View>
      </ScrollView>
    </View>
  );
}
