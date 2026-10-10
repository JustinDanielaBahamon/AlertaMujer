import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRecuperarContrasenaViewModel } from '../viewModel/useRecuperarContrasenaViewModel';
import { styles } from "../styles/recuperarPassword.style";
// Traemos el hook del idioma para usar los textos del JSON
import { useLocale } from "../../../contexts/LocaleContext";
// Modal bonito para los mensajes (error, éxito, aviso)
import ModalAlerta from "../../../components/ui/modalAlerta/modalAlerta";

export default function RecuperarContrasenaScreen() {
  const vm = useRecuperarContrasenaViewModel();
  const { t } = useLocale(); // "t" tiene todos los textos del idioma activo
  const inputs = useRef<Array<TextInput | null>>([]);

  // Textos y acciones que cambian según el paso (1, 2 o 3)
  const titulo =
    vm.paso === 1 ? t.recuperar.titulo_paso1 :
    vm.paso === 2 ? t.recuperar.titulo_paso2 :
    t.recuperar.titulo_paso3;

  const subtitulo =
    vm.paso === 1 ? t.recuperar.subtitulo_paso1 :
    vm.paso === 2 ? t.recuperar.subtitulo_paso2 :
    t.recuperar.subtitulo_paso3;

  const textoBoton =
    vm.paso === 1 ? t.recuperar.boton_paso1 :
    vm.paso === 2 ? t.recuperar.boton_paso2 :
    t.recuperar.boton_paso3;

  const accionBoton =
    vm.paso === 1 ? vm.enviarEnlace :
    vm.paso === 2 ? vm.verificarCodigo :
    vm.guardarNuevaContrasena;

  const textoLink = vm.paso === 2 ? t.recuperar.nuevo_codigo : t.recuperar.volver;

  const accionLink = () => {
    if (vm.paso === 2) {
      vm.reenviarCodigo();
      setTimeout(() => inputs.current[0]?.focus(), 100); // vuelve al primer cuadro
    } else {
      vm.cancelar();
    }
  };

  const botonDeshabilitado = vm.paso === 2 && vm.expirado;

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
            source={require('@assets/imagesAlertaMujer/logos/logoAlertaMujer.png')} 
            style={styles.ImagenLogo} 
          />
        </View>

        {/* TEXTOS DINAMICOS: cambian segun el paso (1, 2 o 3) */}
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.subtitulo}>{subtitulo}</Text>

        {/* PASO 1: EMAIL */}
        {vm.paso === 1 && (
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={22} color="#6B3FA0" />
            <TextInput
              style={styles.inputTexto}
              placeholder={t.recuperar.placeholder_correo}
              placeholderTextColor="#999"
              value={vm.email}
              onChangeText={vm.setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        )}

        {/* PASO 2: CODIGO OTP + TEMPORIZADOR */}
        {vm.paso === 2 && (
          <>
            <View style={styles.codigoContainer}>
              {vm.codigo.map((digito, index) => (
                <TextInput
                  key={index}
                  ref={(el) => { inputs.current[index] = el; }}
                  style={[styles.inputCuadro, vm.expirado && styles.inputCuadroExpirado]}
                  maxLength={1}
                  keyboardType="number-pad"
                  autoFocus={index === 0}
                  editable={!vm.expirado}
                  value={digito}
                  onChangeText={(text) => {
                    const limpio = text.replace(/\D/g, '');
                    vm.handleCodigoChange(limpio, index);
                    if (limpio && index < 3) inputs.current[index + 1]?.focus();
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    // Borrar en un cuadro vacío regresa al anterior
                    if (nativeEvent.key === 'Backspace' && !digito && index > 0) {
                      inputs.current[index - 1]?.focus();
                    }
                  }}
                />
              ))}
            </View>

            <Text style={[styles.timerTexto, vm.expirado && styles.timerExpirado]}>
              {vm.expirado
                ? t.recuperar.codigo_expirado
                : `${t.recuperar.tiempo_restante} ${vm.tiempoFormateado}`}
            </Text>
          </>
        )}

        {/* PASO 3: NUEVA CONTRASEÑA + CONFIRMAR */}
        {vm.paso === 3 && (
          <>
            <View style={[styles.inputContainer, { marginBottom: 16 }]}>
              <MaterialIcons name="lock" size={22} color="#6B3FA0" />
              <TextInput
                style={styles.inputTexto}
                placeholder={t.recuperar.placeholder_nueva}
                placeholderTextColor="#999"
                secureTextEntry={!vm.mostrarNueva}
                autoCapitalize="none"
                value={vm.nuevaPassword}
                onChangeText={vm.setNuevaPassword}
              />
              <TouchableOpacity onPress={vm.toggleMostrarNueva}>
                <MaterialIcons
                  name={vm.mostrarNueva ? "visibility" : "visibility-off"}
                  size={22}
                  color="#6B3FA0"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={22} color="#6B3FA0" />
              <TextInput
                style={styles.inputTexto}
                placeholder={t.recuperar.placeholder_confirmar}
                placeholderTextColor="#999"
                secureTextEntry={!vm.mostrarConfirmar}
                autoCapitalize="none"
                value={vm.confirmarPassword}
                onChangeText={vm.setConfirmarPassword}
              />
              <TouchableOpacity onPress={vm.toggleMostrarConfirmar}>
                <MaterialIcons
                  name={vm.mostrarConfirmar ? "visibility" : "visibility-off"}
                  size={22}
                  color="#6B3FA0"
                />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* BOTON ACCION: cambia segun el paso */}
        <TouchableOpacity 
          style={[styles.botonPrincipal, botonDeshabilitado && styles.botonDeshabilitado]} 
          onPress={accionBoton}
          disabled={botonDeshabilitado}
          activeOpacity={0.8}
        >
          {vm.isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.botonTexto}>{textoBoton}</Text>
          )}
        </TouchableOpacity>

        {/* LINK: nuevo código (paso 2) o volver al login (pasos 1 y 3) */}
        <TouchableOpacity onPress={accionLink} style={{ marginTop: 25 }}>
          <Text style={styles.linkTexto}>{textoLink}</Text>
        </TouchableOpacity>
      </View>

      {/* MENSAJES: error, éxito y aviso con el diseño de la app */}
      <ModalAlerta
        visible={vm.alerta.visible}
        tipo={vm.alerta.tipo}
        titulo={vm.alerta.titulo}
        mensaje={vm.alerta.mensaje}
        textoBoton={vm.alerta.textoBoton}
        onCerrar={vm.cerrarAlerta}
      />
    </ScrollView>
  );
}