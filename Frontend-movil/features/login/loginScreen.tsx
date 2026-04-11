import React from "react";
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./login.styles";
import { useLoginViewModel } from "./useLoginViewModel";

export default function Login() {
  const vm = useLoginViewModel();

  return (
    <SafeAreaView style={{ flex: 1 }}>
     <ScrollView 
                style={styles.ContenedorPrincipal}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                
          >
      
      <View style={styles.ContenedorLogo}>
        <Image source={require('../../assets/imagesAlertaMujer/logoAlertaMujer.png')} style={styles.ImagenLogo} />
      </View>

      <View style={styles.ContenedorFormulario}>
        <Text style={styles.TituloFormu}>Bienvenida a tu espacio de seguridad.</Text>

        {/* Input Correo */}
        <View style={styles.contenedorInput}>
          <Image style={styles.IconoCorreo} source={require('../../assets/imagesAlertaMujer/ScLogin/correo.png')} />
          <TextInput 
            style={styles.inputCorreo} 
            placeholder="Ingresa tu correo" 
            placeholderTextColor={'#666'}
            value={vm.correo}
            onChangeText={vm.setCorreo}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Input Contraseña */}
        <View style={styles.contenedorInput}>
          {/* Opcional: Podrías poner un icono de candado aquí */}
          <TextInput 
            style={styles.inputContraseña} 
            secureTextEntry={!vm.mostrarPassword}
            placeholder="Ingresa tu contraseña"
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
          <Text style={styles.textoOlivarContra}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonSession} onPress={vm.iniciarSesion}>
          <Text style={styles.textoSession}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.BotonGoogle} onPress={vm.continuarConGoogle}>
        <Image style={styles.logoGoogle} source={require('../../assets/imagesAlertaMujer/ScLogin/google.png')} />
        <Text style={styles.textoGoogle}>Continuar con Google</Text>
      </TouchableOpacity>

      <View style={styles.ContenedorRegistrarse}>
        <Text style={styles.TextoTienesCuenta}>¿No tienes cuenta?</Text>
        <TouchableOpacity style={styles.BotonRegistrar} onPress={vm.irARegistro}>
          <Text style={styles.textoRegistro}>Regístrate</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ContenedorTermCondi}>
        <Text style={styles.textoTerminosCondiciones}>
          Si continúas, confirmas que aceptas nuestras Condiciones de Servicio y nuestro Aviso de privacidad.
        </Text>
      </View>

    </ScrollView>
    </SafeAreaView>
    
  );
}