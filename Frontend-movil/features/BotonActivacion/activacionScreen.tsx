import { View, Text, TouchableOpacity, Image } from "react-native";
import { styles } from "./activacionStyle";
import { MaterialIcons } from "@expo/vector-icons";
import { useActivacionViewModel } from "./useActivacionViewModel";

export default function Activacion() {
  const vm = useActivacionViewModel();

  return (
    <View style={styles.contenedorPrincipal}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/imagesAlertaMujer/LOGO.png")}
            style={styles.logo}
          />
        </View>

        <View style={styles.moduloContador}>
          <View style={styles.circulo}>
            <Text style={styles.numero}>{vm.contador}</Text>
          </View>
          <Text style={styles.textoEstado}>Activando Alerta SOS...</Text>
        </View>

        <View style={styles.lista}>
          <View style={styles.itemFila}>
            <View style={styles.iconoFondo}>
              <MaterialIcons name="location-on" size={18} color="#7B2CBF" />
            </View>
            <Text style={styles.itemTexto}>Enviando ubicación en tiempo real</Text>
          </View>
          <View style={styles.itemFila}>
            <View style={styles.iconoFondo}>
              <MaterialIcons name="videocam" size={18} color="#7B2CBF" />
            </View>
            <Text style={styles.itemTexto}>Iniciando grabación de video</Text>
          </View>
          <View style={styles.itemFila}>
            <View style={styles.iconoFondo}>
              <MaterialIcons name="call" size={18} color="#7B2CBF" />
            </View>
            <Text style={styles.itemTexto}>Llamando a tus contactos elegidos</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.botonCancelar} onPress={vm.cancelar}>
          <Text style={styles.textoCancelar}>Cancelar Alerta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
