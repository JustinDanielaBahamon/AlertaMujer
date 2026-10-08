import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { createAjustesPantallaStyles } from "../styles/ajustesPantalla.styles";

export default function RetencionDatosScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { t } = useLocale();
  const styles = useMemo(() => createAjustesPantallaStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const secciones = [
    {
      id: "ubicaciones",
      icono: "location-outline",
      titulo: t.retencion.ubicaciones_titulo,
      descripcion: t.retencion.ubicaciones_desc,
    },
    {
      id: "evidencias",
      icono: "videocam-outline",
      titulo: t.retencion.evidencias_titulo,
      descripcion: t.retencion.evidencias_desc,
    },
    {
      id: "perfil",
      icono: "person-outline",
      titulo: t.retencion.perfil_titulo,
      descripcion: t.retencion.perfil_desc,
    },
  ];

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
        <Text style={styles.tituloHeader}>{t.retencion.titulo_header}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>{t.retencion.intro}</Text>

        {secciones.map((s) => (
          <View key={s.id} style={styles.tarjeta}>
            <View style={styles.filaTitulo}>
              <View style={styles.iconoWrap}>
                <Ionicons name={s.icono as any} size={22} color={theme.icono} />
              </View>
              <Text style={styles.titulo}>{s.titulo}</Text>
            </View>
            <Text style={styles.descripcion}>{s.descripcion}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
