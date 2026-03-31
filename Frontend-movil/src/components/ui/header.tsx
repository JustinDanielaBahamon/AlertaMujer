  
import { Image, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../../app/(tabs)/contactos.styles";

export default function Header() {
  return (
    <View style={styles.ContenedorLogo}>
      
      {/* Botón menú */}
      <TouchableOpacity>
        <Text style={{ fontSize: 30 }}>≡</Text>
      </TouchableOpacity>

      {/* Logo */}
      <Image 
        source={require('../../../assets/imagesAlertaMujer/logoAlertaMujer.png')} 
        style={styles.ImagenLogo}
      />
      
    </View>
  );
}