import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Linking, Platform } from 'react-native';
import { styles } from '../style/Asistencia.style';
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from "../../../../src/contexts/ThemeContext";
import { useLocale } from "../../../../src/contexts/LocaleContext";
import api from "../../../../src/services/api";

interface EmergencyResource {
  id: number;
  name: string;
  resource_type: string;
  telephone: string;
  secondary_telephone: string;
  email: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  description: string;
  is_active: boolean;
}

export default function Asistencia() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [recursos, setRecursos] = useState<EmergencyResource[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarRecursos();
  }, []);

  const cargarRecursos = async () => {
    try {
      setCargando(true);
      const response = await api.get('/api/resources/emergency-resources');
      setRecursos(response.data);
    } catch (error) {
      console.error('Error cargando recursos:', error);
    } finally {
      setCargando(false);
    }
  };

  const llamar = (numero: string) => {
    const url = Platform.OS === 'android' ? `tel:${numero}` : `telprompt:${numero}`;
    Linking.openURL(url).catch(err => console.error("Error al llamar", err));
  };

  const gradienteHeader: [string, string]     = [theme.headercolor1, theme.headercolor2];

  const recursosPorTipo = recursos.reduce((acc, recurso) => {
    if (!acc[recurso.resource_type]) {
      acc[recurso.resource_type] = [];
    }
    acc[recurso.resource_type].push(recurso);
    return acc;
  }, {} as Record<string, EmergencyResource[]>);

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
        {cargando ? (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: theme.text }}>Cargando recursos...</Text>
          </View>
        ) : (
          Object.entries(recursosPorTipo).map(([tipo, recursosTipo]) => (
            <View key={tipo} style={styles.ContenedorCuadros}>
              {recursosTipo.map((recurso) => (
                <LinearGradient
                  key={recurso.id}
                  colors={theme.asistenciaEmergenciaGradiente}
                  start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 22, padding: 20, marginBottom: 15 }}
                >
                  <Text style={{ color: 'white', fontSize: 21, fontWeight: '600' }}>
                    {recurso.name}
                  </Text>
                  <Text style={{ color: 'white', fontSize: 42, fontWeight: 'bold', marginVertical: 2 }}>
                    {recurso.telephone}
                  </Text>
                  <Text style={{ color: 'white', fontSize: 14, marginBottom: 15 }}>
                    {recurso.description}
                  </Text>
                  <TouchableOpacity onPress={() => llamar(recurso.telephone)} style={styles.BotonPolicia}>
                    <View style={styles.LlamarIcono}>
                      <Feather name="phone" size={20} color="white" />
                      <Text style={styles.llamarTexto}>{t.asistencia.llamar_ahora}</Text>
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
