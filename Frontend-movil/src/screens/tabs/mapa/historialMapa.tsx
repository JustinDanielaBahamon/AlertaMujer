import { MaterialIcons } from "@expo/vector-icons";

import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import React, { useState } from "react";

import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import MapView, { Marker } from "react-native-maps";

import { LinearGradient } from "expo-linear-gradient";

import type { MainStackParamList } from "../../../navigation/types";

import { useTheme } from "../../../contexts/ThemeContext";

import { styles } from "./historialMapa.style";

type HistorialRouteProp = RouteProp<
  MainStackParamList,
  "historialMapa"
>;

export default function HistorialMapa() {

  const { theme } = useTheme();

  const route = useRoute<HistorialRouteProp>();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<MainStackParamList>
    >();

  const { ubicacion } = route.params;

  const [fullscreen, setFullscreen] =
    useState(false);

  const fecha = new Date(ubicacion.fecha);

  const horaFormateada =
    fecha.toLocaleTimeString("es-CO", {
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
            Detalle de ubicación
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
                Hoy, {horaFormateada}
              </Text>

              <Text
                style={[
                  styles.cityText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {ubicacion.municipio},{" "}
                {ubicacion.departamento}
              </Text>

              <Text
                style={[
                  styles.coordText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {ubicacion.latitude.toFixed(5)}
                {" , "}
                {ubicacion.longitude.toFixed(5)}
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
                  ubicacion.latitude,

                longitude:
                  ubicacion.longitude,

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
                    ubicacion.latitude,

                  longitude:
                    ubicacion.longitude,
                }}

                title="Ubicación guardada"

                description={
                  ubicacion.direccion
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
                Abrir mapa
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
              label="Fecha y hora"
              value={`Hoy, ${horaFormateada}`}
              theme={theme}
            />

            <InfoRow
              icon="place"
              label="Dirección"
              value={ubicacion.direccion}
              theme={theme}
            />

            <InfoRow
              icon="home"
              label="Barrio"
              value={ubicacion.barrio}
              theme={theme}
            />

            <InfoRow
              icon="location-city"
              label="Municipio"
              value={ubicacion.municipio}
              theme={theme}
            />

            <InfoRow
              icon="public"
              label="País"
              value={ubicacion.pais}
              theme={theme}
            />

            <InfoRow
              icon="my-location"
              label="Latitud"
              value={ubicacion.latitude.toFixed(5)}
              theme={theme}
            />

            <InfoRow
              icon="location-on"
              label="Longitud"
              value={ubicacion.longitude.toFixed(5)}
              theme={theme}
            />

            <InfoRow
              icon="gps-fixed"
              label="Precisión"
              value={ubicacion.precision}
              theme={theme}
            />

            <InfoRow
              icon="check-circle"
              label="Estado"
              value={ubicacion.estado}
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
                ubicacion.latitude,

              longitude:
                ubicacion.longitude,

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
                  ubicacion.latitude,

                longitude:
                  ubicacion.longitude,
              }}

              title="Ubicación guardada"

              description={
                ubicacion.direccion
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
                Cerrar mapa
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