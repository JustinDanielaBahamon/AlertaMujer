/**
 * VISTA DE CONTACTOS (MVVM - Solo UI)
 * 
 * Esta vista NO tiene lógica, solo muestra la UI.
 * Toda la lógica está en useContactosViewModel.
 * 
 * FUNCIONALIDADES:
 * - Lista de contactos con swipe-to-delete
 * - Tocar contacto → Modal de acciones
 * - Botón flotante "+" → Agregar nuevo
 * - Ícono de lápiz en cada tarjeta → Editar rápido
 */

import { Image, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SwipeListView } from 'react-native-swipe-list-view';
import { styles } from "./contactos.styles";
import { useContactosTabViewModel } from "../../../../features/contactos/useContactosViewModel";
import ModalAccionesContacto from "../../../components/ui/modalAccionesContacto/modalAccionesContacto";

export default function Contactos() {
  const vm = useContactosTabViewModel();

  return (
    <View style={styles.ContenedorPrincipal}>
      <View style={styles.Cuerpo}>
        {/* TÍTULO Y SUBTÍTULO */}
        <Text style={styles.TituloPagina}>Mis Contactos de Confianza</Text>
        <Text style={styles.Subtitulo}>
          Estas personas recibirán tu ubicación en caso de emergencia.
        </Text>

        {/* LISTA DE CONTACTOS CON SWIPE */}
        <SwipeListView
          data={vm.contactos}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          
          // RENDERIZADO DEL FRENTE (lo que ve el usuario)
          renderItem={({ item: c }) => (
            <View style={styles.TarjetaWrapper}>
              <TouchableOpacity
                activeOpacity={0.99}
                style={styles.TarjetaContacto}
                onPress={() => vm.abrirModalAcciones(c)}
                accessibilityRole="button"
                accessibilityLabel={`Contacto ${c.nombre}, abrir acciones`}
              >
                {/* FOTO DE PERFIL */}
                <View style={styles.ContenedorFoto}>
                  <Image
                    source={require("../../../../assets/imagesAlertaMujer/ScContacto/contacto.png")}
                    style={styles.FotoPerfil}
                  />
                  {/* BADGE DE PARENTESCO */}
                  {c.parentesco ? (
                    <View style={styles.BadgeRelacion}>
                      <Text style={styles.TextoBadge}>{c.parentesco}</Text>
                    </View>
                  ) : null}
                </View>

                {/* INFORMACIÓN DEL CONTACTO */}
                <View style={styles.InfoContacto}>
                  <Text style={styles.NombreContacto}>{c.nombre}</Text>
                  <View style={styles.ContenedorTelefono}>
                    <MaterialIcons name="phone" size={14} color="#8e8e8e" />
                    <Text style={styles.Telefono}>
                      {" "}
                      {vm.formatearTelefonoMostrar(c.telefono)}
                    </Text>
                  </View>
                </View>

                {/* ÍCONO DE LÁPIZ (EDITAR RÁPIDO) */}
                <TouchableOpacity
                  onPress={() => vm.abrirModalAcciones(c)}
                  style={styles.IconoEditar}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons name="edit" size={20} color="#6B3FA0" />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          )}
          
          // RENDERIZADO DE ATRÁS (botón rojo de borrar al deslizar)
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
          
          // CONFIGURACIÓN DEL SWIPE
          rightOpenValue={-100}  // Cuánto se abre al deslizar izquierda
          disableRightSwipe      // Deshabilitar deslizar hacia la derecha
        />
      </View>

      {/* BOTÓN FLOTANTE "+" PARA AGREGAR */}
      <TouchableOpacity 
        style={styles.BotonFlotante} 
        onPress={vm.irAgregarContacto}
      >
        <MaterialIcons name="person-add" size={28} color="white" />
      </TouchableOpacity>

      {/* MODAL DE ACCIONES (Actualizar/Borrar) */}
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