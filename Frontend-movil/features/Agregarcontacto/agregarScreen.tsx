import React from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform , Image} from "react-native";
import Header from "../../src/components/ui/Header/header";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./agregarConstyle";
import { useAgregarContactoViewModel } from "./useAgregarContactoViewModel";
import { useLocale } from "../../src/contexts/LocaleContext";
import { LinearGradient } from "expo-linear-gradient";


export default function AgregarContacto() {
  const vm = useAgregarContactoViewModel();
  const { t } = useLocale();
  const s = styles as Record<string, any>;

  const inicialNombre = vm.nombre.trim().charAt(0).toUpperCase() || "C";
  const parentescoPreview = vm.parentesco.trim() || "Relación";
  const telefonoPreview = vm.telefono.trim() || "Sin número";
  const nombrePreview = vm.nombre.trim() || "Nuevo contacto";

  const nombreValido = vm.nombre.trim().length > 0;
  const parentescoValido = vm.parentesco.trim().length > 0;
  const telefonoValido = vm.telefono.replace(/\D/g, "").length >= 10;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.container}>
      <Header />

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

          {/* HEADER */}
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
              source={require("../../assets/imagesAlertaMujer/ScContacto/security.png")}
              style={{ width: 100, height: 75, resizeMode: 'cover' }}
            />
          </View>
        </LinearGradient>
      </View>
        <View style={s.content}>

        

          {/* CARD */}
          <View style={s.card}>

            <View style={s.sectionHeader}>
              <View style={s.sectionIcon}>
                <Ionicons name="people-outline" size={22} color="#7B1DB2" />
              </View>
              <Text style={s.sectionTitle}>Información del contacto</Text>
            </View>

            {/* INPUT NOMBRE */}
            <View style={s.inputCard}>
              <Ionicons name="person-outline" size={20} color="#8A47C2" />
              <View style={s.inputTextWrap}>
                <Text style={s.inputLabel}>Nombre</Text>
                <TextInput
                  style={s.inputCustom}
                  placeholder={t.agregar.placeholder_nombre}
                  value={vm.nombre}
                  onChangeText={vm.setNombre}
                />
              </View>
              {nombreValido && <Ionicons name="checkmark-circle" size={20} color="#46B987" />}
            </View>

            {/* INPUT PARENTESCO */}
            <View style={s.inputCard}>
              <Ionicons name="people-outline" size={20} color="#8A47C2" />
              <View style={s.inputTextWrap}>
                <Text style={s.inputLabel}>Parentesco</Text>
                <TextInput
                  style={s.inputCustom}
                  placeholder={t.agregar.placeholder_parentesco}
                  value={vm.parentesco}
                  onChangeText={vm.setParentesco}
                />
              </View>
              {parentescoValido && <Ionicons name="checkmark-circle" size={20} color="#46B987" />}
            </View>

            {/* INPUT TELÉFONO */}
            <View style={s.inputCard}>
              <Ionicons name="call-outline" size={20} color="#8A47C2" />
              <View style={s.inputTextWrap}>
                <Text style={s.inputLabel}>Celular</Text>
                <TextInput
                  style={s.inputCustom}
                  placeholder={t.agregar.placeholder_telefono}
                  keyboardType="phone-pad"
                  value={vm.telefono}
                  onChangeText={vm.setTelefono}
                />
              </View>

              {telefonoValido && <Ionicons name="checkmark-circle" size={20} color="#46B987" />}

              <TouchableOpacity onPress={vm.abrirAgenda} style={s.contactIcon}>
                <Ionicons name="add" size={16} color="#7B1DB2" />
              </TouchableOpacity>
            </View>

            {/* INFO */}
            <View style={s.infoBox}>
              <View style={s.infoIconAbajo}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#8A47C2" />
              </View>
              <Text style={s.infoText}>
                Este contacto recibirá tu ubicación si activas una alerta.
              </Text>
            </View>

            {/* PREVIEW */}
            <Text style={s.previewTitle}>Vista previa</Text>

            <View style={s.previewCard}>
              <View style={s.previewAvatar}>
                <Text style={s.previewAvatarText}>{inicialNombre}</Text>
              </View>

              <View style={s.previewBody}>
                <Text style={s.previewName}>{nombrePreview}</Text>

                <View style={s.previewChip}>
                  <Ionicons name="heart" size={12} color="#8A47C2" />
                  <Text style={s.previewChipText}>{parentescoPreview}</Text>
                </View>

                <Text style={s.previewValue}>{telefonoPreview}</Text>

                <View style={s.previewRow}>
                  <View style={s.statusDot} />
                  <Text style={s.statusText}>Disponible</Text>
                </View>
              </View>
            </View>

            {/* BOTÓN GUARDAR */}
            <LinearGradient colors={["#8A47C2", "#6D22A7"]} style={s.btnGuardarPrincipal}>
              <TouchableOpacity style={s.buttonInner} onPress={vm.guardar}>
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={s.btnTextWhite}>Guardar contacto</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* CANCELAR */}
            <TouchableOpacity style={s.btnCancelarLink} onPress={vm.cancelar}>
              <Text style={s.btnTextGray}>Cancelar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}