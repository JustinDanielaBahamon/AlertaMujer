import { Text, ScrollView, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '../../contexts/LocaleContext';

type Props = {
  titulo: string;
  descripcion: string;
};

export default function Privacidad(){
  const navigation = useNavigation<any>();
  const { t } = useLocale();

  const ItemPrivacidad = ({ titulo, descripcion }: Props) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#000' }}>
        {titulo}
      </Text>
      <Text style={{ fontSize: 16, lineHeight: 24, color: '#000' }}>
        {descripcion}
      </Text>
    </View>
  );

  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

  return(
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#d37bd3', '#ffffff']}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>

          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 12 }}>
            {t.politicaPrivacidad.encabezado}
          </Text>

          {/* tarjeta */}
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 15,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            borderWidth: 2,
            borderColor: '#000000'
          }}>

            {items.map((n) => (
              <ItemPrivacidad
                key={n}
                titulo={t.politicaPrivacidad[`item${n}_titulo` as keyof typeof t.politicaPrivacidad]}
                descripcion={t.politicaPrivacidad[`item${n}_desc` as keyof typeof t.politicaPrivacidad]}
              />
            ))}

          </View>

          {/* botón */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: '#920da3',
              padding: 12,
              borderRadius: 100,
              marginTop: 20,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              {t.politicaPrivacidad.volver}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}