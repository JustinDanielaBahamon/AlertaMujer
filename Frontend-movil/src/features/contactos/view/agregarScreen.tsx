import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import Header from "../../../components/ui/Header/header";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "../style/agregarConstyle";
import { useAgregarContactoViewModel } from "../viewModel/useAgregarContactoViewModel";
import { useLocale } from "../../../contexts/LocaleContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

export default function AgregarContacto() {
  const vm = useAgregarContactoViewModel();
  const { t } = useLocale();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const headerGradient: [string, string] = [theme.headercolor1, theme.headercolor2];

  const nameInitial = vm.nombre.trim().charAt(0).toUpperCase() || "C";
  const relationPreview = vm.parentesco.trim() || "Relación";
  const phonePreview = vm.telefono.trim() || "Sin número";
  const namePreview = vm.nombre.trim() || t.agregar.titulo_agregar;

  const isNameValid = vm.nombre.trim().length > 0;
  const isRelationValid = vm.parentesco.trim().length > 0;
  const isPhoneValid = vm.telefono.replace(/\D/g, "").length >= 10;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Header />

      <LinearGradient
        colors={headerGradient}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{t.agregar.header_titulo}</Text>
            <Text style={styles.headerSubtitle}>
              {t.agregar.header_subtitulo}
            </Text>
          </View>
          <Image
            source={require("@assets/imagesAlertaMujer/ScContacto/security.png")}
            style={{ width: 100, height: 75, resizeMode: "cover" }}
          />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.card}>

            {/* ── SELECTOR DE FOTO — zona visual prominente ─────────────── */}
            <View style={{
              alignItems: "center",
              paddingVertical: 20,
              borderBottomWidth: 1,
              borderBottomColor: theme.contactDivider,
              marginBottom: 16,
            }}>
              <Text style={[styles.sectionTitle, { marginBottom: 14, textAlign: "center" }]}>
                {t.agregar.foto_titulo}
              </Text>

              <TouchableOpacity
                onPress={vm.seleccionarFoto}
                activeOpacity={0.85}
                style={{ alignItems: "center" }}
              >
                {/* Anillo decorativo alrededor del avatar */}
                <View style={{
                  width: 108,
                  height: 108,
                  borderRadius: 54,
                  padding: 3,
                  borderWidth: 2.5,
                  borderColor: vm.fotoUri ? theme.contactAccent : theme.contactDivider,
                  borderStyle: vm.fotoUri ? "solid" : "dashed",
                  marginBottom: 10,
                }}>
                  {vm.fotoUri ? (
                    <Image
                      source={{ uri: vm.fotoUri }}
                      style={{ width: 98, height: 98, borderRadius: 49 }}
                    />
                  ) : (
                    <View style={{
                      width: 98,
                      height: 98,
                      borderRadius: 49,
                      backgroundColor: theme.contactAccent + "18",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Text style={{
                        fontSize: 36,
                        fontWeight: "800",
                        color: theme.contactAccent,
                        opacity: 0.7,
                      }}>
                        {nameInitial}
                      </Text>
                    </View>
                  )}

                  {/* Badge cámara */}
                  <LinearGradient
                    colors={headerGradient}
                    style={{
                      position: "absolute",
                      bottom: 2,
                      right: 2,
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "#fff",
                    }}
                  >
                    <Ionicons name="camera" size={14} color="#fff" />
                  </LinearGradient>
                </View>

                <Text style={{
                  fontSize: 13,
                  color: theme.contactAccent,
                  fontWeight: "600",
                  marginBottom: 4,
                }}>
                  {vm.fotoUri ? t.agregar.foto_cambiar : t.agregar.foto_agregar}
                </Text>
                <Text style={{ fontSize: 11, color: theme.contactSubtext, textAlign: "center" }}>
                  {vm.fotoUri
                    ? t.agregar.foto_galeria_cambiar
                    : t.agregar.foto_galeria_inicial}
                </Text>
              </TouchableOpacity>

              {/* Botón quitar foto (solo visible si hay foto) */}
              {vm.fotoUri && (
                <TouchableOpacity
                  onPress={vm.quitarFoto}
                  style={{
                    marginTop: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "#E53935",
                  }}
                >
                  <Ionicons name="trash-outline" size={13} color="#E53935" />
                  <Text style={{ fontSize: 12, color: "#E53935", fontWeight: "600" }}>
                    {t.agregar.foto_quitar}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {/* ──────────────────────────────────────────────────────────── */}

            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="people-outline" size={22} color={theme.contactAccent} />
              </View>
              <Text style={styles.sectionTitle}>{t.agregar.info_contacto_titulo}</Text>
            </View>

            {/* INPUT NOMBRE */}
            <View style={styles.inputCard}>
              <Ionicons name="person-outline" size={20} color={theme.contactAccent} />
              <View style={styles.inputTextWrap}>
                <Text style={styles.inputLabel}>{t.agregar.label_nombre}</Text>
                <TextInput
                  style={styles.inputValue}
                  placeholder={t.agregar.placeholder_nombre}
                  placeholderTextColor={theme.contactSubtext}
                  value={vm.nombre}
                  onChangeText={vm.setNombre}
                />
              </View>
              {isNameValid && (
                <Ionicons name="checkmark-circle" size={20} color="#46B987" />
              )}
            </View>

            {/* INPUT PARENTESCO */}
            <View style={styles.inputCard}>
              <Ionicons name="people-outline" size={20} color={theme.contactAccent} />
              <View style={styles.inputTextWrap}>
                <Text style={styles.inputLabel}>{t.agregar.label_parentesco}</Text>
                <TextInput
                  style={styles.inputValue}
                  placeholder={t.agregar.placeholder_parentesco}
                  placeholderTextColor={theme.contactSubtext}
                  value={vm.parentesco}
                  onChangeText={vm.setParentesco}
                />
              </View>
              {isRelationValid && (
                <Ionicons name="checkmark-circle" size={20} color="#46B987" />
              )}
            </View>

            {/* INPUT TELÉFONO */}
            <View style={styles.inputCard}>
              <Ionicons name="call-outline" size={20} color={theme.contactAccent} />
              <View style={styles.inputTextWrap}>
                <Text style={styles.inputLabel}>{t.agregar.label_celular}</Text>
                <TextInput
                  style={styles.inputValue}
                  placeholder={t.agregar.placeholder_telefono}
                  placeholderTextColor={theme.contactSubtext}
                  keyboardType="phone-pad"
                  value={vm.telefono}
                  onChangeText={vm.setTelefono}
                />
              </View>
              {isPhoneValid && (
                <Ionicons name="checkmark-circle" size={20} color="#46B987" />
              )}
              <TouchableOpacity onPress={vm.abrirAgenda} style={styles.contactIconButton}>
                <Ionicons name="add" size={16} color={theme.contactAccent} />
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoIconBottom}>
                <Ionicons name="shield-checkmark-outline" size={20} color={theme.contactAccent} />
              </View>
              <Text style={styles.infoText}>
                {t.agregar.info_ubicacion}
              </Text>
            </View>

            {/* ── VISTA PREVIA ──────────────────────────────────────────── */}
            <Text style={styles.previewTitle}>{t.agregar.vista_previa}</Text>

            <View style={styles.previewCard}>
              <View style={{ position: "relative" }}>
                {vm.fotoUri ? (
                  <Image
                    source={{ uri: vm.fotoUri }}
                    style={[styles.previewAvatar, { borderRadius: 28 }]}
                  />
                ) : (
                  <View style={[
                    styles.previewAvatar,
                    {
                      backgroundColor: theme.contactAccent + "22",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 28,
                    },
                  ]}>
                    <Text style={{
                      color: theme.contactAccent,
                      fontSize: 22,
                      fontWeight: "700",
                    }}>
                      {nameInitial}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.previewBody}>
                <Text style={styles.previewName}>{namePreview}</Text>
                <View style={styles.previewChip}>
                  <Ionicons name="heart" size={12} color={theme.contactAccent} />
                  <Text style={styles.previewChipText}>{relationPreview}</Text>
                </View>
                <Text style={styles.previewValue}>{phonePreview}</Text>
                <View style={styles.previewRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{t.agregar.disponible}</Text>
                </View>
              </View>
            </View>
            {/* ──────────────────────────────────────────────────────────── */}

            <LinearGradient
              colors={headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              {/* ✅ guardar() ya no necesita recibir fotoUri como argumento */}
              <TouchableOpacity style={styles.buttonInner} onPress={vm.guardar}>
                <Ionicons name="save-outline" size={18} color="#f7eeee" />
                <Text style={styles.buttonTextWhite}>{t.agregar.boton_guardar_nuevo}</Text>
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity style={styles.cancelButton} onPress={vm.cancelar}>
              <Text style={styles.cancelButtonText}>{t.agregar.cancelar}</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}