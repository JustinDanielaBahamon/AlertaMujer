import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Privacidad(){
  return(
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        Política de privacidad
      </Text>

      <Text style={{ marginTop: 10 }}>
        Aquí va la política de privacidad...
      </Text>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ color: 'blue', marginTop: 20 }}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}