import React, { useCallback } from "react";
import { 
  Image, 
  Text, 
  TouchableOpacity, 
  View, 
  Linking, 
  Platform,
  TextInput,
} from "react-native";
import { 
  MaterialIcons, 
  Feather, 
  MaterialCommunityIcons, 
  AntDesign 
} from "@expo/vector-icons";
import { SwipeListView } from 'react-native-swipe-list-view';
import { LinearGradient } from "expo-linear-gradient";

import { styles } from "./contactos.styles";
import { useContactosTabViewModel } from "../../../../features/contactos/useContactosViewModel";
import ModalAccionesContacto from "../../../components/ui/modalAccionesContacto/modalAccionesContacto";

type Contacto = ReturnType<typeof useContactosTabViewModel>['contactos'][0];

export default function Contactos() {
  const vm = useContactosTabViewModel();

  const hacerLlamada = (telefono: string) => {
    const url = Platform.OS === 'android' ? `tel:${telefono}` : `telprompt:${telefono}`;
    Linking.openURL(url).catch(err => console.error("Error al llamar", err));
  };

  const abrirWhatsApp = (telefono: string) => {
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

  // ✅ useCallback evita que el header se recree en cada letra
  // sin esto el TextInput pierde el foco y el teclado se cierra
  const Header = useCallback(() => (
    <>
      <View style={styles.Header}>
        <LinearGradient
          colors={["rgb(202,171,222)", "rgb(123, 29, 178)"]}
          start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.Gradiente}
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

      <View style={styles.Conteo}>
        <View style={styles.Cousser}>
          <Feather name="users" size={18} color="purple" />
        </View>
        <Text style={{ fontSize: 17, fontWeight: '800' }}>
          Tus contactos ({vm.contactosFiltrados.length})
        </Text>
      </View>

      <View style={styles.ContenedorBuscador}>
        <Feather name="search" size={18} color="#9E9E9E" />
        <TextInput
          style={styles.InputBuscador}
          placeholder="Buscar por nombre o teléfono..."
          placeholderTextColor="#9E9E9E"
          value={vm.busqueda}
          onChangeText={vm.setBusqueda}
        />
        {vm.busqueda.length > 0 && (
          <TouchableOpacity onPress={() => vm.setBusqueda('')}>
            <Feather name="x" size={18} color="#9E9E9E" />
          </TouchableOpacity>
        )}
      </View>
    </>
  ), [vm.busqueda, vm.contactosFiltrados.length]); // ← solo se recrea cuando estos valores cambian

  return (
    <View style={styles.ContenedorPrincipal}>

        {/* HEADER — fijo, nunca se recrea */}
        <View style={styles.Header}>
            <LinearGradient
                colors={["rgb(202,171,222)", "rgb(123, 29, 178)"]}
                start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.Gradiente}
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
                        style={{ width: 100, height: 62, resizeMode: 'cover' }}
                    />
                </View>
            </LinearGradient>
        </View>

        {/* CONTEO — fijo, nunca se recrea */}
        <View style={styles.Conteo}>
            <View style={styles.Cousser}>
                <Feather name="users" size={18} color="purple" />
            </View>
            <Text style={{ fontSize: 17, fontWeight: '800' }}>
                Tus contactos ({vm.contactosFiltrados.length})
            </Text>
        </View>

        {/* BUSCADOR — fijo, el TextInput nunca se desmonta */}
        <View style={styles.ContenedorBuscador}>
            <Feather name="search" size={18} color="#9E9E9E" />
            <TextInput
                style={styles.InputBuscador}
                placeholder="Buscar por nombre o teléfono..."
                placeholderTextColor="#9E9E9E"
                value={vm.busqueda}
                onChangeText={vm.setBusqueda}
            />
            {vm.busqueda.length > 0 && (
                <TouchableOpacity onPress={() => vm.setBusqueda('')}>
                    <Feather name="x" size={18} color="#9E9E9E" />
                </TouchableOpacity>
            )}
        </View>

        {/* LISTA — solo maneja los items */}
        <SwipeListView<Contacto>
            data={vm.contactosFiltrados}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            rightOpenValue={-100}
            disableRightSwipe
            bounces={false}
            overScrollMode="never"

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