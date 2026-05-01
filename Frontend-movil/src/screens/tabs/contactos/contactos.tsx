import React from "react";
import { Image, Text, TouchableOpacity, View, Linking, Platform, TextInput } from "react-native";
import { MaterialIcons, Feather, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { SwipeListView } from 'react-native-swipe-list-view';
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./contactos.styles";
import { useContactosTabViewModel } from "../../../../features/contactos/useContactosViewModel";
import ModalAccionesContacto from "../../../components/ui/modalAccionesContacto/modalAccionesContacto";
import { useTheme } from "@/src/contexts/ThemeContext";

type Contacto = ReturnType<typeof useContactosTabViewModel>['contactos'][0];

export default function Contactos() {
  const vm = useContactosTabViewModel();
  const { theme } = useTheme();

  const hacerLlamada = (telefono: string) => {
    const url = Platform.OS === 'android' ? `tel:${telefono}` : `telprompt:${telefono}`;
    Linking.openURL(url).catch(err => console.error("Error al llamar", err));
  };

  const abrirWhatsApp = (telefono: string) => {
    const numeroLimpio = telefono.replace(/[^0-9]/g, '');
    const url = `whatsapp://send?phone=${numeroLimpio}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) return Linking.openURL(url);
      else alert("WhatsApp no está instalado en este dispositivo");
    });
  };

  return (
    <View style={[styles.ContenedorPrincipal, { backgroundColor: theme.background }]}>

      {/* ── HEADER ── */}
      <View style={styles.Header}>
        <LinearGradient
          colors={["rgb(202,171,222)", "rgb(123, 29, 178)"]}         
           start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
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

      {/* ── CONTEO ── */}
      <View style={styles.Conteo}>
        <View style={[styles.Cousser, { backgroundColor: theme.contactCousserBg }]}>
          <Feather name="users" size={18} color={theme.contactCousserIcon} />
        </View>
        <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800' }}>
          Tus contactos ({vm.contactosFiltrados.length})
        </Text>
      </View>

      {/* ── BUSCADOR ── */}
      <View style={[styles.ContenedorBuscador, { backgroundColor: theme.contactBuscadorBg }]}>
        <Feather name="search" size={18} color={theme.contactSubtext} />
        <TextInput
          style={[styles.InputBuscador, { color: theme.contactBuscadorText }]}
          placeholder="Buscar por nombre o teléfono..."
          placeholderTextColor={theme.contactSubtext}
          value={vm.busqueda}
          onChangeText={vm.setBusqueda}
        />
        {vm.busqueda.length > 0 && (
          <TouchableOpacity onPress={() => vm.setBusqueda('')}>
            <Feather name="x" size={18} color={theme.contactSubtext} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── LISTA ── */}
      <SwipeListView<Contacto>
        data={vm.contactosFiltrados}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        rightOpenValue={-100}
        disableRightSwipe
        bounces={false}
        overScrollMode="never"

        renderItem={({ item: c }) => (
          <View style={[
            styles.TarjetaWrapper,
            {
              backgroundColor: theme.contactCardBg,
              borderWidth: 1,
              borderColor: theme.contactCardBorder,
              borderRadius: 25,
            }
          ]}>
            <View style={[styles.TarjetaContacto, { shadowColor: theme.contactAccent }]}>

              {/* Sección superior */}
              <View style={styles.SeccionSuperior}>

                {/* Avatar */}
                <View style={styles.ContenedorFoto}>
                  <Image
                    source={require("../../../../assets/imagesAlertaMujer/ScContacto/contacto.png")}
                    style={[styles.FotoPerfil, { borderColor: theme.contactAvatarBorder }]}
                  />
                  <View style={[styles.PuntoEstado, { borderColor: theme.contactCardBg }]} />
                </View>

                {/* Info */}
                <View style={styles.InfoContacto}>
                  <Text style={[styles.NombreContacto, { color: theme.contactNombre }]}>
                    {c.nombre}
                  </Text>

                  <View style={[
                    styles.BadgeRelacion,
                    {
                      backgroundColor: theme.contactBadgeBg,
                      borderWidth: 1,
                      borderColor: theme.contactBadgeBorder,
                    }
                  ]}>
                    <AntDesign name="heart" size={12} color={theme.contactAccent} />
                    <Text style={[styles.TextoBadge, { color: theme.contactBadgeText }]}>
                      {c.parentesco || "Amigo"}
                    </Text>
                  </View>

                  <View style={styles.ContenedorTelefono}>
                    <Feather name="phone" size={12} color={theme.contactSubtext} />
                    <Text style={[styles.Telefono, { color: theme.contactSubtext }]}>
                      {" "}{vm.formatearTelefonoMostrar(c.telefono)}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#28a745', marginRight: 5 }} />
                    <Text style={{ fontSize: 12, color: '#28a745', fontWeight: '500' }}>Disponible</Text>
                  </View>
                </View>

                {/* Botones editar/borrar */}
                <View style={styles.IconosSuperiores}>
                  <TouchableOpacity
                    style={[styles.BotonIconoSmall, { backgroundColor: theme.contactBotonEditar }]}
                    onPress={() => vm.abrirModalAcciones(c)}
                  >
                    <Feather name="edit-2" size={16} color={theme.contactBotonEditarIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.BotonIconoSmall, { backgroundColor: '#FFEBEE' }]}
                    onPress={() => vm.abrirModalAcciones(c)}
                  >
                    <Feather name="trash" size={16} color="#E53935" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sección acciones */}
              <View style={[styles.SeccionAcciones, { borderTopColor: theme.contactDivider }]}>

                <TouchableOpacity style={styles.ItemAccion} onPress={() => hacerLlamada(c.telefono)}>
                  <View style={[styles.CirculoIcono, { backgroundColor: theme.contactIconCallBg }]}>
                    <Feather name="phone" size={20} color={theme.contactIconCallColor} />
                  </View>
                  <Text style={[styles.TextoAccion, { color: theme.contactSubtext }]}>Llamar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.ItemAccion} onPress={() => abrirWhatsApp(c.telefono)}>
                  <View style={[styles.CirculoIcono, { backgroundColor: theme.contactIconWaBg }]}>
                    <MaterialCommunityIcons name="whatsapp" size={22} color="#2e7d32" />
                  </View>
                  <Text style={[styles.TextoAccion, { color: theme.contactSubtext }]}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.ItemAccion}>
                  <View style={[styles.CirculoIcono, { backgroundColor: theme.contactIconLocBg }]}>
                    <Feather name="map-pin" size={20} color={theme.contactIconLocColor} />
                  </View>
                  <Text style={[styles.TextoAccion, { color: theme.contactSubtext }]}>Ubicación</Text>
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
          <View style={[
            styles.TarjetaSugerencia,
            {
              backgroundColor: theme.contactSugerenciaBg,
              borderColor: theme.contactSugerenciaBorder,
            }
          ]}>
            <View style={[styles.CirculoDashed, { borderColor: theme.contactSugerenciaBorder }]}>
              <Feather name="user-plus" size={24} color={theme.contactSugerenciaIcon} />
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 14, color: theme.text }}>
                ¿Quieres agregar más?
              </Text>
              <Text style={{ fontSize: 12, color: theme.contactSubtext }}>
                Añade personas de confianza.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.BotonAgregarSmall, { backgroundColor: theme.contactBotonAgregarBg }]}
              onPress={vm.irAgregarContacto}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>+ Agregar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* ── BOTÓN FLOTANTE ── */}
      <TouchableOpacity
        style={[styles.BotonFlotante, {
          backgroundColor: theme.contactFlotanteBg,
          shadowColor: theme.contactFlotanteBg,
        }]}
        onPress={vm.irAgregarContacto}
      >
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