import { View, Text, TextInput, Button } from "react-native";

export default function LoginScreen() {
  return (
    <View>
      <Text>Login</Text>
      <TextInput placeholder="Correo" />
      <TextInput placeholder="Contraseña" secureTextEntry />
      <Button title="Entrar" onPress={() => {}} />
    </View>
  );
}