import { View, Image, TouchableOpacity, Text } from "react-native";
import { styles } from "./header.style";
import { DrawerActions, useNavigation } from "@react-navigation/native";

export default function Header() {
  const navigation = useNavigation<any>();
  
  return (
    <View style={styles.container}>
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>

          {/* ☰ BOTÓN MENU PARA EXPO */}
          <TouchableOpacity 
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          >
            <Text style={{ fontSize: 22 }}>☰</Text>
          </TouchableOpacity>

        </View>
      </View>

      <View>
        <Image
          source={require("../../../../assets/imagesAlertaMujer/logoAlertaMujer.png")}
          style={styles.logo}
        />
      </View>
    </View>
  );
}