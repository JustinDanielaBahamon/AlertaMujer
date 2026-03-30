import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Terminos(){
  return(
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        Términos y condiciones
      </Text>

      <Text style={{ marginTop: 10 }}>
        Aquí van los términos de tu app...
      </Text>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ color: 'blue', marginTop: 20 }}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}