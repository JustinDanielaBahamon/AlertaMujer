import { View, Text, FlatList, Image } from "react-native";

import { styles } from "./historial.style";



 {/* esto son datos falsos para ver como queda en el historial de alerta- en si es un array*/}
const alertasMock = [
  {
    id: "1",
    tipo: "Emergencia",
    fecha: "2026-03-30",
    hora: "14:32",
    ubicacion: "Neiva",
    estado: "Enviada",
  },
  {
    id: "2",
    tipo: "Emergencia",
    fecha: "2026-03-29",
    hora: "20:10",
    ubicacion: "Campoalegre",
    estado: "Cancelada",
  },
];


export default function Historial() {

  // Función que renderiza cada alerta dentro del FlatList
  // Recibe un objeto "item" que representa una alerta del array alertasMock
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>

      <View style={styles.columnaIzquierda}>
        <Image
          source={require("../../../assets/imagesAlertaMujer/ScHistorial/ubicacion.png")}
          style={styles.icono}
        />
      </View>

      <View style={styles.columnaDerecha}>
        <Text style={styles.tipo}>{item.tipo}</Text> 
        {/*Este bloque muestra la informacion de cada alerta usando los "item" que vienen del array{*/}

        <Text style={styles.texto}>
          {item.fecha} - {item.hora}
        </Text>

        <Text style={styles.texto}>{item.ubicacion}</Text>

        <Text
          style={[
            styles.estado,
            item.estado === "Cancelada"
              ? { color: "red" }
              : { color: "#6A1B9A" },
          ]}
        >
          Estado: {item.estado}
        </Text>
      </View>

    </View>
  );

  return (
    <View style={styles.ContenedorPrincipal}>


      <Text style={styles.titulo}>Historial de Alertas</Text>
       
      {/*// FlatList se usa para renderizar listas de forma eficiente,
        mostrando solo los elementos visibles y cargando más al hacer scroll.*/}
      <FlatList
        data={alertasMock}
        keyExtractor={(item) => item.id} // es la encargada de obtener una clave unica por cada elemento
        renderItem={renderItem} //es la funcion que define como se muestra cada alerta en la lista 
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10 }}// esto agrega un espacio interno a toda la lista 
      />

    </View>
  );
}