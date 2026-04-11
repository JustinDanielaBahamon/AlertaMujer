import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./registro.styles";
import { Ionicons } from "@expo/vector-icons";
import { useRegistroViewModel } from "./useRegistroViewModel";

export default function Registro() {
  const vm = useRegistroViewModel();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.ContenedorPrincipal}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          <View style={styles.ContenedorLogo}>
            <Image
              source={require("../../assets/imagesAlertaMujer/logoAlertaMujer.png")}
              style={styles.ImagenLogo}
            />
          </View>

          <View style={styles.ContenedorFormulario}>
            <Text style={styles.TituloFormu}>Unete a nosotros Crea tu cuenta</Text>

            <View style={styles.contenedorInput}>
              <Image
                style={styles.IconoCorreo}
                source={require("../../assets/imagesAlertaMujer/ScRegistro/user.png")}
              />
              <TextInput
                style={styles.inputCorreo}
                placeholder="Nombre completo"
                placeholderTextColor={"#000"}
              />
            </View>

            <View style={styles.contenedorInput}>
              <Image
                style={styles.IconoCorreo}
                source={require("../../assets/imagesAlertaMujer/ScRegistro/phone.png")}
              />
              <TextInput
                style={styles.inputCorreo}
                placeholder="Teléfono"
                placeholderTextColor={"#000"}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.contenedorInput}>
              <Image
                style={styles.IconoCorreo}
                source={require("../../assets/imagesAlertaMujer/ScRegistro/Documento.png")}
              />
              <TextInput
                style={styles.inputCorreo}
                placeholder="Numero de Documento"
                placeholderTextColor="#000"
                value={vm.documento}
                onChangeText={vm.setDocumento}
              />
            </View>

            <TouchableOpacity
              style={styles.contenedorInput}
              onPress={vm.toggleListaTipoDocumento}
            >
              <Image
                style={styles.IconoCorreo}
                source={require("../../assets/imagesAlertaMujer/ScRegistro/Documento.png")}
              />
              <Text style={{ flex: 1 }}>
                {vm.tipoDocumento || "Tipo de documento"}
              </Text>
              <Image
                style={styles.IconoCorreo}
                source={require("../../assets/imagesAlertaMujer/ScRegistro/flechaLista.png")}
              />
            </TouchableOpacity>

            {vm.mostrarLista && (
              <View style={styles.listaDropdown}>
                <TouchableOpacity onPress={() => vm.seleccionarTipoDocumento("T.I")}>
                  <Text style={styles.itemLista}>T.I</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => vm.seleccionarTipoDocumento("C.C")}>
                  <Text style={styles.itemLista}>C.C</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => vm.seleccionarTipoDocumento("Documento extranjero")}
                >
                  <Text style={styles.itemLista}>Documento extranjero</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.contenedorInput}>
              <Ionicons name="calendar-outline" size={20} color="#000" />
              <TextInput
                style={styles.inputCorreo}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#000"
                value={vm.fechaNacimiento}
                onChangeText={vm.setFechaNacimiento}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.contenedorInput}>
              <Image
                style={styles.IconoCorreo}
                source={require("../../assets/imagesAlertaMujer/ScLogin/correo.png")}
              />
              <TextInput
                style={styles.inputCorreo}
                placeholder="Ingresa tu correo"
                placeholderTextColor="#000"
                value={vm.correo}
                onChangeText={vm.setCorreo}
              />
            </View>

            {vm.errores.correo && (
              <Text style={{ color: "red", marginLeft: 10 }}>{vm.errores.correo}</Text>
            )}

            <View style={styles.contenedorInput}>
              <Image
                style={styles.IconoCorreo}
                source={require("../../assets/imagesAlertaMujer/ScRegistro/llave.png")}
              />
              <TextInput
                style={styles.inputContraseña}
                secureTextEntry={!vm.mostrarPassword}
                placeholder="Ingresa tu contraseña"
                value={vm.password}
                onChangeText={vm.setPassword}
              />
              <TouchableOpacity onPress={vm.toggleMostrarPassword}>
                <Image
                  style={styles.IconoCorreo}
                  source={require("../../assets/imagesAlertaMujer/ScLogin/ojoPriv.png")}
                />
              </TouchableOpacity>
            </View>

            {vm.errores.password && (
              <Text style={{ color: "red", marginLeft: 10 }}>{vm.errores.password}</Text>
            )}

            <View style={styles.contenedorInput}>
              <TextInput
                style={styles.inputContraseña}
                secureTextEntry={!vm.mostrarConfirmPassword}
                placeholder="Confirmar contraseña"
                value={vm.confirmPassword}
                onChangeText={vm.setConfirmPassword}
              />
              <TouchableOpacity onPress={vm.toggleMostrarConfirmPassword}>
                <Image
                  style={styles.IconoCorreo}
                  source={require("../../assets/imagesAlertaMujer/ScLogin/ojoPriv.png")}
                />
              </TouchableOpacity>
            </View>

            {vm.errores.confirmPassword && (
              <Text style={{ color: "red", marginLeft: 10 }}>{vm.errores.confirmPassword}</Text>
            )}
          </View>

          <View style={styles.contenedorChecks}>
            <View style={styles.filaCheck}>
              <TouchableOpacity
                style={[
                  styles.cuadroCheck,
                  vm.aceptaTerminos && { backgroundColor: "#6A3FC9" },
                ]}
                onPress={vm.toggleAceptaTerminos}
              />

              <Text style={styles.textoCheck}>
                Acepto los{" "}
                <Text style={styles.textoLink} onPress={vm.irATerminos}>
                  Términos y condiciones
                </Text>
              </Text>
            </View>

            <View style={styles.filaCheck}>
              <TouchableOpacity
                style={[
                  styles.cuadroCheck,
                  vm.aceptaPrivacidad && { backgroundColor: "#6A3FC9" },
                ]}
                onPress={vm.toggleAceptaPrivacidad}
              />

              <Text style={styles.textoCheck}>
                Acepto la{" "}
                <Text style={styles.textoLink} onPress={vm.irAPrivacidad}>
                  Política de privacidad
                </Text>
              </Text>
            </View>

            {vm.errorTerminos !== "" && (
              <Text style={{ color: "red", marginLeft: 10 }}>{vm.errorTerminos}</Text>
            )}

            <TouchableOpacity
              style={[styles.botonContinuar, { margin: 20 }]}
              onPress={vm.registrarYContinuar}
            >
              <Text style={styles.textoContinuar}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
