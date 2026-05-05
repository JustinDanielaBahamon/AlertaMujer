import React from "react";
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { styles } from "./perfilStyle";
import { usePerfilViewModel } from "./usePerfilViewModel";

export default function PerfilScreen() {
  const vm = usePerfilViewModel();
  const insets = useSafeAreaInsets();

  const esError = vm.mensaje.toLowerCase().includes("error") ||
                  vm.mensaje.toLowerCase().includes("vacío") ||
                  vm.mensaje.toLowerCase().includes("válido");

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor="#460447" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={vm.volver}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Mi Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Foto de perfil */}
        <View style={styles.contenedorFoto}>
          <TouchableOpacity onPress={vm.seleccionarFoto} activeOpacity={0.8}>
            <View style={styles.circuloFoto}>
              {vm.fotoPerfil ? (
                <Image source={{ uri: vm.fotoPerfil }} style={styles.foto} />
              ) : (
                <Ionicons name="person-outline" size={44} color="#BC27BE" />
              )}
            </View>
            {/* Ícono de cámara sobre la foto */}
            <View style={{
              position: "absolute", bottom: 4, right: 4,
              backgroundColor: "#BC27BE", borderRadius: 14, padding: 5,
            }}>
              <Ionicons name="camera-outline" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnCambiarFoto} onPress={vm.seleccionarFoto}>
            <Text style={styles.textoCambiarFoto}>📷 Cambiar foto</Text>
          </TouchableOpacity>
        </View>

        {/* Datos personales */}
        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>Datos personales</Text>

          <View style={styles.contenedorInput}>
            <Ionicons name="person-outline" size={20} color="#460447" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor="#999"
              value={vm.nombre}
              onChangeText={vm.setNombre}
              selectionColor="#460447"
            />
          </View>

          <View style={styles.contenedorInput}>
            <Ionicons name="mail-outline" size={20} color="#460447" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#999"
              value={vm.correo}
              onChangeText={vm.setCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
              selectionColor="#460447"
            />
          </View>
        </View>

        {/* Mensaje feedback */}
        {vm.mensaje ? (
          <Text style={esError ? styles.mensajeError : styles.mensajeExito}>
            {vm.mensaje}
          </Text>
        ) : null}

        {/* Botón guardar */}
        <TouchableOpacity style={styles.btnGuardar} onPress={vm.guardarCambios} disabled={vm.cargando}>
          {vm.cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textoGuardar}>Guardar cambios</Text>
          )}
        </TouchableOpacity>

        {/* Botón cambiar contraseña */}
        <TouchableOpacity style={styles.btnContrasena} onPress={vm.irACambiarContrasena}>
          <Ionicons name="lock-closed-outline" size={20} color="#460447" />
          <Text style={styles.textoContrasena}>Cambiar contraseña</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}