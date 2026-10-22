import { AntDesign, Feather, MaterialCommunityIcons, MaterialIcons, } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Linking, Platform, RefreshControl, Text, TextInput, TouchableOpacity, View, } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SwipeListView } from "react-native-swipe-list-view";

import { useTheme } from "../../../../src/contexts/ThemeContext";
import ContactActionsModal from "../../../components/ui/modalAccionesContacto/modalAccionesContacto";
import { useLocale } from "../../../contexts/LocaleContext";
import { contactExtraTexts } from "../contactosExtra";
import { createStyles } from "../style/contactos.styles";
import { useContactsTabViewModel } from "../viewModel/useContactosViewModel";

type Contact = ReturnType<typeof useContactsTabViewModel>["contacts"][0];

export default function ContactsTab() {
  const vm = useContactsTabViewModel();
  const { theme } = useTheme();
  const { t, locale } = useLocale();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const extra = contactExtraTexts[locale];

  const headerGradient: [string, string] = [theme.headercolor1, theme.headercolor2];

  // Estado real: con la app (violeta lleno), con cuenta sin celular (violeta claro) o solo correo (gris)
  const statusOf = (c: Contact) => {
    const e = vm.appStatus[String(c.id)];
    if (e === "app") return { color: theme.contactAccent, text: t.contactos.estado_app, invite: false };
    if (e === "account") return { color: theme.contactAccent + "99", text: t.contactos.estado_cuenta, invite: true };
    if (e === "none") return { color: "#9E9E9E", text: t.contactos.estado_correo, invite: true };
    return { color: "#BDBDBD", text: t.contactos.estado_revisando, invite: false };
  };

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
          style={[styles.gradient, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.headerContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>{t.contactos.titulo}</Text>
              <Text style={styles.headerSubtitle}>
                {t.contactos.subtitulo}
              </Text>
            </View>
            <Image
              source={require("@assets/imagesAlertaMujer/ScContacto/H.png")}
              style={{ width: 100, height: 65, resizeMode: "contain" }}
            />
          </View>
        </LinearGradient>
      </View>

      {/* CONTEO — fijo, nunca se recrea */}
      <View style={styles.countRow}>
        <View style={styles.countIcon}>
          <Feather name="users" size={18} color={theme.contactCounterIcon} />
        </View>
        <Text style={[styles.countText, { color: theme.text }]}>
          {t.contactos.tus_contactos} ({vm.filteredContacts.length})
        </Text>
      </View>

      {/* BUSCADOR — fijo, el TextInput nunca se desmonta */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#9E9E9E" />
        <TextInput
          style={styles.searchInput}
          placeholder={t.contactos.buscar_placeholder}
          placeholderTextColor="#9E9E9E"
          value={vm.searchText}
          onChangeText={vm.setSearchText}
        />
        {vm.searchText.length > 0 && (
          <TouchableOpacity onPress={() => vm.setSearchText("")}>
            <Feather name="x" size={18} color="#9E9E9E" />
          </TouchableOpacity>
        )}
      </View>

      {/* LISTA — solo maneja los items */}
      <SwipeListView<Contact>
        data={vm.filteredContacts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        rightOpenValue={-100}
        disableRightSwipe
        bounces={false}
        overScrollMode="never"
        refreshControl={
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.onRefresh}
            colors={[theme.contactAccent]}
          />
        }

        ListHeaderComponent={
          vm.missingContacts > 0 && !vm.loading ? (
            <View style={[styles.suggestionCard, {
              backgroundColor: theme.contactSuggestionBg,
              borderColor: theme.contactAccent,
              borderStyle: "solid",
              marginTop: 0,
              marginBottom: 10,
            }]}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ fontWeight: "bold", fontSize: 14, color: theme.text }}>
                  {t.contactos.minimo_titulo.replace("{total}", "5")}
                </Text>
                <Text style={{ fontSize: 12, color: theme.contactSubtext, marginTop: 2 }}>
                  {t.contactos.minimo_desc.replace("{n}", String(5 - vm.missingContacts)).replace("{total}", "5")}
                </Text>
                <View style={{ flexDirection: "row", gap: 4, marginTop: 8 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <View key={i} style={{
                      flex: 1, height: 5, borderRadius: 3,
                      backgroundColor: i < 5 - vm.missingContacts ? theme.contactAccent : theme.contactAccent + "30",
                    }} />
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={[styles.addSmallButton, { backgroundColor: theme.contactAddButtonBg }]}
                onPress={vm.goToAddContact}
              >
                <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>{t.contactos.minimo_boton}</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }

        renderItem={({ item: c }) => { const status = statusOf(c); return (
          <View style={styles.cardWrapper}>
            <View style={styles.contactCard}>
              {/* Sección superior: foto, info, botones */}
              <View style={styles.topSection}>

                {/* ── AVATAR CON LÓGICA DE 3 NIVELES ─────────────────────── */}
                <View style={styles.photoContainer}>
                  {c.photo ? (
                    // Nivel 1: foto personalizada o traída de la agenda
                    <Image
                      source={{ uri: c.photo }}
                      style={[styles.profilePhoto, { borderColor: theme.contactAvatarBorder }]}
                    />
                  ) : (c.name || '').trim() ? (
                    // Nivel 2: inicial del nombre sobre fondo de color
                    <View style={[
                      styles.profilePhoto,
                      {
                        borderColor: theme.contactAvatarBorder,
                        borderWidth: 2,
                        backgroundColor: theme.contactAccent + "18",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    ]}>
                      <Text style={{
                        fontSize: 22,
                        fontWeight: "800",
                        color: theme.contactAccent,
                      }}>
                        {(c.name || '').trim().charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  ) : (
                    // Nivel 3: imagen por defecto
                    <Image
                      source={require("../../../../assets/imagesAlertaMujer/ScContacto/contacto.png")}
                      style={[styles.profilePhoto, { borderColor: theme.contactAvatarBorder }]}
                    />
                  )}
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                </View>
                {/* ────────────────────────────────────────────────────────── */}

                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: theme.contactName }]}>
                    {c.name || ''}
                  </Text>
                  <View style={[styles.relationBadge, {
                    backgroundColor: theme.contactBadgeBg,
                    borderColor: theme.contactBadgeBorder,
                  }]}>
                    <AntDesign name="heart" size={12} color={theme.contactAccent} />
                    <Text style={[styles.badgeText, { color: theme.contactBadgeText }]}>
                      {c.relationship || t.contactos.parentesco_default}
                    </Text>
                  </View>
                  <View style={styles.phoneRow}>
                    <Feather name="phone" size={12} color={theme.contactSubtext} />
                    <Text style={[styles.phoneText, { color: theme.contactSubtext }]}>
                      {" "}{vm.formatPhoneForDisplay(c.phoneNumber)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: status.color, marginRight: 5 }} />
                    <Text style={{ flexShrink: 1, fontSize: 12, color: status.color === "#9E9E9E" ? theme.contactSubtext : theme.contactAccent, fontWeight: "600" }}>
                      {status.text}
                    </Text>
                  </View>
                  {status.invite && (
                    <TouchableOpacity onPress={() => vm.inviteToApp(c)} style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                      <Feather name="share-2" size={13} color={theme.contactAccent} />
                      <Text style={{ fontSize: 12, color: theme.contactAccent, fontWeight: "700", marginLeft: 5, textDecorationLine: "underline" }}>
                        {t.contactos.invitar}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.topIcons}>
                  <TouchableOpacity
                    style={[styles.smallIconButton, { backgroundColor: theme.contactEditButton }]}
                    onPress={() => vm.openActionsModal(c)}
                  >
                    <Feather name="edit-2" size={16} color={theme.contactEditButtonIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallIconButton, { backgroundColor: "#FFEBEE" }]}
                    onPress={() => vm.openActionsModal(c)}
                  >
                    <Feather name="trash" size={16} color="#E53935" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sección acciones: Llamar, WhatsApp, Alerta individual */}
              <View style={[styles.actionsSection, { borderTopColor: theme.contactDivider }]}>
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => makeCall(c.phoneNumber)}
                >
                  <View style={[styles.actionCircle, { backgroundColor: theme.contactIconCallBg }]}>
                    <Feather name="phone" size={20} color={theme.contactIconCallColor} />
                  </View>
                  <Text style={styles.actionText}>{t.contactos.llamar}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => openWhatsApp(c.phoneNumber)}
                >
                  <View style={[styles.actionCircle, { backgroundColor: theme.contactIconWaBg }]}>
                    <MaterialCommunityIcons name="whatsapp" size={22} color="#2e7d32" />
                  </View>
                  <Text style={styles.actionText}>{t.contactos.whatsapp}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => vm.alertContact(c)}
                >
                  <View style={[styles.actionCircle, { backgroundColor: theme.contactIconLocBg }]}>
                    <Feather name="alert-triangle" size={20} color={theme.contactIconLocColor} />
                  </View>
                  <Text style={styles.actionText}>{extra.alerta_boton}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ); }}

        renderHiddenItem={({ item: c }) => (
          <View style={styles.swipeBack}>
            <TouchableOpacity
              style={styles.deleteSwipeButton}
              onPress={() => vm.deleteWithSwipe(c)}
            >
              <MaterialIcons name="delete" size={28} color="white" />
              <Text style={styles.deleteSwipeText}>{t.contactos.eliminar}</Text>
            </TouchableOpacity>
          </View>
        )}

        ListFooterComponent={() => (
          <View style={[styles.suggestionCard, {
            backgroundColor: theme.contactSuggestionBg,
            borderColor: theme.contactSuggestionBorder,
          }]}>
            <View style={[styles.dashedCircle, { borderColor: theme.contactSuggestionBorder }]}>
              <Feather name="user-plus" size={24} color={theme.contactSuggestionIcon} />
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[{ fontWeight: "bold", fontSize: 14 }, { color: theme.text }]}>
                {t.contactos.agregar_mas}
              </Text>
              <Text style={{ fontSize: 12, color: theme.contactSubtext }}>
                {t.contactos.agregar_desc}
              </Text>
              <Text style={{ fontSize: 11, color: theme.contactSubtext, marginTop: 6, lineHeight: 16 }}>
                {t.contactos.recomendacion}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addSmallButton, { backgroundColor: theme.contactAddButtonBg }]}
              onPress={vm.goToAddContact}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>
                {t.contactos.agregar_corto}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* BOTÓN FLOTANTE */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: theme.contactFloatingBg }]}
        onPress={vm.goToAddContact}
      >
        <MaterialIcons name="person-add" size={28} color="white" />
      </TouchableOpacity>

      <ContactActionsModal
        visible={vm.modalVisible}
        contactNameValue={vm.selectedContact?.name || ""}
        onUpdate={vm.handleUpdate}
        onDelete={vm.handleDelete}
        onClose={vm.closeActionsModal}
      />
    </View>
  );
}