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
  const insets = useSafeAreaInsets(); // detects the phone's insets

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
      paddingTop: insets.top,       // top spacing for the phone
      paddingBottom: insets.bottom, // bottom spacing for the phone
    }}>
      <StatusBar style="light" backgroundColor="#460447" />

      <ScrollView
        style={styles.MainContainer}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.LogoContainer}>
          <Image
            source={require('../../../../assets/imagesAlertaMujer/logos/logoAlertaMujer.png')}
            style={styles.LogoImage}
          />
        </View>

        <View style={styles.FormContainer}>
          <Text style={styles.FormTitle}>{t.login.titulo}</Text>

          {/* Email input */}
          <View style={[
            styles.inputContainer,
            vm.emailError ? { borderColor: "#e74c3c" } : {},
          ]}>
            <Image
              style={styles.EmailIcon}
              source={require('../../../../assets/imagesAlertaMujer/ScLogin/correo.png')}
            />
            <TextInput
              style={styles.emailInput}
              placeholder={t.login.correo}
              placeholderTextColor={'#666'}
              value={vm.email}
              onChangeText={(v) => { vm.setEmail(v); }}
              autoCapitalize="none"
              keyboardType="email-address"
              selectionColor="#4f0250"
              cursorColor="#4a024b"
            />
          </View>
          {vm.emailError ? (
            <Text style={{ color: "#e74c3c", fontSize: 12, marginLeft: 14, marginTop: 3 }}>
              {vm.emailError}
            </Text>
          ) : null}

          {/* Password input */}
          <View style={[
            styles.inputContainer,
            vm.errorPassword ? { borderColor: "#e74c3c" } : {},
          ]}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!vm.showPassword}
              placeholder={t.login.contrasena}
              placeholderTextColor={'#666'}
              value={vm.password}
              onChangeText={(v) => { vm.setPassword(v); }}
              selectionColor="#480349"
              cursorColor="#450346"
            />
            <TouchableOpacity onPress={vm.toggleShowPassword}>
              <Image
                style={styles.EmailIcon}
                source={require('../../../../assets/imagesAlertaMujer/ScLogin/ojoPriv.png')}
              />
            </TouchableOpacity>
          </View>
          {vm.errorPassword ? (
            <Text style={{ color: "#e74c3c", fontSize: 12, marginLeft: 14, marginTop: 3 }}>
              {vm.errorPassword}
            </Text>
          ) : null}

          <TouchableOpacity onPress={vm.goToRecoverPassword}>
            <Text style={styles.forgotPasswordText}>{t.login.olvidaste}</Text>
          </TouchableOpacity>

          {vm.generalError ? (
            <Text style={{
              color: "#e74c3c",
              fontSize: 13,
              textAlign: "center",
              marginHorizontal: 10,
              marginBottom: 6,
            }}>
              {vm.generalError}
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.sessionButton}
            onPress={() => void vm.signIn()}
            disabled={vm.loading}
          >
            {vm.loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sessionText}>{t.login.ingresar}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Google button */}
        <TouchableOpacity style={styles.GoogleButton} onPress={vm.continueWithGoogle}>
          <Image
            style={styles.logoGoogle}
            source={require('@assets/imagesAlertaMujer/ScLogin/google.png')}
          />
          <Text style={styles.googleText}>{t.login.continuar_google}</Text>
        </TouchableOpacity>

        <View style={styles.SignUpContainer}>
          <Text style={styles.HaveAccountText}>{t.login.no_cuenta}</Text>
          <TouchableOpacity style={styles.RegisterButton} onPress={vm.goToSignUp}>
            <Text style={styles.signUpText}>{t.login.registrate}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.TermsContainer}>
          <Text style={styles.termsText}>{t.login.terminos}</Text>
        </View>
      </ScrollView>
    </View>
  );
}