// features/registro/registroScreen.tsx
import {View,Text,TouchableOpacity,Image,TextInput,ScrollView,KeyboardAvoidingView,Platform,Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { styles } from "../styles/registro.styles";
import { Ionicons } from "@expo/vector-icons";
import { useRegistroViewModel } from "../viewModel/useRegistroViewModel";
// Traemos el hook del idioma para usar los textos del JSON
import { useLocale } from "../../../contexts/LocaleContext";

export default function Registro() {
  const vm = useRegistroViewModel();
  const { t } = useLocale(); // "t" tiene todos los textos del idioma activo

  // Cierra el menú de tipo de documento (solo si está abierto)
  const cerrarLista = () => {
    if (vm.mostrarLista) vm.setMostrarLista(false);
  };

  return (
    // El fondo morado va en el SafeAreaView para que cubra TODA la pantalla (sin bordes blancos)
    <SafeAreaView style={styles.Pantalla}>
      <StatusBar style="dark" backgroundColor="rgb(202, 171, 222)" />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "rgb(202, 171, 222)" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.ContenedorPrincipal}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          onScrollBeginDrag={cerrarLista} // al hacer scroll también se cierra
        >
          {/* Tocar cualquier espacio vacío de la pantalla cierra el menú */}
          <Pressable style={{ flexGrow: 1 }} onPress={cerrarLista}>
            <View style={styles.ContenedorLogo}>
              <Image
                source={require("@assets/imagesAlertaMujer/logos/logoAlertaMujer.png")}
                style={styles.ImagenLogo}
              />
            </View>

            <View style={styles.ContenedorFormulario}>
              <Text style={styles.TituloFormu}>{t.registro.titulo}</Text>

              {/* Nombre */}
              <View style={styles.contenedorInput}>
                <Image style={styles.IconoCorreo} source={require("@assets/imagesAlertaMujer/ScRegistro/user.png")} />
                <TextInput
                  style={styles.inputCorreo}
                  placeholder={t.registro.nombre}
                  placeholderTextColor={"#000"}
                  value={vm.nombre}
                  onChangeText={vm.setNombre}
                  onFocus={cerrarLista}
                />
              </View>
              {vm.errores.nombre && (
                <Text style={{ color: "red", marginLeft: 10 }}>{vm.errores.nombre}</Text>
              )}

              {/* Teléfono */}
              <View style={styles.contenedorInput}>
                <Image style={styles.IconoCorreo} source={require("@assets/imagesAlertaMujer/ScRegistro/phone.png")} />
                <TextInput
                  style={styles.inputCorreo}
                  placeholder={t.registro.telefono}
                  placeholderTextColor={"#000"}
                  keyboardType="phone-pad"
                  value={vm.telefono}
                  onChangeText={vm.setTelefono}
                  onFocus={cerrarLista}
                />
              </View>
              {vm.errores.telefono && (
                <Text style={{ color: "red", marginLeft: 10 }}>{vm.errores.telefono}</Text>
              )}

              {/* Tipo de documento (ahora va primero) */}
              <TouchableOpacity style={styles.contenedorInput} onPress={vm.toggleListaTipoDocumento}>
                <Image style={styles.IconoCorreo} source={require("@assets/imagesAlertaMujer/ScRegistro/Documento.png")} />
                <Text style={{ flex: 1 }}>{vm.tipoDocumento || t.registro.tipo_documento}</Text>
                <Image style={styles.IconoCorreo} source={require("@assets/imagesAlertaMujer/ScRegistro/flechaLista.png")} />
              </TouchableOpacity>
              {vm.errores.tipoDocumento && (
                <Text style={{ color: "red", marginLeft: 10 }}>{vm.errores.tipoDocumento}</Text>
              )}

              {vm.mostrarLista && (
                <View style={styles.listaDropdown}>
                  <TouchableOpacity onPress={() => vm.seleccionarTipoDocumento("T.I")}>
                    <Text style={styles.itemLista}>T.I</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => vm.seleccionarTipoDocumento("C.C")}>
                    <Text style={styles.itemLista}>C.C</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => vm.seleccionarTipoDocumento("Documento extranjero")}>
                    <Text style={styles.itemLista}>{t.registro.doc_extranjero}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Número de documento (ahora va después del tipo) */}
              <View style={styles.contenedorInput}>
                <Image style={styles.IconoCorreo} source={require("@assets/imagesAlertaMujer/ScRegistro/Documento.png")} />
                <TextInput
                  style={styles.inputCorreo}
                  placeholder={t.registro.num_documento}
                  placeholderTextColor="#000"
                  value={vm.documento}
                  onChangeText={vm.setDocumento}
                  onFocus={cerrarLista}
                />
              </View>
              {vm.errores.documento && (
                <Text style={{ color: "red", marginLeft: 10 }}>{vm.errores.documento}</Text>
              )}

              {/* Fecha de nacimiento con formato automático DD/MM/AAAA */}
              <View style={styles.contenedorInput}>
                <Ionicons name="calendar-outline" size={20} color="#000" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.inputCorreo}
                  placeholder={t.registro.fecha}
                  placeholderTextColor="#000"
                  value={vm.fechaNacimiento}
                  onChangeText={vm.setFechaNacimiento}
                  keyboardType="numeric"
                  maxLength={10}
                  onFocus={cerrarLista}
                />
              </View>
              {vm.errores.fechaNacimiento && (
                <Text style={{ color: "red", marginLeft: 10 }}>{vm.errores.fechaNacimiento}</Text>
              )}

              {/* Correo */}
              <View style={styles.contenedorInput}>
                <Image style={styles.IconoCorreo} source={require("@assets/imagesAlertaMujer/ScLogin/correo.png")} />
                <TextInput
                  style={styles.inputCorreo}
                  placeholder={t.registro.correo}
                  placeholderTextColor="#000"
                  value={vm.correo}
                  onChangeText={vm.setCorreo}
                  onFocus={cerrarLista}
                />
              </View>
              {vm.errores.correo && (
                <Text style={{ color: "red", marginLeft: 10 }}>{vm.errores.correo}</Text>
              )}

              {/* Contraseña */}
              <View style={styles.contenedorInput}>
                <Image style={styles.IconoCorreo} source={require("@assets/imagesAlertaMujer/ScRegistro/llave.png")} />
                <TextInput
                  style={styles.inputContraseña}
                  secureTextEntry={!vm.mostrarPassword}
                  placeholder={t.registro.contrasena}
                  value={vm.password}
                  onChangeText={vm.setPassword}
                  onFocus={cerrarLista}
                />
                <TouchableOpacity
                  onPress={() => {
                    cerrarLista();
                    vm.toggleMostrarPassword();
                  }}
                >
                  <Image style={styles.IconoCorreo} source={require("@assets/imagesAlertaMujer/ScLogin/ojoPriv.png")} />
                </TouchableOpacity>
              </View>
              {vm.errores.password && (
                <Text style={{ color: "red", marginLeft: 10 }}>{vm.errores.password}</Text>
              )}

              {/* Confirmar contraseña (con icono de llave) */}
              <View style={styles.contenedorInput}>
                <Image style={styles.IconoCorreo} source={require("@assets/imagesAlertaMujer/ScRegistro/llave.png")} />
                <TextInput
                  style={styles.inputContraseña}
                  secureTextEntry={!vm.mostrarConfirmPassword}
                  placeholder={t.registro.confirmar_contrasena}
                  value={vm.confirmPassword}
                  onChangeText={vm.setConfirmPassword}
                  onFocus={cerrarLista}
                />
                <TouchableOpacity
                  onPress={() => {
                    cerrarLista();
                    vm.toggleMostrarConfirmPassword();
                  }}
                >
                  <Image style={styles.IconoCorreo} source={require("@assets/imagesAlertaMujer/ScLogin/ojoPriv.png")} />
                </TouchableOpacity>
              </View>
              {vm.errores.confirmPassword && (
                <Text style={{ color: "red", marginLeft: 10 }}>{vm.errores.confirmPassword}</Text>
              )}
            </View>

            {/* Términos y política: con los colores del botón/inputs */}
            <View style={styles.contenedorChecks}>
              <View style={styles.filaCheck}>
                <TouchableOpacity
                  style={[styles.cuadroCheck, vm.aceptaTerminos && styles.cuadroCheckActivo]}
                  onPress={() => {
                    cerrarLista();
                    vm.toggleAceptaTerminos();
                  }}
                >
                  {vm.aceptaTerminos && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </TouchableOpacity>
                <Text style={styles.textoCheck}>
                  {t.registro.acepto}{" "}
                  <Text style={styles.textoLink} onPress={vm.irATerminos}>{t.registro.terminos}</Text>
                </Text>
              </View>

              <View style={styles.filaCheck}>
                <TouchableOpacity
                  style={[styles.cuadroCheck, vm.aceptaPrivacidad && styles.cuadroCheckActivo]}
                  onPress={() => {
                    cerrarLista();
                    vm.toggleAceptaPrivacidad();
                  }}
                >
                  {vm.aceptaPrivacidad && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </TouchableOpacity>
                <Text style={styles.textoCheck}>
                  {t.registro.acepto_la}{" "}
                  <Text style={styles.textoLink} onPress={vm.irAPrivacidad}>{t.registro.privacidad}</Text>
                </Text>
              </View>

              {vm.errorTerminos !== "" && (
                <Text style={{ color: "red", marginLeft: 4 }}>{vm.errorTerminos}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.botonContinuar, { marginHorizontal: 20, marginBottom: 10 }]}
              onPress={() => {
                cerrarLista();
                vm.registrarYContinuar();
              }}
            >
              <Text style={styles.textoContinuar}>{t.registro.continuar}</Text>
            </TouchableOpacity>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}