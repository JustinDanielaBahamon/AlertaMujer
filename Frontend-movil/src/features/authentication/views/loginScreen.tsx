import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../styles/login.styles";
import { useLoginViewModel } from "../viewModel/useLoginViewModel";
import { useLocale } from "../../../contexts/LocaleContext";

export default function Login() {
  const vm = useLoginViewModel();
  const { t } = useLocale();
  const insets = useSafeAreaInsets(); // detecta los espacios del teléfono

  useEffect(() => {
    async function setNavBar() {
      await NavigationBar.setBackgroundColorAsync("#460447");
      await NavigationBar.setButtonStyleAsync("light");
    }
    setNavBar();
  }, []);

  return (
    <View style={{
      flex: 1,
      backgroundColor: "#460447",
      paddingTop: insets.top,       // espacio arriba según el teléfono
      paddingBottom: insets.bottom, // espacio abajo según el teléfono
    }}>
      <StatusBar style="light" backgroundColor="#460447" />

      <ScrollView
        style={styles.ContenedorPrincipal}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ContenedorLogo}>
          <Image
            source={require('../../../../assets/imagesAlertaMujer/logos/logoAlertaMujer.png')}
            style={styles.ImagenLogo}
          />
        </View>

        <View style={styles.ContenedorFormulario}>
          <Text style={styles.TituloFormu}>{t.login.titulo}</Text>

          {/* Input Correo */}
          <View style={[
            styles.contenedorInput,
            vm.errorCorreo ? { borderColor: "#e74c3c" } : {},
          ]}>
            <Image
              style={styles.IconoCorreo}
              source={require('../../../../assets/imagesAlertaMujer/ScLogin/correo.png')}
            />
            <TextInput
              style={styles.inputCorreo}
              placeholder={t.login.correo}
              placeholderTextColor={'#666'}
              value={vm.correo}
              onChangeText={(v) => { vm.setCorreo(v); }}
              autoCapitalize="none"
              keyboardType="email-address"
              selectionColor="#4f0250"
              cursorColor="#4a024b"
            />
          </View>
          {vm.errorCorreo ? (
            <Text style={{ color: "#e74c3c", fontSize: 12, marginLeft: 14, marginTop: 3 }}>
              {vm.errorCorreo}
            </Text>
          ) : null}

          {/* Input Contraseña */}
          <View style={[
            styles.contenedorInput,
            vm.errorPassword ? { borderColor: "#e74c3c" } : {},
          ]}>
            <TextInput
              style={styles.inputContraseña}
              secureTextEntry={!vm.mostrarPassword}
              placeholder={t.login.contrasena}
              placeholderTextColor={'#666'}
              value={vm.password}
              onChangeText={(v) => { vm.setPassword(v); }}
              selectionColor="#480349"
              cursorColor="#450346"
            />
            <TouchableOpacity onPress={vm.toggleMostrarPassword}>
              <Image
                style={styles.IconoCorreo}
                source={require('../../../../assets/imagesAlertaMujer/ScLogin/ojoPriv.png')}
              />
            </TouchableOpacity>
          </View>
          {vm.errorPassword ? (
            <Text style={{ color: "#e74c3c", fontSize: 12, marginLeft: 14, marginTop: 3 }}>
              {vm.errorPassword}
            </Text>
          ) : null}

          <TouchableOpacity onPress={vm.irARecuperarContrasena}>
            <Text style={styles.textoOlivarContra}>{t.login.olvidaste}</Text>
          </TouchableOpacity>

          {vm.errorGeneral ? (
            <Text style={{
              color: "#e74c3c",
              fontSize: 13,
              textAlign: "center",
              marginHorizontal: 10,
              marginBottom: 6,
            }}>
              {vm.errorGeneral}
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.botonSession}
            onPress={() => void vm.iniciarSesion()}
            disabled={vm.cargando}
          >
            {vm.cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.textoSession}>{t.login.ingresar}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Botón Google */}
        <TouchableOpacity style={styles.BotonGoogle} onPress={vm.continuarConGoogle}>
          <Image
            style={styles.logoGoogle}
            source={require('@assets/imagesAlertaMujer/ScLogin/google.png')}
          />
          <Text style={styles.textoGoogle}>{t.login.continuar_google}</Text>
        </TouchableOpacity>

        <View style={styles.ContenedorRegistrarse}>
          <Text style={styles.TextoTienesCuenta}>{t.login.no_cuenta}</Text>
          <TouchableOpacity style={styles.BotonRegistrar} onPress={vm.irARegistro}>
            <Text style={styles.textoRegistro}>{t.login.registrate}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ContenedorTermCondi}>
          <Text style={styles.textoTerminosCondiciones}>{t.login.terminos}</Text>
        </View>
      </ScrollView>
    </View>
  );
}