import React from "react";
import { 
  Image, 
  Text, 
  TouchableOpacity, 
  View, 
  Linking, 
  Platform 
} from "react-native";
import { 
  MaterialIcons, 
  Feather, 
  MaterialCommunityIcons, 
  AntDesign 
} from "@expo/vector-icons";
import { SwipeListView } from 'react-native-swipe-list-view';
import { LinearGradient } from "expo-linear-gradient";

// Estilos y Hooks
import { styles } from "./contactos.styles";
import { useContactosTabViewModel } from "../../../../features/contactos/useContactosViewModel";
import ModalAccionesContacto from "../../../components/ui/modalAccionesContacto/modalAccionesContacto";

export default function Contactos() {
  const vm = useContactosTabViewModel();

  // Función para abrir el marcador telefónico
  const hacerLlamada = (telefono:String) => {
    const url = Platform.OS === 'android' ? `tel:${telefono}` : `telprompt:${telefono}`;
    Linking.openURL(url).catch(err => console.error("Error al llamar", err));
  };

  // Función para abrir WhatsApp
  const abrirWhatsApp = (telefono:String) => {
    // Quitamos espacios o caracteres especiales del número
    const numeroLimpio = telefono.replace(/[^0-9]/g, '');
    const url = `whatsapp://send?phone=${numeroLimpio}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        alert("WhatsApp no está instalado en este dispositivo");
      }
    });
  };

  return (
    <View style={styles.ContenedorPrincipal}>
      
     {/* HEADER */}
        <View style={styles.Header}>
          <LinearGradient
            colors={["rgb(202,171,222)", "rgb(123, 29, 178)"]}
            start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.Gradiente} // <-- Antes decía "Gradierte", cámbialo a "Gradiente"
          >
          <View style={styles.HeaderContenido}>
            <View style={{ flex: 1 }}>
              <Text style={styles.TituloHeader}>Mis Contactos de Confianza</Text>
              <Text style={styles.SubtituloHeader}>
                Estas personas recibirán tu ubicación en caso de emergencia.
              </Text>
            </View>
            <Image 
              source={require("../../../../assets/imagesAlertaMujer/ScContacto/H.png")} 
              style={{ width: 100, height: 65, resizeMode: 'contain' }}
            />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.Cuerpo}>
        {/* TITULO DE SECCIÓN Y CONTEO */}
        <View style={styles.Conteo}>
          <View style={styles.Cousser}>
            <Feather name="users" size={18} color="purple" />
          </View>
          <Text style={{ fontSize: 17, fontWeight: '800' }}> Tus contactos ({vm.contactos.length})</Text>
        </View>

        {/* LISTA CON SWIPE */}
        <SwipeListView
          data={vm.contactos}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          rightOpenValue={-100}
          disableRightSwipe
          
          renderItem={({ item: c }) => (
            <View style={styles.TarjetaWrapper}>
              <View style={styles.TarjetaContacto}>
                
                <View style={styles.SeccionSuperior}>
                  <View style={styles.ContenedorFoto}>
                    <Image 
                      source={require("../../../../assets/imagesAlertaMujer/ScContacto/contacto.png")} 
                      style={styles.FotoPerfil} 
                    />
                    <View style={styles.PuntoEstado} />
                  </View>

                  <View style={styles.InfoContacto}>
                    <Text style={styles.NombreContacto}>{c.nombre}</Text>
                    
                    <View style={styles.BadgeRelacion}>
                      <AntDesign name="heart" size={12} color="#6B3FA0" />
                      <Text style={styles.TextoBadge}>{c.parentesco || "Amigo"}</Text>
                    </View>

                    <View style={styles.ContenedorTelefono}>
                      <Feather name="phone" size={12} color="#8e8e8e" />
                      <Text style={styles.Telefono}> {vm.formatearTelefonoMostrar(c.telefono)}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#28a745', marginRight: 5 }} />
                      <Text style={{ fontSize: 12, color: '#28a745', fontWeight: '500' }}>Disponible</Text>
                    </View>
                  </View>

                  {/* ICONOS DE EDICIÓN Y BORRADO */}
                  <View style={styles.IconosSuperiores}>
                    <TouchableOpacity 
                      style={styles.BotonIconoSmall} 
                      onPress={() => vm.abrirModalAcciones(c)}
                    >
                      <Feather name="edit-2" size={16} color="#6B3FA0" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.BotonIconoSmall, { backgroundColor: '#FFEBEE' }]} 
                      onPress={() => vm.abrirModalAcciones(c)} 
                    >
                      <Feather name="trash" size={16} color="#E53935" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* BOTONES DE ACCIÓN FUNCIONALES */}
                <View style={styles.SeccionAcciones}>
                  <TouchableOpacity 
                    style={styles.ItemAccion}
                    onPress={() => hacerLlamada(c.telefono)}
                  >
                    <View style={[styles.CirculoIcono, { backgroundColor: '#F3E5F5' }]}>
                      <Feather name="phone" size={20} color="#6B3FA0" />
                    </View>
                    <Text style={styles.TextoAccion}>Llamar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.ItemAccion}
                    onPress={() => abrirWhatsApp(c.telefono)}
                  >
                    <View style={[styles.CirculoIcono, { backgroundColor: '#E8F5E9' }]}>
                      <MaterialCommunityIcons name="whatsapp" size={22} color="#2e7d32" />
                    </View>
                    <Text style={styles.TextoAccion}>WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.ItemAccion}>
                    <View style={[styles.CirculoIcono, { backgroundColor: '#E3F2FD' }]}>
                      <Feather name="map-pin" size={20} color="#1565C0" />
                    </View>
                    <Text style={styles.TextoAccion}>Ubicación</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          renderHiddenItem={({ item: c }) => (
            <View style={styles.RowBack}>
              <TouchableOpacity
                style={styles.BotonBorrarSwipe}
                onPress={() => vm.borrarConSwipe(c)}
              >
                <MaterialIcons name="delete" size={28} color="white" />
                <Text style={styles.TextoBorrarSwipe}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}

          ListFooterComponent={() => (
            <View style={styles.TarjetaSugerencia}>
              <View style={styles.CirculoDashed}>
                <Feather name="user-plus" size={24} color="#B39DDB" />
              </View>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 14 }}>¿Quieres agregar más?</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>Añade personas de confianza.</Text>
              </View>
              <TouchableOpacity style={styles.BotonAgregarSmall} onPress={vm.irAgregarContacto}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>+ Agregar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <TouchableOpacity style={styles.BotonFlotante} onPress={vm.irAgregarContacto}>
        <MaterialIcons name="person-add" size={28} color="white" />
      </TouchableOpacity>

      <ModalAccionesContacto
        visible={vm.modalVisible}
        nombreContacto={vm.contactoSeleccionado?.nombre || ""}
        onActualizar={vm.handleActualizar}
        onBorrar={vm.handleBorrar}
        onCerrar={vm.cerrarModalAcciones}
      />
    </View>
  );
}