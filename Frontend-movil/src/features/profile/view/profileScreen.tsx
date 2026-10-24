import React, { useMemo } from "react";
import {
  View, Text, TouchableOpacity, Image,
  TextInput, ScrollView, ActivityIndicator, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createProfileStyles } from "../styles/profileStyle";
import { useProfileViewModel } from "../viewModel/useProfileViewModel";
import { useAccountRequirements } from "../viewModel/useAccountRequirements";
import DeleteAccountModal from "./DeleteAccountModal";
import { useTheme } from "../../../contexts/ThemeContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { getInitials } from "../../../utils/initials";
import ScreenHeader from "../../../components/ui/ScreenHeader/ScreenHeader";

export default function ProfileScreen() {
  const vm = useProfileViewModel();
  const { theme } = useTheme();
  const { t } = useLocale();
  const styles = useMemo(() => createProfileStyles(theme), [theme]);
  const req = useAccountRequirements(vm);
  const accent = theme.icon;

  const esError =
    vm.message.toLowerCase().includes("error") ||
    vm.message.toLowerCase().includes("vacío") ||
    vm.message.toLowerCase().includes("válido") ||
    vm.message.toLowerCase().includes("formato");

  return (
    <View style={styles.container}>
      <ScreenHeader title={t.perfil.titulo_header} subtitle="Tus datos y tu cuenta" icon="person-circle" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.photoContainer}>
          <TouchableOpacity
            onPress={vm.selectPhoto}
            activeOpacity={0.8}
            style={styles.avatarWrap}
          >
            <View style={styles.photoCircle}>
              {vm.profilePhoto ? (
                <Image source={{ uri: vm.profilePhoto }} style={styles.photo} />
              ) : (
                // Initials — always visible regardless of the theme
                <Text style={styles.initialsText}>
                  {getInitials(vm.name)}
                </Text>
              )}
            </View>
            <View style={styles.cameraIcon}>
              <Ionicons name="camera-outline" size={13} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.userNameValue}>{vm.name || t.perfil.nombre_default}</Text>
          <Text style={styles.userEmail}>{vm.email || t.perfil.correo_default}</Text>
        </View>

        {/* Body */}
        <View style={styles.body}>

          {/* ── Account status: what an alert needs to work ── */}
          <View style={styles.card}>
            <View style={req_s.header}>
              <View style={[req_s.ring, { borderColor: req.list ? accent : accent + "40" }]}>
                <Text style={[req_s.ringText, { color: accent }]}>
                  {req.met}/{req.total}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 2 }]}>{t.perfil.req_titulo}</Text>
                <Text style={[req_s.summary, { color: theme.text }]}>
                  {req.list ? t.perfil.req_lista : t.perfil.req_pendiente}
                </Text>
              </View>
            </View>
            <View style={[req_s.bar, { backgroundColor: accent + "25" }]}>
              <View
                style={[
                  req_s.barFill,
                  { backgroundColor: accent, width: `${Math.round((req.met / req.total) * 100)}%` as `${number}%` },
                ]}
              />
            </View>

            {req.requirements.map((q) => (
              <View key={q.id} style={req_s.row}>
                <View style={[req_s.icon, { backgroundColor: q.meets ? accent : accent + "20" }]}>
                  <Ionicons name={(q.meets ? "checkmark" : q.icon) as never} size={16} color={q.meets ? "#fff" : accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={req_s.titleRow}>
                    <Text style={[req_s.title, { color: theme.text }]}>{q.title}</Text>
                    {!q.required && (
                      <Text style={[req_s.label, { color: accent, borderColor: accent + "60" }]}>{t.perfil.req_recomendado}</Text>
                    )}
                  </View>
                  <Text style={[req_s.detail, { color: theme.text }]}>{q.detail}</Text>
                  {!q.meets && q.action && (
                    <TouchableOpacity onPress={q.action.ir} style={req_s.action}>
                      <Text style={[req_s.actionText, { color: accent }]}>{q.action.text}</Text>
                      <Ionicons name="chevron-forward" size={14} color={accent} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* ── Personal data ── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t.perfil.titulo_datos_personales}</Text>

            {/* Name */}
            <View style={styles.fieldWrap}>
              <Text style={styles.inputLabel}>{t.perfil.label_nombre}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color={theme.icon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.perfil.placeholder_nombre}
                  placeholderTextColor={theme.icon + "70"}
                  value={vm.name}
                  onChangeText={vm.setName}
                  selectionColor={theme.icon}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={styles.inputLabel}>{t.perfil.label_correo}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={18} color={theme.icon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.perfil.placeholder_correo}
                  placeholderTextColor={theme.icon + "70"}
                  value={vm.email}
                  // The email is the account sign-in: it is not changed from the profile
                  editable={false}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  selectionColor={theme.icon}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.fieldWrap}>
              <Text style={styles.inputLabel}>{t.perfil.label_telefono}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={18} color={theme.icon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.perfil.placeholder_telefono}
                  placeholderTextColor={theme.icon + "70"}
                  value={vm.phoneNumber}
                  onChangeText={vm.setPhoneNumber}
                  keyboardType="number-pad"
                  maxLength={10}
                  selectionColor={theme.icon}
                />
              </View>
            </View>

            {/* Birth date */}
            <View style={styles.fieldWrap}>
              <Text style={styles.inputLabel}>{t.perfil.label_fecha_nacimiento}</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={18} color={theme.icon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.perfil.placeholder_fecha}
                  placeholderTextColor={theme.icon + "70"}
                  value={vm.birthDate}
                  onChangeText={vm.handleDateChange}
                  keyboardType="numeric"
                  maxLength={10}
                  selectionColor={theme.icon}
                />
              </View>
            </View>
          </View>

          {/* ── Location (read only) ── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t.perfil.titulo_ubicacion}</Text>

            {/* Department */}
            <View style={styles.fieldWrap}>
              <Text style={styles.inputLabel}>{t.perfil.label_departamento}</Text>
              <View style={styles.readonlyInputContainer}>
                <Ionicons name="map-outline" size={18} color={theme.icon} />
                <Text style={styles.inputReadonly}>{vm.department}</Text>
                <View style={styles.fixedBadge}>
                  <Text style={styles.fixedBadgeText}>{t.perfil.badge_fijo}</Text>
                </View>
              </View>
            </View>

            {/* Municipality */}
            <View style={styles.fieldWrap}>
              <Text style={styles.inputLabel}>{t.perfil.label_municipio}</Text>
              <View style={styles.readonlyInputContainer}>
                <Ionicons name="location-outline" size={18} color={theme.icon} />
                <Text style={styles.inputReadonly}>
                  {vm.municipality || t.perfil.municipio_sin_configurar}
                </Text>
                {vm.municipality ? (
                  <View style={styles.fixedBadge}>
                    <Text style={styles.fixedBadgeText}>✓</Text>
                  </View>
                ) : null}
              </View>
              {!vm.municipality && (
                <Text style={styles.hintText}>
                  {t.perfil.hint_municipio}
                </Text>
              )}
            </View>
          </View>

          {/* Feedback */}
          {vm.message ? (
            <Text style={esError ? styles.errorText : styles.successMessage}>
              {vm.message}
            </Text>
          ) : null}

          {/* Save */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={vm.saveChanges}
            disabled={vm.loading}
            activeOpacity={0.85}
          >
            {vm.loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>{t.perfil.btn_guardar}</Text>
            )}
          </TouchableOpacity>

          {/* Delete the account: at the end, apart from the rest */}
          <View style={[styles.card, req_s.zoneToDelete, { borderColor: accent + "50" }]}>
            <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>{t.perfil.eliminar_seccion}</Text>
            <Text style={[req_s.detail, { color: theme.text }]}>{t.perfil.eliminar_desc}</Text>
            <TouchableOpacity onPress={vm.openDelete} style={[req_s.removeButton, { borderColor: accent }]}>
              <Ionicons name="trash-outline" size={16} color={accent} />
              <Text style={[req_s.actionText, { color: accent }]}>{t.perfil.eliminar_boton}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      <DeleteAccountModal
        visible={vm.deleteVisible}
        deleting={vm.deleting}
        error={vm.deleteError}
        onConfirm={vm.confirmRemove}
        onClose={vm.closeDelete}
      />
    </View>
  );
}
const req_s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  ring: { width: 56, height: 56, borderRadius: 28, borderWidth: 4, alignItems: "center", justifyContent: "center" },
  ringText: { fontSize: 15, fontWeight: "800" },
  summary: { fontSize: 12, opacity: 0.75, lineHeight: 17 },
  bar: { height: 6, borderRadius: 3, marginTop: 14, marginBottom: 6, overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3 },
  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  icon: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  title: { fontSize: 14, fontWeight: "700" },
  label: { fontSize: 10, fontWeight: "700", borderWidth: 1, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  detail: { fontSize: 12, opacity: 0.72, lineHeight: 17, marginTop: 2 },
  action: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 6 },
  actionText: { fontSize: 13, fontWeight: "700" },
  zoneToDelete: { borderWidth: 1, borderStyle: "dashed", marginTop: 16 },
  removeButton: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, marginTop: 10 },
});
