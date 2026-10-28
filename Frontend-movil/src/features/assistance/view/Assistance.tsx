import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Linking, Platform } from 'react-native';
import { styles } from '../style/Assistance.style';
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { getEmergencyResources, type EmergencyResourceApi } from '../../../services/resources.service';

export default function Assistance() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();

  const [resources, setResources] = useState<EmergencyResourceApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEmergencyResources();
        if (mounted) setResources(data.filter((r) => r.isActive !== false));
      } catch (err) {
        console.error('Error al cargar recursos:', err);
        if (mounted) setError('No se pudieron cargar los canales de asistencia');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const emergencyResource = resources.find(
    (r) => r.resourceType === 'emergency_line' && r.telephone === '123'
  ) ?? resources.find((r) => r.resourceType === 'emergency_line');

  const violenceResource = resources.find(
    (r) => (r.name || '').toLowerCase().includes('púrpura') ||
           (r.name || '').toLowerCase().includes('purpura') ||
           (r.description || '').toLowerCase().includes('violenc')
  );

  const mentalHealthResource = resources.find((r) => r.resourceType === 'health_center');

  const ombudsmanResource = resources.find(
    (r) => (r.name || '').toLowerCase().includes('defensor') && !!r.telephone
  );

  const call = (number: string) => {
    const url = Platform.OS === 'android' ? `tel:${number}` : `telprompt:${number}`;
    Linking.openURL(url).catch(err => console.error("Error al llamar", err));
  };

  const headerGradient: [string, string]     = [theme.headercolor1, theme.headercolor2];
  const emergencyGradient: [string, string] = theme.assistanceEmergencyGradient;
  const ombudsmanGradient: [string, string] = [theme.headercolor1, theme.headercolor2];
  const violenceGradient                    = theme.assistanceViolenceGradient;
  const mentalGradient                       = theme.assistanceMentalGradient;
  const userIconBg                           = theme.assistanceUserIconBg;
  const bulbIconBg                       = theme.assistanceBulbIconBg;
  const bulbIconColor                    = theme.assistanceBulbIconColor;
  const starIconBg                       = theme.assistanceStarIconBg;

  return (
    <View style={[styles.MainContainer, { backgroundColor: theme.background }]}>

      {/* HEADER */}
      <View style={styles.Header}>
        <LinearGradient
          colors={headerGradient}
          start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.Gradient, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.HeaderContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.HeaderTitle}>{t.asistencia.titulo}</Text>
              <Text style={styles.HeaderSubtitle}>
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

      {/* SCROLLABLE CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        bounces={false}
        overScrollMode="never"
      >
        <View style={styles.BoxesContainer}>

          {loading && (
            <Text style={{ color: theme.text, textAlign: 'center' }}>Cargando canales...</Text>
          )}
          {error && (
            <Text style={{ color: '#E74C3C', textAlign: 'center' }}>{error}</Text>
          )}

          {/* EMERGENCY */}
          {emergencyResource && (
          <LinearGradient
            colors={emergencyGradient}
            start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ borderRadius: 22, padding: 20, marginBottom: 15 }}
          >
            <Text style={{ color: 'white', fontSize: 21, fontWeight: '600' }}>
              {t.asistencia.emergencia_titulo}
            </Text>
            <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold', marginVertical: 2 }}>
              {emergencyResource.telephone}
            </Text>
            <Text style={{ color: 'white', fontSize: 14, marginBottom: 15 }}>
              {emergencyResource.description || t.asistencia.emergencia_desc}
            </Text>
            <TouchableOpacity onPress={() => call(emergencyResource.telephone!)} style={styles.PoliceButton}>
              <View style={styles.CallIcon}>
                <Feather name="phone" size={20} color="white" />
                <Text style={styles.callText}>{t.asistencia.llamar_ahora}</Text>
              </View>
            </TouchableOpacity>
          </LinearGradient>
          )}

          {/* DOUBLE SECTION: VIOLENCE AND MENTAL HEALTH */}
          <View style={styles.SecondSection}>

            {violenceResource && (
            <LinearGradient
              colors={violenceGradient}
              start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }}
              style={styles.ViolenceContainer}
            >
              <View style={[styles.userIcon, { backgroundColor: userIconBg }]}>
                <Feather name="user" size={24} color="white" />
              </View>
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>{violenceResource.name || t.asistencia.violencia}</Text>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }} numberOfLines={1} adjustsFontSizeToFit>{violenceResource.telephone}</Text>
              <Text style={{ color: 'white', fontSize: 12, marginBottom: 15, height: 40 }}>
                {violenceResource.description || t.asistencia.violencia_desc}
              </Text>
              <TouchableOpacity onPress={() => call(violenceResource.telephone!)} style={styles.callViolenceLine}>
                <Text style={styles.secondSectionCall}>{t.asistencia.llamar}</Text>
              </TouchableOpacity>
            </LinearGradient>
            )}

            {mentalHealthResource && (
            <LinearGradient
              colors={mentalGradient}
              start={{ x: 1, y: 0 }} end={{ x: 1, y: 2 }}
              style={styles.MentalContainer}
            >
              <View style={[styles.bulbIcon, { backgroundColor: bulbIconBg }]}>
                <MaterialIcons name="lightbulb-outline" size={26} color={bulbIconColor} />
              </View>
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>{mentalHealthResource.name || t.asistencia.salud_mental}</Text>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }} numberOfLines={1} adjustsFontSizeToFit>{mentalHealthResource.telephone}</Text>
              <Text style={{ textAlign: 'right', color: 'white', fontSize: 12, marginBottom: 15, height: 40 }}>
                {mentalHealthResource.description || t.asistencia.salud_desc}
              </Text>
              <TouchableOpacity onPress={() => call(mentalHealthResource.telephone!)} style={styles.callMentalHealth}>
                <Text style={styles.secondSectionCall}>{t.asistencia.llamar}</Text>
              </TouchableOpacity>
            </LinearGradient>
            )}

          </View>

          {/* THIRD SECTION: OMBUDSMAN */}
          {ombudsmanResource && (
          <View style={styles.ThirdSection}>
            <LinearGradient
              colors={ombudsmanGradient}
              start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ borderRadius: 22, padding: 15 }}
            >
              <View style={styles.TownContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={[styles.starIcon, { backgroundColor: starIconBg }]}>
                    <Feather name="star" size={22} color="orange" />
                  </View>
                  <View>
                    <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                      {ombudsmanResource.name || t.asistencia.defensoria}
                    </Text>
                    <Text style={{ color: 'white', fontSize: 13 }}>{ombudsmanResource.telephone}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => call(ombudsmanResource.telephone!)}
                  style={[styles.callMentalHealth, { width: 80 }]}
                >
                  <Text style={styles.secondSectionCall}>{t.asistencia.llamar}</Text>
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