import { View, Text, TouchableOpacity ,Image} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "./activacionStyle";
import { useEffect, useState } from "react";
import { MaterialIcons } from '@expo/vector-icons';

export default function Activacion() {
  const navigation = useNavigation<any>();
  const [contador, setContador] = useState(3);

  useEffect(() => {
    if (contador > 0) {
      const timer = setTimeout(() => setContador(contador - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      console.log("🚨 ALERTA ENVIADA");
    }
  }, [contador]);

  return (
    <View style={styles.contenedorPrincipal}>
      <View style={styles.card}>
        
        {/* LOGO*/}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/imagesAlertaMujer/LOGO.png")}
            style={styles.logo}
          />
        </View>

        {/* CONTADOR */}
        <View style={styles.moduloContador}>
          <View style={styles.circulo}>
            <Text style={styles.numero}>{contador}</Text>
          </View>
          <Text style={styles.textoEstado}>Activando Alerta SOS...</Text>
        </View>

        {/*  LISTA DE ACCIONES */}

        <View style={styles.lista}>
          <View style={styles.itemFila}>
            <View style={styles.iconoFondo}><MaterialIcons name="location-on" size={18} color="#7B2CBF" /></View>
            <Text style={styles.itemTexto}>Enviando ubicación en tiempo real</Text>
          </View>
          <View style={styles.itemFila}>
            <View style={styles.iconoFondo}><MaterialIcons name="videocam" size={18} color="#7B2CBF" /></View>
            <Text style={styles.itemTexto}>Iniciando grabación de video</Text>
          </View>
          <View style={styles.itemFila}>
            <View style={styles.iconoFondo}><MaterialIcons name="call" size={18} color="#7B2CBF" /></View>
            <Text style={styles.itemTexto}>Llamando a tus contactos elegidos</Text>
          </View>
        </View>

        {/*  BOTONES DE ACCIÓN */}

        <TouchableOpacity 
          style={styles.botonCancelar} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.textoCancelar}>Cancelar Alerta</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  );
}