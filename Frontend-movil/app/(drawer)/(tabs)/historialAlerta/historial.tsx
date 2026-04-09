import React, { useState, useCallback } from "react"; 
import { View, Text, FlatList, Image, TextInput, RefreshControl, TouchableOpacity, ActivityIndicator } from "react-native";
import { styles } from "./historial.style";
import { MaterialIcons } from '@expo/vector-icons';

const alertasMock = [
  { id: "1", tipo: "Emergencia", fecha: "30 Mar, 2026", hora: "14:32", ubicacion: "Neiva, Huila", estado: "Enviada" },
  { id: "2", tipo: "Asistencia", fecha: "29 Mar, 2026", hora: "20:10", ubicacion: "Campoalegre", estado: "Cancelada" },
];

export default function Historial() {
  const [busqueda, setBusqueda] = useState("");
  const [alertasFiltradas, setAlertasFiltradas] = useState(alertasMock);
  const [refrescando, setRefrescando] = useState(false);

  // --- FUNCIÓN DE RECARGA (Sirve para el gesto y para el botón) ---
  const onRefresh = useCallback(async () => {
    setRefrescando(true); 
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
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
      const textData = text.toLowerCase();
      return itemData.includes(textData);
    });
    setAlertasFiltradas(filtrados);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.columnaIzquierda}>
        <View style={styles.contenedorIcono}>
          <Image
            source={require("../../../../assets/imagesAlertaMujer/ScHistorial/ubicacion.png")}
            style={styles.icono}
          />
        </View>
        <View style={styles.lineaDecorativa} />
      </View>

      <View style={styles.columnaDerecha}>
        <View style={styles.filaEncabezado}>
            <Text style={styles.tipo}>{item.tipo}</Text>
            <Text style={styles.horaAbajo}>{item.hora}</Text>
        </View>
        <Text style={styles.textoFecha}>
          <MaterialIcons name="event" size={12} color="#757575" /> {item.fecha}
        </Text>
        <Text style={styles.textoUbicacion}>
            <MaterialIcons name="place" size={12} color="#757575" /> {item.ubicacion}
        </Text>
        <View style={[
            styles.badgeEstado,
            item.estado === "Cancelada" ? styles.bgCancelado : styles.bgEnviado
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
  );

  return (
    <View style={styles.ContenedorPrincipal}>
      
      {/* --- ENCABEZADO CON TÍTULO Y BOTÓN DE REFRESCAR --- */}
      <View style={styles.filaTitulo}>
        <Text style={styles.titulo}>Historial de Alertas</Text>
        
        <TouchableOpacity 
          onPress={onRefresh} 
          disabled={refrescando}
          style={styles.botonRefrescarHeader}
        >
          {refrescando ? (
            <ActivityIndicator size="small" color="#9e83cf" />
          ) : (
            <MaterialIcons name="refresh" size={30} color="#9e83cf" />
          )}
        </TouchableOpacity>
      </View>

      {/* BARRA DE BÚSQUEDA */}
      <View style={styles.contenedorBusqueda}>
        <MaterialIcons name="search" size={20} color="#9e83cf" style={styles.iconoBusqueda} />
        <TextInput
          style={styles.inputBusqueda}
          placeholder="Buscar por fecha, lugar o estado..."
          placeholderTextColor="#999"
          value={busqueda}
          onChangeText={handleSearch}
        />
      </View>
        
      <FlatList
        data={alertasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            colors={["#500092"]} 
          />
        }
        ListEmptyComponent={
          <Text style={styles.textoNoResultados}>No se encontraron alertas.</Text>
        }
      />
    </View>
  );
}