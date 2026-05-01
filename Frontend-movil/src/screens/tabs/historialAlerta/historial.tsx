import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { styles } from "./historial.style";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, type NavigationProp, type ParamListBase } from "@react-navigation/native";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";
import type { Alerta, EstadoAlerta } from "../../../models/Alerta";


const alertasMock: Alerta[] = [
  { id: "1", tipo: "Emergencia", fecha: "30 Mar, 2026", hora: "14:32", ubicacion: "Neiva, Huila",   estado: "Enviada" as EstadoAlerta   },
  { id: "2", tipo: "Asistencia", fecha: "29 Mar, 2026", hora: "20:10", ubicacion: "Campoalegre",    estado: "Cancelada" as EstadoAlerta },
  { id: "3", tipo: "Emergencia", fecha: "28 Mar, 2026", hora: "09:15", ubicacion: "Neiva, Huila",   estado: "Enviada" as EstadoAlerta   },
  { id: "4", tipo: "Asistencia", fecha: "27 Mar, 2026", hora: "18:40", ubicacion: "Palermo, Huila", estado: "Cancelada" as EstadoAlerta },
];

export default function Historial() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [busqueda, setBusqueda]                     = useState("");
  const [alertasFiltradas, setAlertasFiltradas]     = useState(alertasMock);
  const [refrescando, setRefrescando]               = useState(false);

  const onRefresh = useCallback(async () => {
    setRefrescando(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setAlertasFiltradas(alertasMock);
      setBusqueda("");
    } catch (error) {
      console.error("Error al refrescar:", error);
    } finally {
      setRefrescando(false);
    }
  }, []);

  const handleSearch = (text: string) => {
    setBusqueda(text);
    const filtrados = alertasMock.filter((item) => {
      const itemData = `${item.fecha} ${item.hora} ${item.ubicacion} ${item.estado} ${item.tipo}`.toLowerCase();
      return itemData.includes(text.toLowerCase());
    });
    setAlertasFiltradas(filtrados);
  };

  const irADetalle = (alerta: typeof alertasMock[0]) => {
    const main = getMainStackNavigation(navigation);
    main?.navigate("DetalleAlerta", { alerta });
  };

  // Estadísticas calculadas desde los datos
  const stats = useMemo(() => ({
    total:      alertasMock.length,
    enviadas:   alertasMock.filter(a => a.estado === "Enviada").length,
    canceladas: alertasMock.filter(a => a.estado === "Cancelada").length,
    enCurso:    alertasMock.filter(a => a.estado === "En curso").length,
  }), []);

  const renderItem = ({ item }: any) => {
    const esEmergencia = item.tipo === "Emergencia";
    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => irADetalle(item)}
        activeOpacity={0.85}
      >
        <View style={styles.card}>

          {/* COLUMNA IZQUIERDA */}
          <View style={styles.columnaIzquierda}>
            <View style={[
              styles.contenedorIcono,
              { backgroundColor: esEmergencia ? "#EEEBFF" : "#FFEBEE" }
            ]}>
              <Image
                source={require("../../../../assets/imagesAlertaMujer/ScHistorial/ubicacion.png")}
                style={[styles.icono, { tintColor: esEmergencia ? "#4A148C" : "#D32F2F" }]}
              />
            </View>
            <View style={styles.lineaDecorativa} />
          </View>

          {/* COLUMNA DERECHA */}
          <View style={styles.columnaDerecha}>
            <View style={styles.filaEncabezado}>
              <Text style={[styles.tipo, { color: esEmergencia ? "#4A148C" : "#C62828" }]}>
                {item.tipo}
              </Text>
              <View style={styles.filaHora}>
                <MaterialIcons name="access-time" size={13} color="#9e83cf" />
                <Text style={styles.horaAbajo}>{item.hora}</Text>
              </View>
            </View>

            <Text style={styles.textoFecha}>
              <MaterialIcons name="event" size={12} color="#757575" /> {item.fecha}
            </Text>

            <View style={styles.filaUbicacionFlecha}>
              <Text style={styles.textoUbicacion}>
                <MaterialIcons name="place" size={12} color="#757575" /> {item.ubicacion}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color="#BBBBBB" />
            </View>

            <View style={[
              styles.badgeEstado,
              item.estado === "Cancelada" ? styles.bgCancelado : styles.bgEnviado,
            ]}>
              <Text style={[
                styles.estado,
                item.estado === "Cancelada" ? { color: "#D32F2F" } : { color: "#6A1B9A" },
              ]}>
                {item.estado.toUpperCase()}
              </Text>
            </View>
          </View>

        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = useMemo(() => (
    <View>
      {/* HEADER GRADIENTE */}
      <View style={styles.Header}>
        <LinearGradient
          colors={["rgb(202,171,222)", "rgb(123, 29, 178)"]}
          start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.Gradiente}
        >
          <View style={styles.HeaderContenido}>
            <View style={{ flex: 1 }}>
              <Text style={styles.TituloHeader}>Historial de Alertas</Text>
              <Text style={styles.SubtituloHeader}>
                Consulta el registro de tus alertas y su estado actual.
              </Text>
            </View>
            <Image
              source={require("../../../../assets/imagesAlertaMujer/ScHistorial/historial.png")}
              style={{ width: 100, height: 76, resizeMode: "cover" }}
            />
          </View>
        </LinearGradient>
      </View>

      {/* BUSCADOR */}
      <View style={styles.contenedorBusqueda}>
        <MaterialIcons name="search" size={20} color="#9e83cf" style={styles.iconoBusqueda} />
        <TextInput
          style={styles.inputBusqueda}
          placeholder="Buscar por fecha, lugar o estado..."
          placeholderTextColor="#999"
          value={busqueda}
          onChangeText={handleSearch}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <MaterialIcons name="close" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* ESTADÍSTICAS */}
      <View style={styles.tarjetaEstadisticas}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={[styles.statNumero, { color: "#2D1B4E" }]}>{stats.total}</Text>
          <Text style={styles.statSublabel}>alertas</Text>
        </View>
        <View style={styles.separadorStat} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: "#2E7D32" }]}>Enviadas</Text>
          <Text style={[styles.statNumero, { color: "#2E7D32" }]}>{stats.enviadas}</Text>
          <Text style={styles.statSublabel}>alertas</Text>
        </View>
        <View style={styles.separadorStat} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: "#C62828" }]}>Canceladas</Text>
          <Text style={[styles.statNumero, { color: "#C62828" }]}>{stats.canceladas}</Text>
          <Text style={styles.statSublabel}>alertas</Text>
        </View>
        <View style={styles.separadorStat} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: "#6A1B9A" }]}>En curso</Text>
          <Text style={[styles.statNumero, { color: "#6A1B9A" }]}>{stats.enCurso}</Text>
          <Text style={styles.statSublabel}>alertas</Text>
        </View>
      </View>

    </View>
  ), [busqueda, stats]);

  return (
    <View style={styles.ContenedorPrincipal}>
      <FlatList
        data={alertasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            colors={["#500092"]}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Text style={styles.textoNoResultados}>No se encontraron alertas.</Text>
          </View>
        }
      />
    </View>
  );
}