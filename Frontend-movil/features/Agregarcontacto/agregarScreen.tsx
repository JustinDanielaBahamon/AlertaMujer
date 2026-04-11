import React from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView } from "react-native";
import Header from "../../src/components/ui/Header/header";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./agregarConstyle";
import { useAgregarContactoViewModel } from "./useAgregarContactoViewModel";

export default function AgregarContacto() {
  const vm = useAgregarContactoViewModel();

  return (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.titulo}>Contacto</Text>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20, width: "100%" }}>
          <Ionicons name="person-outline" size={35} color="black" style={{ marginRight: 15 }} />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#999"
            value={vm.nombre}
            onChangeText={vm.setNombre}
          />
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20, width: "100%" }}>
          <View style={{ width: 50 }} />
          <TextInput
            style={styles.input}
            placeholder="Parentesco"
            placeholderTextColor="#999"
            value={vm.parentesco}
            onChangeText={vm.setParentesco}
          />
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20, width: "100%" }}>
          <Ionicons name="call-outline" size={35} color="black" style={{ marginRight: 15 }} />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={vm.telefono}
            onChangeText={vm.setTelefono}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.btnGuardar} onPress={vm.guardar}>
            <Text style={styles.btnTextGuardar}>Guardar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnCancelar} onPress={vm.cancelar}>
            <Text style={styles.btnTextCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
