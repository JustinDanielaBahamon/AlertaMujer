import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation, useRoute, RouteProp, NavigationProp, ParamListBase } from "@react-navigation/native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { MainStackParamList } from "../../../navigation/types";
import { createStyles } from "./detalle.Style";
import { useTheme } from "../../../../src/contexts/ThemeContext";
import { getEmergenciaColors, getAsistenciaColors } from "./historial.style";
import { useDetalleAlertaViewModel } from "../../../../features/historial/useDetalleAlertaViewModel";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";

type DetalleAlertaRouteProp = RouteProp<MainStackParamList, "DetalleAlerta">;

export default function DetalleAlerta() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<DetalleAlertaRouteProp>();
  const { alerta } = route.params;
  const { esEmergencia, compartiendo, compartirReporte } = useDetalleAlertaViewModel(alerta);

  // Colores del tipo de alerta (reutilizando los mismos helpers del historial)
  const emergencyColors  = useMemo(() => getEmergenciaColors(theme), [theme]);
  const assistanceColors = useMemo(() => getAsistenciaColors(theme), [theme]);
  const alertColors      = esEmergencia ? emergencyColors : assistanceColors;

  const irAMapaInterno = () => {
    const main = getMainStackNavigation(navigation);
    main?.navigate("DrawerHome", {
      screen: "Inicio",
      params: {
        screen: "Mapa",
        params: { direccionObjetivo: alerta.ubicacion },
      },
    } as never);
  };

  return (
    <ScrollView
      style={styles.ContenedorPrincipal}
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
    >
      {/* HEADER */}
      <LinearGradient
        colors={[theme.headercolor1, theme.headercolor2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.Gradiente}
      >
        {/* BOTÓN VOLVER */}
        <TouchableOpacity
          style={styles.BotonVolver}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={22} color="white" />
        </TouchableOpacity>

        <View style={styles.HeaderContenido}>
          <View style={[
            styles.IconoTipo,
            { backgroundColor: esEmergencia ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.15)" },
          ]}>
            <MaterialIcons name="place" size={32} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            {/* Tipo con color del tema */}
            <Text style={[styles.TipoTexto, { color: "white" }]}>{alerta.tipo}</Text>
            <View style={styles.BadgeEstado}>
              <View style={[styles.PuntoEstado, { backgroundColor: alertColors.border }]} />
              <Text style={styles.TextoEstado}>{alerta.estado.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* TARJETA FECHA/HORA/DURACIÓN */}
      <View style={styles.TarjetaFecha}>
        <View style={styles.StatItem}>
          <Text style={styles.StatLabel}>Fecha</Text>
          <Text style={styles.StatValor}>{alerta.fecha}</Text>
        </View>
        <View style={styles.Separador} />
        <View style={styles.StatItem}>
          <Text style={styles.StatLabel}>Hora</Text>
          <Text style={styles.StatValor}>{alerta.hora}</Text>
        </View>
        <View style={styles.Separador} />
        <View style={styles.StatItem}>
          <Text style={styles.StatLabel}>Duración</Text>
          <Text style={styles.StatValor}>3 min</Text>
        </View>
      </View>

      <View style={styles.Cuerpo}>

        {/* UBICACIÓN */}
        <Text style={styles.SeccionTitulo}>Ubicación</Text>
        <View style={styles.TarjetaUbicacion}>
          <MaterialIcons name="place" size={20} color={alertColors.iconTint} />
          <View style={{ flex: 1 }}>
            <Text style={styles.UbicacionTexto}>{alerta.ubicacion}</Text>
            <Text style={styles.UbicacionSubtexto}>Colombia</Text>
          </View>
          <TouchableOpacity
            style={[styles.BotonMapa, { backgroundColor: alertColors.badgeBg }]}
            onPress={irAMapaInterno}
          >
            <Text style={[styles.BotonMapaTexto, { color: alertColors.text }]}>Ver mapa</Text>
          </TouchableOpacity>
        </View>

        {/* CONTACTOS NOTIFICADOS */}
        <Text style={styles.SeccionTitulo}>Contactos notificados</Text>
        <View style={styles.TarjetaContacto}>
          <View style={[styles.AvatarContacto, { backgroundColor: alertColors.iconBg }]}>
            <Text style={[styles.AvatarTexto, { color: alertColors.text }]}>JM</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.NombreContacto}>Justin Martínez</Text>
            <Text style={styles.RelacionContacto}>Hermano</Text>
          </View>
          <View style={styles.FilaRecibio}>
            <View style={styles.PuntoVerde} />
            <Text style={styles.TextoRecibio}>Recibió</Text>
          </View>
        </View>

        {/* BOTÓN COMPARTIR */}
        <TouchableOpacity
          style={[
            styles.BotonCompartir,
            { backgroundColor: theme.mode === "dark" ? "#07597a" : alertColors.border },
            compartiendo && { opacity: 0.7 },
          ]}
          onPress={compartirReporte}
          disabled={compartiendo}
        >
          <Feather name="share-2" size={18} color="white" />
          <Text style={styles.BotonCompartirTexto}>
            {compartiendo ? "Compartiendo..." : "Compartir reporte"}
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}