import { Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Privacidad(){
  const navigation = useNavigation<any>();
  return(
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        Política de privacidad
      </Text>

      <Text style={{ marginTop: 10 }}>
        Aquí va la política de privacidad...
      </Text>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ color: 'blue', marginTop: 20 }}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}