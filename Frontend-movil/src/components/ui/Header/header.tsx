  
import { Image, Text, TouchableOpacity, View } from "react-native";


export default function Header() {
  return (
    <View >//styles.ContenedorLogo
      
      {/* Botón menú */}
      <TouchableOpacity>
        <Text style={{ fontSize: 30 }}>≡</Text>
      </TouchableOpacity>

      {/* Logo */}
      <Image 
        source={require('../../../assets/imagesAlertaMujer/logoAlertaMujer.png')} 
      />
      
    </View>
  );
}