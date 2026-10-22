import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { STORAGE_KEY_LOCATION } from "../../tutorial/viewModel/useLocationTutorialViewModel";
import { deleteMyAccount, getMe, updateMe } from "../../../services/users.service";
import { toStorablePhoto } from "../../../services/fotos.service";

type ProfileNavigation = NativeStackNavigationProp<MainStackParamList, "Perfil">;

export function useProfileViewModel() {
  const navigation = useNavigation<ProfileNavigation>();
  const { user, token, signIn, signOut, updateUser } = useAuth();

  const [name,          setName]          = useState(user?.nombre        ?? "");
  const [email,          setEmail]          = useState(user?.correo        ?? "");
  const [phoneNumber,        setPhoneNumber]        = useState(user?.telefono      ?? "");
  const [birthDate, setBirthDate] = useState(user?.fechaNacimiento ?? "");
  const [profilePhoto,      setProfilePhoto]      = useState<string | null>(user?.fotoPerfil ?? null);
  const [document,       setDocument]       = useState("");

  // Municipio viene del tutorial — solo lectura en el perfil
  const [municipality,  setMunicipality]  = useState(user?.municipio ?? "");
  const [department, setDepartment] = useState("Huila");

  const [loading, setLoading] = useState(false);
  const [message,  setMessage]  = useState("");

  // ── Al montar: carga datos reales del backend ─────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        if (user?.id) {
          const me = await getMe();
          const fullName = `${me.firstName ?? ""} ${me.lastName ?? ""}`.trim();
          if (fullName) setName(fullName);
          if (me.email)       setEmail(me.email);
          if (me.telephone)   setPhoneNumber(me.telephone);
          setDocument(me.documentNumber ?? "");
          if (me.birthdate) {
            // Backend devuelve "yyyy-MM-dd"; el perfil usa "DD/MM/YYYY"
            const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(me.birthdate));
            if (m) setBirthDate(`${m[3]}/${m[2]}/${m[1]}`);
          }
          // La foto vive en el backend (antes solo en el celular y se perdía)
          setProfilePhoto(me.profilePhoto ?? null);
          updateUser({ fotoPerfil: me.profilePhoto ?? undefined });
        }
      } catch (error) {
        console.error("Error al cargar el perfil desde el backend:", error);
      }

      try {
        // Municipio del tutorial de ubicación
        const rawLocation = await AsyncStorage.getItem(STORAGE_KEY_LOCATION);
        if (rawLocation) {
          const location = JSON.parse(rawLocation);
          if (location.municipality) setMunicipality(location.municipality);
          if (location.department)   setDepartment(location.department);
        }
      } catch {
        // Si falla la lectura mostramos los valores por defecto
      }
    };
    loadData();
  }, [user?.id]);

  // ── Selección de foto ─────────────────────────────────────────────────────
  const selectPhoto = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage("Necesitas dar permiso para acceder a la galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;
    // Se guarda en el backend en cuanto se elige, sin esperar a "Guardar cambios"
    const previous = profilePhoto;
    try {
      const photo = await toStorablePhoto(result.assets[0].uri);
      setProfilePhoto(photo);
      await updateMe({ profilePhoto: photo });
      updateUser({ fotoPerfil: photo });
    } catch (error) {
      console.warn("No se pudo guardar la foto de perfil:", error);
      setProfilePhoto(previous);
      setMessage("No se pudo guardar la foto. Intenta de nuevo.");
      setTimeout(() => setMessage(""), 3000);
    }
  }, [profilePhoto, updateUser]);

  // ── Validación de fecha DD/MM/YYYY ────────────────────────────────────────
  const validateDate = (date: string): boolean => {
    if (!date.trim()) return true; // campo opcional
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = date.match(regex);
    if (!match) return false;
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    return true;
  };

  // ── Formateo automático de fecha mientras escribe ─────────────────────────
  const handleDateChange = useCallback((text: string) => {
    // Solo dígitos y "/"
    const clean = text.replace(/[^\d/]/g, "");
    // Agrega "/" automáticamente en posición 2 y 5
    let formatted = clean;
    if (clean.length === 2 && !clean.includes("/")) {
      formatted = clean + "/";
    } else if (clean.length === 5 && clean.split("/").length === 2) {
      formatted = clean + "/";
    }
    setBirthDate(formatted.slice(0, 10));
  }, []);

  // ── Guardar cambios ───────────────────────────────────────────────────────
  const saveChanges = useCallback(async () => {
    if (!name.trim()) {
      setMessage("El nombre no puede estar vacío.");
      return;
    }
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!validEmail) {
      setMessage("El correo no tiene un formato válido.");
      return;
    }
    if (phoneNumber.trim() && phoneNumber.trim().length < 7) {
      setMessage("El teléfono no es válido.");
      return;
    }
    if (!validateDate(birthDate)) {
      setMessage("La fecha debe tener formato DD/MM/YYYY.");
      return;
    }

    setLoading(true);
    try {
      // Persiste en el backend
      const parts = name.trim().split(/\s+/);
      const firstName = parts[0] ?? "";
      const lastName = parts.slice(1).join(" ");

      // Convierte DD/MM/YYYY a yyyy-MM-dd para el backend
      let birthdate: string | undefined;
      const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(birthDate.trim());
      if (m) birthdate = `${m[3]}-${m[2]}-${m[1]}`;

      await updateMe({
        firstName,
        lastName,
        telephone: phoneNumber.trim(),
        birthdate,
      });

      // Actualiza el contexto de auth
      if (user) {
        signIn({
          ...user,
          nombre:          name.trim(),
          email:          email.trim(),
          telefono:        phoneNumber.trim(),
          fechaNacimiento: birthDate.trim(),
          fotoPerfil:      profilePhoto ?? undefined,
          municipio: municipality,
        }, token ?? "");
      }
      setMessage("¡Perfil actualizado correctamente!");
    } catch {
      setMessage("Error al guardar los cambios.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }, [name, email, phoneNumber, birthDate, profilePhoto, municipality, user, signIn]);

  // ── Eliminar la cuenta ────────────────────────────────────────────────────
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmRemove = useCallback(async (confirmation: string) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyAccount(confirmation.trim().toUpperCase());
      setDeleteVisible(false);
      // Sin sesión, la app vuelve sola a la pantalla de inicio de sesión
      signOut();
    } catch {
      setDeleteError("No se pudo eliminar la cuenta. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setDeleting(false);
    }
  }, [signOut]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    name: name,          setName: setName,
    email: email,          setEmail: setEmail,
    phoneNumber: phoneNumber,        setPhoneNumber: setPhoneNumber,
    birthDate: birthDate, handleDateChange: handleDateChange,
    profilePhoto: profilePhoto,      selectPhoto: selectPhoto,
    document: document,
    municipality: municipality,
    department,
    saveChanges: saveChanges,
    goBack: goBack,
    deleteVisible: deleteVisible,
    openDelete: () => {
      setDeleteError(null);
      setDeleteVisible(true);
    },
    closeDelete: () => setDeleteVisible(false),
    confirmRemove: confirmRemove,
    deleting: deleting,
    deleteError: deleteError,
    loading: loading,
    message: message,
  };
}