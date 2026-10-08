import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { createAjustesPantallaStyles } from "../styles/ajustesPantalla.styles";

export default function AcercaDeScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { t } = useLocale();
  const styles = useMemo(() => createAjustesPantallaStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  // Se lee de "version" en app.json
  const version = Constants.expoConfig?.version ?? "-";

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
        <Text style={styles.tituloHeader}>{t.acercaDe.titulo_header}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>{t.acercaDe.intro}</Text>

        {/* Versión de la aplicación */}
        <View style={styles.tarjeta}>
          <View style={styles.filaTitulo}>
            <View style={styles.iconoWrap}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={theme.icono}
              />
            </View>
            <Text style={styles.titulo}>{t.acercaDe.version}</Text>
            <Text style={styles.textoHora}>{version}</Text>
          </View>
        </View>

        {/* Términos y condiciones */}
        <TouchableOpacity
          style={styles.tarjeta}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("PoliticaTerminos")}
        >
          <View style={styles.filaTitulo}>
            <View style={styles.iconoWrap}>
              <Ionicons
                name="document-text-outline"
                size={22}
                color={theme.icono}
              />
            </View>
            <Text style={styles.titulo}>{t.acercaDe.terminos}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.icono} />
          </View>
        </TouchableOpacity>

        {/* Política de privacidad */}
        <TouchableOpacity
          style={styles.tarjeta}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("PoliticaPrivacidad")}
        >
          <View style={styles.filaTitulo}>
            <View style={styles.iconoWrap}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={theme.icono}
              />
            </View>
            <Text style={styles.titulo}>{t.acercaDe.politica_privacidad}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.icono} />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
