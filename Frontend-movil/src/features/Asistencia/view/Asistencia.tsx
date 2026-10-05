import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Linking, Platform } from 'react-native';
import { styles } from '../style/Asistencia.style';
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from "../../../../src/contexts/ThemeContext";
import { useLocale } from "../../../../src/contexts/LocaleContext";
import { getRecursosEmergencia, type EmergencyResourceApi } from '../../../../src/services/resources.service';

export default function Asistencia() {
  const { theme } = useTheme();
  const { t } = useLocale();

  const [recursos, setRecursos] = useState<EmergencyResourceApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setCargando(true);
        setError(null);
        const data = await getRecursosEmergencia();
        if (mounted) setRecursos(data.filter((r) => r.isActive !== false));
      } catch (err) {
        console.error('Error al cargar recursos:', err);
        if (mounted) setError('No se pudieron cargar los canales de asistencia');
      } finally {
        if (mounted) setCargando(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const recursoEmergencia = recursos.find(
    (r) => r.resourceType === 'emergency_line' && r.telephone === '123'
  ) ?? recursos.find((r) => r.resourceType === 'emergency_line');

  const recursoViolencia = recursos.find(
    (r) => (r.name || '').toLowerCase().includes('púrpura') ||
           (r.name || '').toLowerCase().includes('purpura') ||
           (r.description || '').toLowerCase().includes('violenc')
  );

  const recursoSaludMental = recursos.find((r) => r.resourceType === 'health_center');

  const recursoDefensoria = recursos.find(
    (r) => (r.name || '').toLowerCase().includes('defensor') && !!r.telephone
  );

  const llamar = (numero: string) => {
    const url = Platform.OS === 'android' ? `tel:${numero}` : `telprompt:${numero}`;
    Linking.openURL(url).catch(err => console.error("Error al llamar", err));
  };

  const gradienteHeader: [string, string]     = [theme.headercolor1, theme.headercolor2];
  const gradienteEmergencia: [string, string] = theme.asistenciaEmergenciaGradiente;
  const gradienteDefensoria: [string, string] = [theme.headercolor1, theme.headercolor2];
  const gradienteViolencia                    = theme.asistenciaViolenciaGradiente;
  const gradienteMental                       = theme.asistenciaMentalGradiente;
  const iconoUserBg                           = theme.asistenciaIconoUserBg;
  const iconoBombilloBg                       = theme.asistenciaIconoBombilloBg;
  const iconoBombilloColor                    = theme.asistenciaIconoBombilloColor;
  const iconoEstrellaBg                       = theme.asistenciaIconoEstrellaBg;

  return (
    <View style={[styles.ContenedorPrincipal, { backgroundColor: theme.background }]}>

      {/* HEADER */}
      <View style={styles.Header}>
        <LinearGradient
          colors={gradienteHeader}
          start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.Gradiente}
        >
          <View style={styles.HeaderContenido}>
            <View style={{ flex: 1 }}>
              <Text style={styles.TituloHeader}>{t.asistencia.titulo}</Text>
              <Text style={styles.SubtituloHeader}>
                {t.asistencia.canales}
              </Text>
            </View>
            <View>
              <Image
                source={require("@assets/imagesAlertaMujer/ScAsistencia/asistencia.png")}
                style={{ width: 100, height: 76, resizeMode: 'cover' }}
              />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* CONTENIDO SCROLLABLE */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        bounces={false}
        overScrollMode="never"
      >
        <View style={styles.ContenedorCuadros}>

          {cargando && (
            <Text style={{ color: theme.text, textAlign: 'center' }}>Cargando canales...</Text>
          )}
          {error && (
            <Text style={{ color: '#E74C3C', textAlign: 'center' }}>{error}</Text>
          )}

          {/* EMERGENCIA */}
          {recursoEmergencia && (
          <LinearGradient
            colors={gradienteEmergencia}
            start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ borderRadius: 22, padding: 20, marginBottom: 15 }}
          >
            <Text style={{ color: 'white', fontSize: 21, fontWeight: '600' }}>
              {t.asistencia.emergencia_titulo}
            </Text>
            <Text style={{ color: 'white', fontSize: 42, fontWeight: 'bold', marginVertical: 2 }}>
              {recursoEmergencia.telephone}
            </Text>
            <Text style={{ color: 'white', fontSize: 14, marginBottom: 15 }}>
              {recursoEmergencia.description || t.asistencia.emergencia_desc}
            </Text>
            <TouchableOpacity onPress={() => llamar(recursoEmergencia.telephone!)} style={styles.BotonPolicia}>
              <View style={styles.LlamarIcono}>
                <Feather name="phone" size={20} color="white" />
                <Text style={styles.llamarTexto}>{t.asistencia.llamar_ahora}</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
          )}

          {/* SECCIÓN DOBLE: VIOLENCIA Y SALUD MENTAL */}
          <View style={styles.SegundaSeccion}>

            {recursoViolencia && (
            <LinearGradient
              colors={gradienteViolencia}
              start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }}
              style={styles.ContenedorViolencia}
            >
              <View style={[styles.iconoUser, { backgroundColor: iconoUserBg }]}>
                <Feather name="user" size={24} color="white" />
              </View>
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>{recursoViolencia.name || t.asistencia.violencia}</Text>
              <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>{recursoViolencia.telephone}</Text>
              <Text style={{ color: 'white', fontSize: 12, marginBottom: 15, height: 40 }}>
                {recursoViolencia.description || t.asistencia.violencia_desc}
              </Text>
              <TouchableOpacity onPress={() => llamar(recursoViolencia.telephone!)} style={styles.llamarViolencia}>
                <Text style={styles.llamadaSegundaSeccion}>{t.asistencia.llamar}</Text>
              </TouchableOpacity>
            </LinearGradient>
            )}

            {recursoSaludMental && (
            <LinearGradient
              colors={gradienteMental}
              start={{ x: 1, y: 0 }} end={{ x: 1, y: 2 }}
              style={styles.ContenedorMental}
            >
              <View style={[styles.iconoBombillo, { backgroundColor: iconoBombilloBg }]}>
                <MaterialIcons name="lightbulb-outline" size={26} color={iconoBombilloColor} />
              </View>
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>{recursoSaludMental.name || t.asistencia.salud_mental}</Text>
              <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>{recursoSaludMental.telephone}</Text>
              <Text style={{ textAlign: 'right', color: 'white', fontSize: 12, marginBottom: 15, height: 40 }}>
                {recursoSaludMental.description || t.asistencia.salud_desc}
              </Text>
              <TouchableOpacity onPress={() => llamar(recursoSaludMental.telephone!)} style={styles.llamarMental}>
                <Text style={styles.llamadaSegundaSeccion}>{t.asistencia.llamar}</Text>
              </TouchableOpacity>
            </LinearGradient>
            )}

          </View>

          {/* TERCERA SECCIÓN: DEFENSORÍA */}
          {recursoDefensoria && (
          <View style={styles.TerceraSeccion}>
            <LinearGradient
              colors={gradienteDefensoria}
              start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ borderRadius: 22, padding: 15 }}
            >
              <View style={styles.ContenedorPueblo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={[styles.iconoEstrella, { backgroundColor: iconoEstrellaBg }]}>
                    <Feather name="star" size={22} color="orange" />
                  </View>
                  <View>
                    <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                      {recursoDefensoria.name || t.asistencia.defensoria}
                    </Text>
                    <Text style={{ color: 'white', fontSize: 13 }}>{recursoDefensoria.telephone}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => llamar(recursoDefensoria.telephone!)}
                  style={[styles.llamarMental, { width: 80 }]}
                >
                  <Text style={styles.llamadaSegundaSeccion}>{t.asistencia.llamar}</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
}