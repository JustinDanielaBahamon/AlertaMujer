import React from "react";
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
  AntDesign,
} from "@expo/vector-icons";
import { SwipeListView } from "react-native-swipe-list-view";
import { LinearGradient } from "expo-linear-gradient";

import { createStyles } from "./contactos.styles";
import { useContactosTabViewModel } from "../../../../features/contactos/useContactosViewModel";
import ModalAccionesContacto from "../../../components/ui/modalAccionesContacto/modalAccionesContacto";
import { useTheme } from "../../../../src/contexts/ThemeContext";

type Contacto = ReturnType<typeof useContactosTabViewModel>["contactos"][0];

export default function Contactos() {
  const vm = useContactosTabViewModel();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const headerGradient: [string, string] = [theme.headercolor1, theme.headercolor2];

  const makeCall = (phoneNumber: string) => {
    const url =
      Platform.OS === "android"
        ? `tel:${phoneNumber}`
        : `telprompt:${phoneNumber}`;
    Linking.openURL(url).catch((err) =>
      console.error("Error al llamar", err)
    );
  };

  const openWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
    const url = `whatsapp://send?phone=${cleanNumber}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        alert("WhatsApp no está instalado en este dispositivo");
      }
    });
  };

  return (
    <View style={styles.mainContainer}>

      {/* HEADER — fijo, nunca se recrea */}
      <View style={styles.header}>
        <LinearGradient
          colors={headerGradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.headerContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Mis Contactos de Confianza</Text>
              <Text style={styles.headerSubtitle}>
                Estas personas recibirán tu ubicación en caso de emergencia.
              </Text>
            </View>
            <Image
              source={require("../../../../assets/imagesAlertaMujer/ScContacto/H.png")}
              style={{ width: 100, height: 65, resizeMode: "contain" }}
            />
          </View>
        </LinearGradient>
      </View>

      {/* CONTEO — fijo, nunca se recrea */}
      <View style={styles.countRow}>
        <View style={styles.countIcon}>
          <Feather name="users" size={18} color={theme.contactCousserIcon} />
        </View>
        <Text style={[styles.countText, { color: theme.text }]}>
          Tus contactos ({vm.contactosFiltrados.length})
        </Text>
      </View>

      {/* BUSCADOR — fijo, el TextInput nunca se desmonta */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#9E9E9E" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o teléfono..."
          placeholderTextColor="#9E9E9E"
          value={vm.busqueda}
          onChangeText={vm.setBusqueda}
        />
        {vm.busqueda.length > 0 && (
          <TouchableOpacity onPress={() => vm.setBusqueda("")}>
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
          <View style={styles.cardWrapper}>
            <View style={styles.contactCard}>
              {/* Sección superior: foto, info, botones */}
              <View style={styles.topSection}>
                <View style={styles.photoContainer}>
                  <Image
                    source={require("../../../../assets/imagesAlertaMujer/ScContacto/contacto.png")}
                    style={[styles.profilePhoto, { borderColor: theme.contactAvatarBorder }]}
                  />
                  <View style={styles.statusDot} />
                </View>

                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: theme.contactNombre }]}>
                    {c.nombre}
                  </Text>
                  <View style={[styles.relationBadge, {
                    backgroundColor: theme.contactBadgeBg,
                    borderColor: theme.contactBadgeBorder,
                  }]}>
                    <AntDesign name="heart" size={12} color={theme.contactAccent} />
                    <Text style={[styles.badgeText, { color: theme.contactBadgeText }]}>
                      {c.parentesco || "Amigo"}
                    </Text>
                  </View>
                  <View style={styles.phoneRow}>
                    <Feather name="phone" size={12} color={theme.contactSubtext} />
                    <Text style={[styles.phoneText, { color: theme.contactSubtext }]}>
                      {" "}{vm.formatearTelefonoMostrar(c.telefono)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#28a745", marginRight: 5 }} />
                    <Text style={{ fontSize: 12, color: "#28a745", fontWeight: "500" }}>Disponible</Text>
                  </View>
                </View>

                <View style={styles.topIcons}>
                  <TouchableOpacity
                    style={[styles.smallIconButton, { backgroundColor: theme.contactBotonEditar }]}
                    onPress={() => vm.abrirModalAcciones(c)}
                  >
                    <Feather name="edit-2" size={16} color={theme.contactBotonEditarIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallIconButton, { backgroundColor: "#FFEBEE" }]}
                    onPress={() => vm.abrirModalAcciones(c)}
                  >
                    <Feather name="trash" size={16} color="#E53935" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sección acciones: Llamar, WhatsApp, Ubicación */}
              <View style={[styles.actionsSection, { borderTopColor: theme.contactDivider }]}>
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => makeCall(c.telefono)}
                >
                  <View style={[styles.actionCircle, { backgroundColor: theme.contactIconCallBg }]}>
                    <Feather name="phone" size={20} color={theme.contactIconCallColor} />
                  </View>
                  <Text style={styles.actionText}>Llamar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => openWhatsApp(c.telefono)}
                >
                  <View style={[styles.actionCircle, { backgroundColor: theme.contactIconWaBg }]}>
                    <MaterialCommunityIcons name="whatsapp" size={22} color="#2e7d32" />
                  </View>
                  <Text style={styles.actionText}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem}>
                  <View style={[styles.actionCircle, { backgroundColor: theme.contactIconLocBg }]}>
                    <Feather name="map-pin" size={20} color={theme.contactIconLocColor} />
                  </View>
                  <Text style={styles.actionText}>Ubicación</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        renderHiddenItem={({ item: c }) => (
          <View style={styles.swipeBack}>
            <TouchableOpacity
              style={styles.deleteSwipeButton}
              onPress={() => vm.borrarConSwipe(c)}
            >
              <MaterialIcons name="delete" size={28} color="white" />
              <Text style={styles.deleteSwipeText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}

        ListFooterComponent={() => (
          <View style={[styles.suggestionCard, {
            backgroundColor: theme.contactSugerenciaBg,
            borderColor: theme.contactSugerenciaBorder,
          }]}>
            <View style={[styles.dashedCircle, { borderColor: theme.contactSugerenciaBorder }]}>
              <Feather name="user-plus" size={24} color={theme.contactSugerenciaIcon} />
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[{ fontWeight: "bold", fontSize: 14 }, { color: theme.text }]}>
                ¿Quieres agregar más?
              </Text>
              <Text style={{ fontSize: 12, color: theme.contactSubtext }}>
                Añade personas de confianza.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addSmallButton, { backgroundColor: theme.contactBotonAgregarBg }]}
              onPress={vm.irAgregarContacto}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>
                + Agregar
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* BOTÓN FLOTANTE */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: theme.contactFlotanteBg }]}
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