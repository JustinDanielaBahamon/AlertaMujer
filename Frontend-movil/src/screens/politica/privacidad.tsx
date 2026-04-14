import { Text, ScrollView, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  titulo: string;
  descripcion: string;
};

export default function Privacidad(){
  const navigation = useNavigation<any>();

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

  return(
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#d37bd3', '#ffffff']}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>

          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 12 }}>
            Política de Privacidad
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

            <ItemPrivacidad
              titulo="1. Información recopilada"
              descripcion="La aplicación puede recopilar información como ubicación en tiempo real, datos de contacto y acceso a cámara y micrófono, necesarios para el funcionamiento de las funciones de seguridad."
            />

            <ItemPrivacidad
              titulo="2. Uso de la información"
              descripcion="La información recopilada se utiliza exclusivamente para enviar alertas de emergencia, compartir ubicación con contactos seleccionados y generar evidencia en situaciones de riesgo."
            />

            <ItemPrivacidad
              titulo="3. Compartición de datos"
              descripcion="La información solo será compartida con los contactos de emergencia previamente configurados por el usuario o cuando sea necesario para cumplir con obligaciones legales."
            />

            <ItemPrivacidad
              titulo="4. Almacenamiento de datos"
              descripcion="Los datos pueden almacenarse de forma local en el dispositivo o en servidores seguros, dependiendo de la funcionalidad utilizada."
            />

            <ItemPrivacidad
              titulo="5. Seguridad"
              descripcion="Se implementan medidas de seguridad para proteger la información del usuario, sin embargo, no se puede garantizar una seguridad absoluta."
            />

            <ItemPrivacidad
              titulo="6. Derechos del usuario"
              descripcion="El usuario puede gestionar, modificar o eliminar su información personal desde la aplicación o solicitándolo a través de los canales de contacto."
            />

            <ItemPrivacidad
              titulo="7. Permisos"
              descripcion="La aplicación solicita permisos como ubicación, cámara, micrófono y contactos únicamente para funciones relacionadas con la seguridad del usuario."
            />

            <ItemPrivacidad
              titulo="8. Cambios en la política"
              descripcion="Nos reservamos el derecho de modificar esta política en cualquier momento. Los cambios serán notificados dentro de la aplicación."
            />

            <ItemPrivacidad
              titulo="9. Contacto"
              descripcion="Para dudas relacionadas con la privacidad, el usuario puede comunicarse a través de los canales oficiales disponibles en la aplicación."
            />

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
              Volver
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}