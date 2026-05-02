import React from "react";
import {View,Text,TextInput,TouchableOpacity,KeyboardAvoidingView,ScrollView,Platform, Image,} from "react-native";
import Header from "../../src/components/ui/Header/header";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./agregarConstyle";
import { useAgregarContactoViewModel } from "./useAgregarContactoViewModel";
import { useLocale } from "../../src/contexts/LocaleContext";
import { useTheme } from "../../src/contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

export default function AgregarContacto() {
  const vm = useAgregarContactoViewModel();
  const { t } = useLocale();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const headerGradient: [string, string] = [theme.headercolor1, theme.headercolor2];

  // Valores para la vista previa
  const nameInitial = vm.nombre.trim().charAt(0).toUpperCase() || "C";
  const relationPreview = vm.parentesco.trim() || "Relación";
  const phonePreview = vm.telefono.trim() || "Sin número";
  const namePreview = vm.nombre.trim() || "Nuevo contacto";

  // Validaciones de campos
  const isNameValid = vm.nombre.trim().length > 0;
  const isRelationValid = vm.parentesco.trim().length > 0;
  const isPhoneValid = vm.telefono.replace(/\D/g, "").length >= 10;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* HEADER */}
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
                source={require("../../assets/imagesAlertaMujer/ScContacto/security.png")}
                style={{ width: 100, height: 75, resizeMode: "cover" }}
              />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.content}>

          {/* CARD PRINCIPAL */}
          <View style={styles.card}>

            {/* Encabezado de sección */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="people-outline" size={22} color={theme.contactAccent} />
              </View>
              <Text style={styles.sectionTitle}>Información del contacto</Text>
            </View>

            {/* INPUT NOMBRE */}
            <View style={styles.inputCard}>
              <Ionicons name="person-outline" size={20} color={theme.contactAccent} />
              <View style={styles.inputTextWrap}>
                <Text style={styles.inputLabel}>Nombre</Text>
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
                <Text style={styles.inputLabel}>Parentesco</Text>
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
                <Text style={styles.inputLabel}>Celular</Text>
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

            {/* CAJA DE INFO */}
            <View style={styles.infoBox}>
              <View style={styles.infoIconBottom}>
                <Ionicons name="shield-checkmark-outline" size={20} color={theme.contactAccent} />
              </View>
              <Text style={styles.infoText}>
                Este contacto recibirá tu ubicación si activas una alerta.
              </Text>
            </View>

            {/* VISTA PREVIA */}
            <Text style={styles.previewTitle}>Vista previa</Text>

            <View style={styles.previewCard}>
              <View style={styles.previewAvatar}>
                <Text style={styles.previewAvatarText}>{nameInitial}</Text>
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
                  <Text style={styles.statusText}>Disponible</Text>
                </View>
              </View>
            </View>

            {/* BOTÓN GUARDAR */}
            <LinearGradient
              colors={headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              <TouchableOpacity style={styles.buttonInner} onPress={vm.guardar}>
                <Ionicons name="save-outline" size={18} color="#f7eeee" />
                <Text style={styles.buttonTextWhite}>Guardar contacto</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* CANCELAR */}
            <TouchableOpacity style={styles.cancelButton} onPress={vm.cancelar}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}