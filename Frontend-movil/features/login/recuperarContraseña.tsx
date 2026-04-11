import { View, Text, TouchableOpacity } from "react-native";
import { useRecuperarContrasenaViewModel } from "./useRecuperarContrasenaViewModel";

export default function RecuperarContrasena() {
  const vm = useRecuperarContrasenaViewModel();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text>Recuperar contraseña</Text>
      <TouchableOpacity onPress={vm.volver} style={{ marginTop: 24 }}>
        <Text style={{ color: "#6A3FC9" }}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
