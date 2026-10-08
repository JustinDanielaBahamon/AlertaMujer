import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { createAjustesPantallaStyles } from "../styles/ajustesPantalla.styles";

export default function PrivacidadAppScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { t } = useLocale();
  const styles = useMemo(() => createAjustesPantallaStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.btnVolver}
        >
          <Ionicons name="arrow-back" size={22} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>{t.privacidadApp.titulo_header}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>{t.privacidadApp.intro}</Text>

        {/* 1. Política de retención de datos */}
        <TouchableOpacity
          style={styles.tarjeta}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("RetencionDatos")}
        >
          <View style={styles.filaTitulo}>
            <View style={styles.iconoWrap}>
              <Ionicons name="server-outline" size={22} color={theme.icono} />
            </View>
            <Text style={styles.titulo}>
              {t.privacidadApp.retencion_titulo}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.icono} />
          </View>
          <Text style={styles.descripcion}>
            {t.privacidadApp.retencion_desc}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
