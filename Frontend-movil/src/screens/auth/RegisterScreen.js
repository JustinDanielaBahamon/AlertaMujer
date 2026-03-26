import { View, Text, TextInput, Button } from "react-native";

export default function RegisterScreen() {
  return (
    <View>
      <Text>Registro</Text>
      <TextInput placeholder="Nombre" />
      <TextInput placeholder="Correo" />
      <TextInput placeholder="Contraseña" secureTextEntry />
      <Button title="Registrarse" onPress={() => {}} />
    </View>
  );
}