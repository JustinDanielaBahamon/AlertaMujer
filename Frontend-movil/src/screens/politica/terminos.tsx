import { Text, ScrollView, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocale } from '../../contexts/LocaleContext';

type Props = {
  titulo: string;
  descripcion: string;
};

export default function Terminos(){
  const navigation = useNavigation<any>();
  const { t } = useLocale();

  //  componente reutilizable
  const ItemTermino = ({ titulo, descripcion }: Props) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#4B1FA8' }}>
        {titulo}
      </Text>
      <Text style={{ fontSize: 16, lineHeight: 24, color: '#000' }}>
        {descripcion}
      </Text>
    </View>
  );

  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

  return(
    // Fondo morado del login/registro cubriendo TODA la pantalla (sin bordes blancos)
    <SafeAreaView style={{ flex: 1, backgroundColor: 'rgb(202, 171, 222)' }}>
      <StatusBar style="dark" backgroundColor="rgb(202, 171, 222)" />
      <ScrollView
        style={{ flex: 1, backgroundColor: 'rgb(202, 171, 222)' }}
        contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >

        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2E1065', textAlign: 'center', marginBottom: 14 }}>
          {t.politicaTerminos.encabezado}
        </Text>

        {/* tarjeta blanca con borde morado (igual que los inputs) */}
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5,
          borderWidth: 1,
          borderColor: '#BC27BE'
        }}>

          {items.map((n) => (
            <ItemTermino
              key={n}
              titulo={t.politicaTerminos[`item${n}_titulo` as keyof typeof t.politicaTerminos]}
              descripcion={t.politicaTerminos[`item${n}_desc` as keyof typeof t.politicaTerminos]}
            />
          ))}

        </View>

        {/* boton igual al "Continuar" del registro */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: '#6A3FC9',
            paddingVertical: 12,
            borderRadius: 25,
            marginTop: 20,
            alignItems: 'center',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
            {t.politicaTerminos.volver}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}