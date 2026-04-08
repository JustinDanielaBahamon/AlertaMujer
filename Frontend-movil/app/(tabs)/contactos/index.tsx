import { Image, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { styles } from './contactos.styles';
export default function Contactos() {
  const router = useRouter();

  return (

    
    <View style={styles.ContenedorPrincipal}>
      
      
      <View style={styles.Cuerpo}>
        <Text style={styles.TituloPagina}>Mis Contactos de Confianza</Text>
        <Text style={styles.Subtitulo}>Estas personas recibirán tu ubicación en caso de emergencia.</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Tarjeta de Contacto */}
          <View style={styles.TarjetaContacto}>
            <View style={styles.ContenedorFoto}>
              <Image 
                source={require('../../../assets/imagesAlertaMujer/ScContacto/contacto.png')} 
                style={styles.FotoPerfil}
              />
              <View style={styles.BadgeRelacion}>
                <Text style={styles.TextoBadge}>Hermana</Text>
              </View>
            </View>

            <View style={styles.InfoContacto}>
              <Text style={styles.NombreContacto}>Tatiana Montero</Text>
              <View style={styles.ContenedorTelefono}>
                <MaterialIcons name="phone" size={14} color="#8e8e8e" />
                <Text style={styles.Telefono}> 317 686 6754</Text>
              </View>
            </View>

          </View>
        </ScrollView>
      </View>

      {/* Botón Flotante */}
      <TouchableOpacity
        style={styles.BotonFlotante}
        onPress={() => router.push("/contacto")}
      >
        <MaterialIcons name="person-add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}