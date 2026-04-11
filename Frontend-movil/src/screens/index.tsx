import { View, Text, TouchableOpacity } from "react-native";
import { useIndexViewModel } from "./useIndexViewModel";

export default function Index() {
  const vm = useIndexViewModel();

  return (
    <View
      style={{
        backgroundColor: "black",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white" }}>Bienvenido (pantalla de prueba)</Text>

      <TouchableOpacity onPress={vm.entrarComoDemo}>
        <Text
          style={{
            color: "white",
            marginTop: 30,
            borderRadius: 20,
            borderColor: "white",
            borderWidth: 3,
            padding: 10,
            backgroundColor: "purple",
          }}
        >
          Entrar como demo (home)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={vm.irAlLogin}>
        <Text
          style={{
            color: "white",
            marginTop: 30,
            borderRadius: 20,
            borderColor: "white",
            borderWidth: 3,
            padding: 10,
            backgroundColor: "purple",
          }}
        >
          Ir a login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
