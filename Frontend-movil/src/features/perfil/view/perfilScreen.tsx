import React, { useMemo } from "react";
import {
  View, Text, TouchableOpacity, Image,
  TextInput, ScrollView, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { createPerfilStyles } from "../styles/perfilStyle";
import { usePerfilViewModel } from "../viewModel/usePerfilViewModel";
import { useTheme } from "../../../contexts/ThemeContext";

// Genera iniciales desde el nombre completo (máx 2 letras)
function getIniciales(nombre: string): string {
  if (!nombre.trim()) return "?";
  return nombre
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PerfilScreen() {
  const vm = usePerfilViewModel();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = useMemo(() => createPerfilStyles(theme), [theme]);

  const esError =
    vm.mensaje.toLowerCase().includes("error") ||
    vm.mensaje.toLowerCase().includes("vacío") ||
    vm.mensaje.toLowerCase().includes("válido") ||
    vm.mensaje.toLowerCase().includes("formato");

  return (
    <View style={[styles.contenedor, { paddingTop: insets.top }]}>
      <StatusBar style="light" backgroundColor={theme.headercolor1} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={vm.volver} style={styles.btnVolver}>
          <Ionicons name="arrow-back" size={22} color={theme.headerText} />
        </TouchableOpacity>
        <Text style={styles.tituloHeader}>Mi perfil</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.contenedorFoto}>
          <TouchableOpacity
            onPress={vm.seleccionarFoto}
            activeOpacity={0.8}
            style={styles.avatarWrap}
          >
            <View style={styles.circuloFoto}>
              {vm.fotoPerfil ? (
                <Image source={{ uri: vm.fotoPerfil }} style={styles.foto} />
              ) : (
                // Iniciales — siempre visibles sin importar el tema
                <Text style={styles.inicialesText}>
                  {getIniciales(vm.nombre)}
                </Text>
              )}
            </View>
            <View style={styles.camaraIcono}>
              <Ionicons name="camera-outline" size={13} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.nombreUsuario}>{vm.nombre || "Tu nombre"}</Text>
          <Text style={styles.correoUsuario}>{vm.correo || "tu@correo.com"}</Text>
        </View>

        {/* Cuerpo */}
        <View style={styles.cuerpo}>

          {/* ── Datos personales ── */}
          <View style={styles.tarjeta}>
            <Text style={styles.tituloSeccion}>Datos personales</Text>

            {/* Nombre */}
            <View style={styles.campoWrap}>
              <Text style={styles.inputLabel}>Nombre completo</Text>
              <View style={styles.contenedorInput}>
                <Ionicons name="person-outline" size={18} color={theme.icono} />
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre completo"
                  placeholderTextColor={theme.icono + "70"}
                  value={vm.nombre}
                  onChangeText={vm.setNombre}
                  selectionColor={theme.icono}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Correo */}
            <View style={styles.campoWrap}>
              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <View style={styles.contenedorInput}>
                <Ionicons name="mail-outline" size={18} color={theme.icono} />
                <TextInput
                  style={styles.input}
                  placeholder="tu@correo.com"
                  placeholderTextColor={theme.icono + "70"}
                  value={vm.correo}
                  onChangeText={vm.setCorreo}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  selectionColor={theme.icono}
                />
              </View>
            </View>

            {/* Teléfono */}
            <View style={styles.campoWrap}>
              <Text style={styles.inputLabel}>Teléfono</Text>
              <View style={styles.contenedorInput}>
                <Ionicons name="call-outline" size={18} color={theme.icono} />
                <TextInput
                  style={styles.input}
                  placeholder="+57 300 000 0000"
                  placeholderTextColor={theme.icono + "70"}
                  value={vm.telefono}
                  onChangeText={vm.setTelefono}
                  keyboardType="phone-pad"
                  selectionColor={theme.icono}
                />
              </View>
            </View>

            {/* Fecha de nacimiento */}
            <View style={styles.campoWrap}>
              <Text style={styles.inputLabel}>Fecha de nacimiento</Text>
              <View style={styles.contenedorInput}>
                <Ionicons name="calendar-outline" size={18} color={theme.icono} />
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={theme.icono + "70"}
                  value={vm.fechaNacimiento}
                  onChangeText={vm.handleFechaChange}
                  keyboardType="numeric"
                  maxLength={10}
                  selectionColor={theme.icono}
                />
              </View>
            </View>
          </View>

          {/* ── Ubicación (solo lectura) ── */}
          <View style={styles.tarjeta}>
            <Text style={styles.tituloSeccion}>Ubicación</Text>

            {/* Departamento */}
            <View style={styles.campoWrap}>
              <Text style={styles.inputLabel}>Departamento</Text>
              <View style={styles.contenedorInputReadonly}>
                <Ionicons name="map-outline" size={18} color={theme.icono} />
                <Text style={styles.inputReadonly}>{vm.department}</Text>
                <View style={styles.badgeFijo}>
                  <Text style={styles.badgeFijoText}>Fijo</Text>
                </View>
              </View>
            </View>

            {/* Municipio */}
            <View style={styles.campoWrap}>
              <Text style={styles.inputLabel}>Municipio</Text>
              <View style={styles.contenedorInputReadonly}>
                <Ionicons name="location-outline" size={18} color={theme.icono} />
                <Text style={styles.inputReadonly}>
                  {vm.municipio || "Sin configurar"}
                </Text>
                {vm.municipio ? (
                  <View style={styles.badgeFijo}>
                    <Text style={styles.badgeFijoText}>✓</Text>
                  </View>
                ) : null}
              </View>
              {!vm.municipio && (
                <Text style={styles.hintText}>
                  Configura tu municipio en el tutorial de ubicación
                </Text>
              )}
            </View>
          </View>

          {/* Feedback */}
          {vm.mensaje ? (
            <Text style={esError ? styles.mensajeError : styles.mensajeExito}>
              {vm.mensaje}
            </Text>
          ) : null}

          {/* Guardar */}
          <TouchableOpacity
            style={styles.btnGuardar}
            onPress={vm.guardarCambios}
            disabled={vm.cargando}
            activeOpacity={0.85}
          >
            {vm.cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoGuardar}>Guardar cambios</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}