import { View, Image, TouchableOpacity, Text } from "react-native";
import { styles } from "./header.style";

export default function Header() {

  const cambiarIdioma = () => {
    console.log("Idioma 🌐");
  };

  const cambiarTema = () => {
    console.log("Tema 🎨");
  };

  return (
    <View style={styles.container}>

      {/* Logo */}
      <Image
        source={require("../../../../assets/imagesAlertaMujer/logoAlertaMujer.png")}
        style={styles.logo}
      />

      {/* Acciones */}
      <View style={styles.actions}>

        <TouchableOpacity onPress={cambiarIdioma}>
          <Text style={styles.icono}>🌐</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={cambiarTema}>
          <Text style={styles.icono}>🎨</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}