import { Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Terminos(){
  const navigation = useNavigation<any>();
  return(
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        Términos y condiciones
      </Text>

      <Text style={{ marginTop: 10 }}>
        Aquí van los términos de tu app...
      </Text>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ color: 'blue', marginTop: 20 }}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}