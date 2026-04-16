import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRecuperarContrasenaViewModel } from './useRecuperarContrasenaViewModel';
import { styles } from "./recuperarPassword.style";

export default function RecuperarContrasenaScreen() {
  const vm = useRecuperarContrasenaViewModel();
  const inputs = useRef<Array<TextInput | null>>([]);

  return (
    <ScrollView
      style={styles.ContenedorPrincipal}
      contentContainerStyle={styles.ScrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {/* LOGO */}
        <View style={styles.ContenedorLogo}>
          <Image 
            source={require('../../assets/imagesAlertaMujer/logoAlertaMujer.png')} 
            style={styles.ImagenLogo} 
          />
        </View>

        {/* TEXTOS DINÁMICOS */}
        <Text style={styles.titulo}>
          {vm.paso === 1 ? "¿Olvidaste tu contraseña?" : "Verifica tu identidad"}
        </Text>

        <Text style={styles.subtitulo}>
          {vm.paso === 1 
            ? "Ingresa tu correo registrado para recibir un código de seguridad." 
            : "Ingresa el código de 4 dígitos que enviamos a tu bandeja de entrada."}
        </Text>

        {/* PASO 1: EMAIL */}
        {vm.paso === 1 && (
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={22} color="#6B3FA0" />
            <TextInput
              style={{ flex: 1, height: 50, marginLeft: 10, color: '#333' }}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#999"
              value={vm.email}
              onChangeText={vm.setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        )}

        {/* PASO 2: CÓDIGO OTP */}
        {vm.paso === 2 && (
          <View style={styles.codigoContainer}>
            {vm.codigo.map((digito, index) => (
              <TextInput
                key={index}
                ref={(el) => { inputs.current[index] = el; }}
                style={styles.inputCuadro}
                maxLength={1}
                keyboardType="number-pad"
                value={digito}
                onChangeText={(text) => {
                  vm.handleCodigoChange(text, index);
                  if (text && index < 3) inputs.current[index + 1]?.focus();
                }}
              />
            ))}
          </View>
        )}

        {/* BOTÓN ACCIÓN */}
        <TouchableOpacity 
          style={styles.botonPrincipal} 
          onPress={vm.paso === 1 ? vm.enviarEnlace : vm.verificarCodigo}
          activeOpacity={0.8}
        >
          {vm.isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.botonTexto}>
              {vm.paso === 1 ? "Enviar Código" : "Confirmar Código"}
            </Text>
          )}
        </TouchableOpacity>

        {/* LINKS DE RETORNO */}
        <TouchableOpacity 
          onPress={vm.paso === 1 ? vm.cancelar : () => vm.setPaso(1)} 
          style={{ marginTop: 25 }}
        >
          <Text style={styles.linkTexto}>
            {vm.paso === 1 ? "Volver al inicio de sesión" : "Solicitar un nuevo código"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}