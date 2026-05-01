import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute, RouteProp, NavigationProp, ParamListBase } from "@react-navigation/native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { MainStackParamList } from "../../../navigation/types";
import { styles } from "./detalle.Style";
import { useDetalleAlertaViewModel } from "../../../../features/historial/useDetalleAlertaViewModel";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";

type DetalleAlertaRouteProp = RouteProp<MainStackParamList, "DetalleAlerta">;

export default function DetalleAlerta() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<DetalleAlertaRouteProp>();
  const { alerta } = route.params;
  const { esEmergencia, compartiendo, compartirReporte } = useDetalleAlertaViewModel(alerta);

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
        colors={["rgb(202,171,222)", "rgb(123, 29, 178)"]}
        start={{ x: 1, y: 0 }}
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
            { backgroundColor: esEmergencia ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.15)" }
          ]}>
            <MaterialIcons name="place" size={32} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.TipoTexto}>{alerta.tipo}</Text>
            <View style={styles.BadgeEstado}>
              <View style={styles.PuntoEstado} />
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
          <MaterialIcons name="place" size={20} color="#7B1DB2" />
          <View style={{ flex: 1 }}>
            <Text style={styles.UbicacionTexto}>{alerta.ubicacion}</Text>
            <Text style={styles.UbicacionSubtexto}>Colombia</Text>
          </View>
          <TouchableOpacity style={styles.BotonMapa} onPress={irAMapaInterno}>
            <Text style={styles.BotonMapaTexto}>Ver mapa</Text>
          </TouchableOpacity>
        </View>

        {/* CONTACTOS NOTIFICADOS */}
        <Text style={styles.SeccionTitulo}>Contactos notificados</Text>
        <View style={styles.TarjetaContacto}>
          <View style={styles.AvatarContacto}>
            <Text style={styles.AvatarTexto}>JM</Text>
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
          style={[styles.BotonCompartir, compartiendo && { opacity: 0.7 }]}
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