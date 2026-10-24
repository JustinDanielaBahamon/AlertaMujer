import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CODE_DIGITS, useRecoverPasswordViewModel } from '../viewModel/useRecoverPasswordViewModel';
import { styles } from "../styles/recoverPassword.style";
// We bring the language hook to use the JSON texts
import { useLocale } from "../../../contexts/LocaleContext";
// Nice modal for messages (error, success, notice)
import AlertModal from "../../../components/ui/alertModal/alertModal";

export default function RecoverPasswordScreen() {
  const vm = useRecoverPasswordViewModel();
  const { t } = useLocale(); // "t" has all the texts of the active language
  const inputs = useRef<Array<TextInput | null>>([]);

  // Texts and actions that change with the step (1, 2 or 3)
  const title =
    vm.step === 1 ? t.recuperar.titulo_paso1 :
    vm.step === 2 ? t.recuperar.titulo_paso2 :
    t.recuperar.titulo_paso3;

  const subtitle =
    vm.step === 1 ? t.recuperar.subtitulo_paso1 :
    vm.step === 2 ? t.recuperar.subtitulo_paso2 :
    t.recuperar.subtitulo_paso3;

  const buttonTextValue =
    vm.step === 1 ? t.recuperar.boton_paso1 :
    vm.step === 2 ? t.recuperar.boton_paso2 :
    t.recuperar.boton_paso3;

  const actionButton =
    vm.step === 1 ? vm.sendLink :
    vm.step === 2 ? vm.verifyCode :
    vm.saveNewPassword;

  const linkTextValue =
    vm.step !== 2 ? t.recuperar.volver :
    vm.canResend ? t.recuperar.nuevo_codigo :
    `${t.recuperar.nuevo_codigo} (${vm.resendWait} s)`;

  const actionLink = () => {
    if (vm.step === 2) {
      if (!vm.canResend) return;
      vm.resendCode();
      setTimeout(() => inputs.current[0]?.focus(), 100); // goes back to the first box
    } else {
      vm.cancel();
    }
  };

  const disabledButton = vm.step === 2 && vm.expiredItem;

  return (
    <ScrollView
      style={styles.MainContainer}
      contentContainerStyle={styles.ScrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {/* LOGO */}
        <View style={styles.LogoContainer}>
          <Image 
            source={require('@assets/imagesAlertaMujer/logos/logoAlertaMujer.png')} 
            style={styles.LogoImage} 
          />
        </View>

        {/* DYNAMIC TEXTS: they change with the step (1, 2 or 3) */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* STEP 1: EMAIL */}
        {vm.step === 1 && (
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={22} color="#6B3FA0" />
            <TextInput
              style={styles.inputText}
              placeholder={t.recuperar.placeholder_correo}
                  maxLength={254}
              placeholderTextColor="#999"
              value={vm.email}
              onChangeText={vm.setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        )}

        {/* STEP 2: OTP CODE + TIMER */}
        {vm.step === 2 && (
          <>
            <View style={styles.codeContainer}>
              {vm.code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => { inputs.current[index] = el; }}
                  style={[styles.boxInput, vm.expiredItem && styles.expiredBoxInput]}
                  maxLength={CODE_DIGITS}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  autoFocus={index === 0}
                  editable={!vm.expiredItem}
                  value={digit}
                  onChangeText={(text) => {
                    const clean = text.replace(/\D/g, '');
                    // If the full code is pasted in one box, it is spread over the next ones
                    const lastItem = vm.handleCodeChange(clean, index);
                    if (clean && lastItem < CODE_DIGITS - 1) inputs.current[lastItem + 1]?.focus();
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    // Deleting in an empty box goes back to the previous one
                    if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                      inputs.current[index - 1]?.focus();
                    }
                  }}
                />
              ))}
            </View>

            <Text style={[styles.timerText, vm.expiredItem && styles.timerExpired]}>
              {vm.expiredItem
                ? t.recuperar.codigo_expirado
                : `${t.recuperar.tiempo_restante} ${vm.formattedDuration}`}
            </Text>
          </>
        )}

        {/* STEP 3: NEW PASSWORD + CONFIRM */}
        {vm.step === 3 && (
          <>
            <View style={[styles.inputContainer, { marginBottom: 16 }]}>
              <MaterialIcons name="lock" size={22} color="#6B3FA0" />
              <TextInput
                style={styles.inputText}
                placeholder={t.recuperar.placeholder_nueva}
                  maxLength={100}
                placeholderTextColor="#999"
                secureTextEntry={!vm.showNew}
                autoCapitalize="none"
                value={vm.newPassword}
                onChangeText={vm.setNewPassword}
              />
              <TouchableOpacity onPress={vm.toggleShowNew}>
                <MaterialIcons
                  name={vm.showNew ? "visibility" : "visibility-off"}
                  size={22}
                  color="#6B3FA0"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={22} color="#6B3FA0" />
              <TextInput
                style={styles.inputText}
                placeholder={t.recuperar.placeholder_confirmar}
                  maxLength={100}
                placeholderTextColor="#999"
                secureTextEntry={!vm.showConfirm}
                autoCapitalize="none"
                value={vm.confirmPassword}
                onChangeText={vm.setConfirmPassword}
              />
              <TouchableOpacity onPress={vm.toggleShowConfirm}>
                <MaterialIcons
                  name={vm.showConfirm ? "visibility" : "visibility-off"}
                  size={22}
                  color="#6B3FA0"
                />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ACTION BUTTON: changes with the step */}
        <TouchableOpacity 
          style={[styles.primaryButton, disabledButton && styles.disabledButton]} 
          onPress={actionButton}
          disabled={disabledButton}
          activeOpacity={0.8}
        >
          {vm.isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{buttonTextValue}</Text>
          )}
        </TouchableOpacity>

        {/* LINK: new code (step 2) or back to login (steps 1 and 3) */}
        <TouchableOpacity onPress={actionLink} style={{ marginTop: 25 }}>
          <Text style={styles.linkText}>{linkTextValue}</Text>
        </TouchableOpacity>
      </View>

      {/* MESSAGES: error, success and notice with the app design */}
      <AlertModal
        visible={vm.alert.visible}
        type={vm.alert.type}
        title={vm.alert.title}
        message={vm.alert.message}
        buttonTextValue={vm.alert.buttonTextValue}
        onClose={vm.closeAlert}
      />
    </ScrollView>
  );
}