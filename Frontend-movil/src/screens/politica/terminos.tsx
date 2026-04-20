import { Text, ScrollView, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  titulo: string;
  descripcion: string;
};

export default function Terminos(){
  const navigation = useNavigation<any>();

  //  componente reutilizable
  const ItemTermino = ({ titulo, descripcion }: Props) => (
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
            Términos y Condiciones
          </Text>

          {/* tarjeta blanca */}
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

            <ItemTermino
              titulo="1. Aceptación de los términos"
              descripcion="Al descargar, instalar o utilizar la aplicación Alerta Mujer, el usuario acepta cumplir con los presentes Términos de Uso. Si no está de acuerdo, debe abstenerse de utilizar la aplicación."
            />

            <ItemTermino
              titulo="2. Descripción del servicio"
              descripcion="Alerta Mujer es una aplicación móvil diseñada para mejorar la seguridad personal mediante el envío de alertas de emergencia, la compartición de ubicación en tiempo real, la notificación a contactos de emergencia y la grabación de audio y/o video en situaciones de riesgo. La aplicación tiene fines de apoyo y no sustituye servicios oficiales de emergencia."
            />

            <ItemTermino
              titulo="3. Uso adecuado"
              descripcion="El usuario se compromete a utilizar la aplicación únicamente para fines legítimos de seguridad personal, a no generar alertas falsas o malintencionadas, a no utilizar la aplicación para acosar, amenazar o perjudicar a terceros y a proporcionar información veraz en caso de registro. El uso indebido puede resultar en la suspensión o eliminación del acceso."
            />

            <ItemTermino
              titulo="4. Responsabilidad del usuario"
              descripcion="El usuario reconoce que es responsable del uso que haga de la aplicación, que debe configurar correctamente sus contactos de emergencia y que debe mantener su dispositivo con batería y conexión para el correcto funcionamiento."
            />

            <ItemTermino
              titulo="5. Limitación de responsabilidad"
              descripcion="Alerta Mujer no garantiza la respuesta inmediata de los contactos de emergencia, no asegura la disponibilidad continua del servicio y no se hace responsable por daños derivados del uso o de la imposibilidad de uso de la aplicación."
            />

            <ItemTermino
              titulo="6. Permisos y datos"
              descripcion="La aplicación puede solicitar acceso a la ubicación en tiempo real, la cámara, el micrófono y los contactos del dispositivo. Estos permisos se utilizan exclusivamente para el funcionamiento de las funciones de seguridad."
            />

            <ItemTermino
              titulo="7. Privacidad"
              descripcion="El uso de la información personal se rige por la Política de Privacidad. Al usar la aplicación, el usuario acepta el tratamiento de sus datos conforme a dicha política."
            />

            <ItemTermino
              titulo="8. Almacenamiento de evidencia"
              descripcion="Las grabaciones de audio y/o video generadas pueden almacenarse localmente o en servidores seguros, son responsabilidad del usuario y pueden ser utilizadas como evidencia en situaciones legales."
            />

            <ItemTermino
              titulo="9. Modificaciones"
              descripcion="Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados dentro de la aplicación."
            />

            <ItemTermino
              titulo="10. Terminación del servicio"
              descripcion="Podemos suspender o cancelar el acceso a la aplicación en caso de uso indebido, violación de estos términos o actividades sospechosas o fraudulentas."
            />

            <ItemTermino
              titulo="11. Legislación aplicable"
              descripcion="Estos términos se rigen por las leyes vigentes del país donde opera la aplicación."
            />

            <ItemTermino
              titulo="12. Contacto"
              descripcion="Para dudas o soporte, el usuario puede comunicarse a través de los canales oficiales disponibles dentro de la aplicación."
            />

          </View>

          {/* boton */}
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