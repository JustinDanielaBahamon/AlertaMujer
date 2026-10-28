// features/authentication/views/signUpScreen.tsx
import {View,Text,TouchableOpacity,Image,TextInput,ScrollView,KeyboardAvoidingView,Platform,Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { styles } from "../styles/signUp.styles";
import { Ionicons } from "@expo/vector-icons";
import { useSignUpViewModel } from "../viewModel/useSignUpViewModel";
// We bring the language hook to use the JSON texts
import { useLocale } from "../../../contexts/LocaleContext";

export default function SignUp() {
  const vm = useSignUpViewModel();
  const { t } = useLocale(); // "t" has all the texts of the active language

  // Closes the document type menu (only if it is open)
  const closeList = () => {
    if (vm.showList) vm.setShowList(false);
  };

  return (
    // The purple background goes on the SafeAreaView so it covers the WHOLE screen (no white edges)
    <SafeAreaView style={styles.Screen}>
      <StatusBar style="dark" backgroundColor="rgb(202, 171, 222)" />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "rgb(202, 171, 222)" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.MainContainer}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          onScrollBeginDrag={closeList} // scrolling closes it too
        >
          {/* Tapping any empty space on the screen closes the menu */}
          <Pressable style={{ flexGrow: 1 }} onPress={closeList}>
            <View style={styles.LogoContainer}>
              <Image
                source={require("@assets/imagesAlertaMujer/logos/logoAlertaMujer.png")}
                style={styles.LogoImage}
              />
            </View>

            <View style={styles.FormContainer}>
              <Text style={styles.FormTitle}>{t.registro.titulo}</Text>

              {/* Name */}
              <View style={styles.inputContainer}>
                <Image style={styles.EmailIcon} source={require("@assets/imagesAlertaMujer/ScRegistro/user.png")} />
                <TextInput
                  style={styles.emailInput}
                  placeholder={t.registro.nombre}
                  placeholderTextColor={"#000"}
                  value={vm.name}
                  onChangeText={vm.setName}
                  onFocus={closeList}
                />
              </View>
              {vm.errors.name && (
                <Text style={{ color: "#A21CAF", marginLeft: 10 }}>{vm.errors.name}</Text>
              )}

              {/* Phone */}
              <View style={styles.inputContainer}>
                <Image style={styles.EmailIcon} source={require("@assets/imagesAlertaMujer/ScRegistro/phone.png")} />
                <TextInput
                  style={styles.emailInput}
                  placeholder={t.registro.telefono}
                  placeholderTextColor={"#000"}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={vm.phoneNumber}
                  onChangeText={vm.setPhoneNumber}
                  onFocus={closeList}
                />
              </View>
              {vm.errors.phoneNumber && (
                <Text style={{ color: "#A21CAF", marginLeft: 10 }}>{vm.errors.phoneNumber}</Text>
              )}

              {/* Document type (now first) */}
              <TouchableOpacity style={styles.inputContainer} onPress={vm.toggleDocumentTypeList}>
                <Image style={styles.EmailIcon} source={require("@assets/imagesAlertaMujer/ScRegistro/Documento.png")} />
                <Text style={{ flex: 1 }}>{vm.documentType || t.registro.tipo_documento}</Text>
                <Image style={styles.EmailIcon} source={require("@assets/imagesAlertaMujer/ScRegistro/flechaLista.png")} />
              </TouchableOpacity>
              {vm.errors.documentType && (
                <Text style={{ color: "#A21CAF", marginLeft: 10 }}>{vm.errors.documentType}</Text>
              )}

              {vm.showList && (
                <View style={styles.dropdownList}>
                  <TouchableOpacity onPress={() => vm.selectDocumentType("T.I")}>
                    <Text style={styles.listItem}>T.I</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => vm.selectDocumentType("C.C")}>
                    <Text style={styles.listItem}>C.C</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => vm.selectDocumentType("Documento extranjero")}>
                    <Text style={styles.listItem}>{t.registro.doc_extranjero}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Document number (now after the type) */}
              <View style={styles.inputContainer}>
                <Image style={styles.EmailIcon} source={require("@assets/imagesAlertaMujer/ScRegistro/Documento.png")} />
                <TextInput
                  style={styles.emailInput}
                  placeholder={t.registro.num_documento}
                  placeholderTextColor="#000"
                  value={vm.document}
                  onChangeText={vm.setDocument}
                  keyboardType={vm.documentType === "Documento extranjero" ? "default" : "number-pad"}
                  autoCapitalize="characters"
                  onFocus={closeList}
                />
              </View>
              {vm.errors.document ? (
                <Text style={{ color: "#A21CAF", marginLeft: 10 }}>{vm.errors.document}</Text>
              ) : (
                <View style={{ flexDirection: "row", gap: 6, marginHorizontal: 10, marginTop: -4, marginBottom: 6 }}>
                  <Ionicons name="information-circle-outline" size={15} color="#6B21A8" style={{ marginTop: 1 }} />
                  <Text style={{ flex: 1, fontSize: 12, lineHeight: 17, color: "#6B21A8" }}>{t.registro.documento_para_que}</Text>
                </View>
              )}

              {/* Birth date with automatic DD/MM/YYYY format */}
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#000" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.emailInput}
                  placeholder={t.registro.fecha}
                  placeholderTextColor="#000"
                  value={vm.birthDate}
                  onChangeText={vm.setBirthDate}
                  keyboardType="numeric"
                  maxLength={10}
                  onFocus={closeList}
                />
              </View>
              {vm.errors.birthDate && (
                <Text style={{ color: "#A21CAF", marginLeft: 10 }}>{vm.errors.birthDate}</Text>
              )}

              {/* Email */}
              <View style={styles.inputContainer}>
                <Image style={styles.EmailIcon} source={require("@assets/imagesAlertaMujer/ScLogin/correo.png")} />
                <TextInput
                  style={styles.emailInput}
                  placeholder={t.registro.correo}
                  placeholderTextColor="#000"
                  value={vm.email}
                  onChangeText={vm.setEmail}
                  onFocus={closeList}
                />
              </View>
              {vm.errors.email && (
                <Text style={{ color: "#A21CAF", marginLeft: 10 }}>{vm.errors.email}</Text>
              )}

              {/* Password */}
              <View style={styles.inputContainer}>
                <Image style={styles.EmailIcon} source={require("@assets/imagesAlertaMujer/ScRegistro/llave.png")} />
                <TextInput
                  style={styles.passwordInput}
                  secureTextEntry={!vm.showPassword}
                  placeholder={t.registro.contrasena}
                  placeholderTextColor="#000"
                  value={vm.password}
                  onChangeText={vm.setPassword}
                  onFocus={closeList}
                />
                <TouchableOpacity
                  onPress={() => {
                    closeList();
                    vm.toggleShowPassword();
                  }}
                >
                  <Image style={styles.EmailIcon} source={require("@assets/imagesAlertaMujer/ScLogin/ojoPriv.png")} />
                </TouchableOpacity>
              </View>
              {vm.errors.password && (
                <Text style={{ color: "#A21CAF", marginLeft: 10 }}>{vm.errors.password}</Text>
              )}

              {/* Confirm password (with a key icon) */}
              <View style={styles.inputContainer}>
                <Image style={styles.EmailIcon} source={require("@assets/imagesAlertaMujer/ScRegistro/llave.png")} />
                <TextInput
                  style={styles.passwordInput}
                  secureTextEntry={!vm.showConfirmPassword}
                  placeholder={t.registro.confirmar_contrasena}
                  placeholderTextColor="#000"
                  value={vm.confirmPassword}
                  onChangeText={vm.setConfirmPassword}
                  onFocus={closeList}
                />
                <TouchableOpacity
                  onPress={() => {
                    closeList();
                    vm.toggleShowConfirmPassword();
                  }}
                >
                  <Image style={styles.EmailIcon} source={require("@assets/imagesAlertaMujer/ScLogin/ojoPriv.png")} />
                </TouchableOpacity>
              </View>
              {vm.errors.confirmPassword && (
                <Text style={{ color: "#A21CAF", marginLeft: 10 }}>{vm.errors.confirmPassword}</Text>
              )}
            </View>

            {/* Terms and policy: with the button/input colors */}
            <View style={styles.checksContainer}>
              <View style={styles.checkRow}>
                <TouchableOpacity
                  style={[styles.checkBox, vm.acceptsTerms && styles.activeCheckBox]}
                  onPress={() => {
                    closeList();
                    vm.toggleAcceptsTerms();
                  }}
                >
                  {vm.acceptsTerms && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </TouchableOpacity>
                <Text style={styles.checkText}>
                  {t.registro.acepto}{" "}
                  <Text style={styles.linkTextValue} onPress={vm.goToTerms}>{t.registro.terminos}</Text>
                </Text>
              </View>

              <View style={styles.checkRow}>
                <TouchableOpacity
                  style={[styles.checkBox, vm.acceptsPrivacy && styles.activeCheckBox]}
                  onPress={() => {
                    closeList();
                    vm.toggleAcceptsPrivacy();
                  }}
                >
                  {vm.acceptsPrivacy && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </TouchableOpacity>
                <Text style={styles.checkText}>
                  {t.registro.acepto_la}{" "}
                  <Text style={styles.linkTextValue} onPress={vm.goToPrivacy}>{t.registro.privacidad}</Text>
                </Text>
              </View>

              {vm.termsError !== "" && (
                <Text style={{ color: "#A21CAF", marginLeft: 4 }}>{vm.termsError}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.continueButton, { marginHorizontal: 20, marginBottom: 10 }]}
              onPress={() => {
                closeList();
                vm.registerAndContinue();
              }}
            >
              <Text style={styles.continueText}>{t.registro.continuar}</Text>
            </TouchableOpacity>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}