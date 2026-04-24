import React from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView } from "react-native";
import Header from "../../src/components/ui/Header/header";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./agregarConstyle";
import { useAgregarContactoViewModel } from "./useAgregarContactoViewModel";
import { useLocale } from "../../src/contexts/LocaleContext";

export default function AgregarContacto() {
  const vm = useAgregarContactoViewModel();
  const { t } = useLocale();

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.titulo}>{vm.tituloPantalla}</Text>

        <View style={styles.card}>
          {/* Input Nombre */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={24} color="#A020F0" style={styles.inputIcon} />
            <TextInput
              style={styles.inputCustom}
              placeholder={t.agregar.placeholder_nombre}
              value={vm.nombre}
              onChangeText={vm.setNombre}
            />
          </View>

          {/* Input Parentesco */}
          <View style={styles.inputWrapper}>
            <Ionicons name="people-outline" size={24} color="#A020F0" style={styles.inputIcon} />
            <TextInput
              style={styles.inputCustom}
              placeholder={t.agregar.placeholder_parentesco}
              value={vm.parentesco}
              onChangeText={vm.setParentesco}
            />
          </View>

          {/* Input Telefono + Icono de Agenda */}
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={24} color="#A020F0" style={styles.inputIcon} />
            <TextInput
              style={[styles.inputCustom, { flex: 1 }]}
              placeholder={t.agregar.placeholder_telefono}
              keyboardType="phone-pad"
              value={vm.telefono}
              onChangeText={vm.setTelefono}
            />
            <TouchableOpacity onPress={vm.abrirAgenda} style={styles.contactIcon}>
              <Ionicons name="add-circle-outline" size={28} color="#A020F0" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.btnGuardarPrincipal} onPress={vm.guardar}>
            <Text style={styles.btnTextWhite}>{vm.etiquetaBotonGuardar}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnCancelarLink} onPress={vm.cancelar}>
            <Text style={styles.btnTextGray}>{t.agregar.cancelar}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}