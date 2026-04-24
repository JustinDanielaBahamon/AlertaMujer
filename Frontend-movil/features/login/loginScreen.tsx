import React from "react";
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./login.styles";
import { useLoginViewModel } from "./useLoginViewModel";
// Traemos el hook del idioma para usar los textos del JSON
import { useLocale } from "../../src/contexts/LocaleContext";

export default function Login() {
  const vm = useLoginViewModel();
  const { t } = useLocale(); // "t" tiene todos los textos del idioma activo

  return (
    <SafeAreaView style={{ flex: 1 }}>
     <ScrollView 
                style={styles.ContenedorPrincipal}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
          >
      
      <View style={styles.ContenedorLogo}>
        <Image source={require('../../assets/imagesAlertaMujer/logos/logoAlertaMujer.png')} style={styles.ImagenLogo} />
      </View>

      <View style={styles.ContenedorFormulario}>
        <Text style={styles.TituloFormu}>{t.login.titulo}</Text>

        {/* Input Correo */}
        <View style={styles.contenedorInput}>
          <Image style={styles.IconoCorreo} source={require('../../assets/imagesAlertaMujer/ScLogin/correo.png')} />
          <TextInput 
            style={styles.inputCorreo} 
            placeholder={t.login.correo}
            placeholderTextColor={'#666'}
            value={vm.correo}
            onChangeText={vm.setCorreo}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Input Contraseña */}
        <View style={styles.contenedorInput}>
          <TextInput 
            style={styles.inputContraseña} 
            secureTextEntry={!vm.mostrarPassword}
            placeholder={t.login.contrasena}
            placeholderTextColor={'#666'}
            value={vm.password}
            onChangeText={vm.setPassword}
          />
          <TouchableOpacity onPress={vm.toggleMostrarPassword}>
            <Image 
              style={styles.IconoCorreo} 
              source={require('../../assets/imagesAlertaMujer/ScLogin/ojoPriv.png')} 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={vm.irARecuperarContrasena}>
          <Text style={styles.textoOlivarContra}>{t.login.olvidaste}</Text>
        </TouchableOpacity>

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

      <TouchableOpacity style={styles.BotonGoogle} onPress={vm.continuarConGoogle}>
        <Image style={styles.logoGoogle} source={require('../../assets/imagesAlertaMujer/ScLogin/google.png')} />
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
    </SafeAreaView>
  );
}