import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute,} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {Modal,ScrollView,Text,TouchableOpacity,TouchableWithoutFeedback,View,} from "react-native";
import MapView, { Marker } from "../../../components/mapa/MapaLibre";
import { LinearGradient } from "expo-linear-gradient";
import type { MainStackParamList } from "../../../navigation/types";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { styles } from "../styles/historialMapa.style";

type HistoryRouteProp = RouteProp<
  MainStackParamList,
  "HistoryMap"
>;

export default function HistoryMap() {

  const { theme } = useTheme();
  const { t } = useLocale();

  const route = useRoute<HistoryRouteProp>();

  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const { location: location } = route.params;

  const [fullscreen, setFullscreen] =
    useState(false);

  const date = new Date(location.date);

  const formattedTime =
    date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >

        {/* HEADER */}
        <LinearGradient
          colors={[
            theme.headercolor1,
            theme.headercolor2,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons
              name="arrow-back"
              size={26}
              color="#fff"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {t.historialMapa.titulo}
          </Text>
        </LinearGradient>

        {/* CARD */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
            },
          ]}
        >

          {/* INFO SUPERIOR */}
          <View style={styles.topInfo}>

            <View style={styles.iconCircle}>
              <MaterialIcons
                name="location-pin"
                size={34}
                color="#6C2BD9"
              />
            </View>

            <View style={{ flex: 1 }}>

              <Text
                style={[
                  styles.timeText,
                  {
                    color:
                      theme.contactSubtext,
                  },
                ]}
              >
                {t.historialMapa.hoy}, {formattedTime}
              </Text>

              <Text
                style={[
                  styles.cityText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {location.municipality},{" "}
                {location.department}
              </Text>

              <Text
                style={[
                  styles.coordText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {location.latitude.toFixed(5)}
                {" , "}
                {location.longitude.toFixed(5)}
              </Text>

            </View>

          </View>

          {/* MAPA PREVIEW */}
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() =>
              setFullscreen(true)
            }
            style={styles.mapContainer}
          >

            <MapView
              style={styles.map}

              initialRegion={{
                latitude:
                  location.latitude,

                longitude:
                  location.longitude,

                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}

              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}

              pointerEvents="none"
            >
              <Marker
                coordinate={{
                  latitude:
                    location.latitude,

                  longitude:
                    location.longitude,
                }}

                title={t.historialMapa.ubicacion_guardada_marcador}

                description={
                  location.address
                }

                pinColor="#6C2BD9"
              />
            </MapView>

            {/* OVERLAY */}
            <View
              style={{
                position: "absolute",

                bottom: 15,
                right: 15,

                backgroundColor:
                  "rgba(0,0,0,0.65)",

                paddingHorizontal: 14,
                paddingVertical: 8,

                borderRadius: 14,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "700",
                }}
              >
                {t.historialMapa.abrir_mapa}
              </Text>
            </View>

          </TouchableOpacity>

          {/* DETALLES */}
          <View
            style={[
              styles.detailsCard,
              {
                backgroundColor:
                  theme.background,
              },
            ]}
          >

            <InfoRow
              icon="calendar-today"
              label={t.historialMapa.fecha_hora}
              value={`${t.historialMapa.hoy}, ${formattedTime}`}
              theme={theme}
            />

            <InfoRow
              icon="place"
              label={t.historialMapa.direccion}
              value={location.address}
              theme={theme}
            />

            <InfoRow
              icon="home"
              label={t.historialMapa.barrio}
              value={location.neighborhood}
              theme={theme}
            />

            <InfoRow
              icon="location-city"
              label={t.historialMapa.municipio}
              value={location.municipality}
              theme={theme}
            />

            <InfoRow
              icon="public"
              label={t.historialMapa.pais}
              value={location.country}
              theme={theme}
            />

            <InfoRow
              icon="my-location"
              label={t.historialMapa.latitud}
              value={location.latitude.toFixed(5)}
              theme={theme}
            />

            <InfoRow
              icon="location-on"
              label={t.historialMapa.longitud}
              value={location.longitude.toFixed(5)}
              theme={theme}
            />

            <InfoRow
              icon="gps-fixed"
              label={t.historialMapa.precision}
              value={location.precision}
              theme={theme}
            />

            <InfoRow
              icon="check-circle"
              label={t.historialMapa.estado}
              value={location.status}
              theme={theme}
              active
            />

          </View>

        </View>

      </ScrollView>

      {/* MODAL MAPA FULLSCREEN */}
      <Modal
        visible={fullscreen}
        animationType="slide"
      >

        <View style={{ flex: 1 }}>

          <MapView
            style={{ flex: 1 }}

            initialRegion={{
              latitude:
                location.latitude,

              longitude:
                location.longitude,

              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}

            scrollEnabled={true}
            zoomEnabled={true}
            rotateEnabled={true}
            pitchEnabled={true}
          >
            <Marker
              coordinate={{
                latitude:
                  location.latitude,

                longitude:
                  location.longitude,
              }}

              title={t.historialMapa.ubicacion_guardada_marcador}

              description={
                location.address
              }

              pinColor="#6C2BD9"
            />
          </MapView>

          {/* BOTÓN CERRAR */}
          <TouchableWithoutFeedback
            onPress={() =>
              setFullscreen(false)
            }
          >
            <View
              style={{
                position: "absolute",

                top: 60,
                right: 20,

                backgroundColor:
                  "#6C2BD9",

                paddingHorizontal: 20,
                paddingVertical: 12,

                borderRadius: 16,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "700",
                }}
              >
                {t.historialMapa.cerrar_mapa}
              </Text>
            </View>
          </TouchableWithoutFeedback>

        </View>

      </Modal>

    </View>
  );
}

type InfoRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  theme: any;
  active?: boolean;
};

function InfoRow({
  icon,
  label,
  value,
  theme,
  active,
}: InfoRowProps) {

  return (
    <View style={styles.row}>

      <View style={styles.rowLeft}>

        <MaterialIcons
          name={icon}
          size={20}
          color="#6C2BD9"
        />

        <Text
          style={[
            styles.rowLabel,
            {
              color:
                theme.contactSubtext,
            },
          ]}
        >
          {label}
        </Text>

      </View>

      <View style={styles.rowRight}>

        {active && (
          <View style={styles.activeDot} />
        )}

        <Text
          style={[
            styles.rowValue,
            {
              color: theme.text,
            },
          ]}
        >
          {value}
        </Text>

      </View>

    </View>
  );
}