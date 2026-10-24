import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { STORAGE_KEY_LOCATION } from "../../tutorial/viewModel/useLocationTutorialViewModel";
import { deleteMyAccount, getMe, updateMe } from "../../../services/users.service";
import { toStorablePhoto } from "../../../services/photos.service";
import ShakeSensor from "../../../../modules/shake-sensor";
import { removeCancelPins } from "../../security/cancelPin";
import { dateToIso, formatDateText } from "../../completeSignUp/profileIncomplete";
import { digitsOnly, isValidCellphone, isValidName, lettersOnly } from "../../../utils/validators";

type ProfileNavigation = NativeStackNavigationProp<MainStackParamList, "Profile">;

export function useProfileViewModel() {
  const navigation = useNavigation<ProfileNavigation>();
  const { user, token, signIn, signOut, updateUser } = useAuth();

  const [name,          setName]          = useState(user?.nombre        ?? "");
  const [email,          setEmail]          = useState(user?.correo        ?? "");
  const [phoneNumber,        setPhoneNumber]        = useState(user?.telefono      ?? "");
  const [birthDate, setBirthDate] = useState(user?.fechaNacimiento ?? "");
  const [profilePhoto,      setProfilePhoto]      = useState<string | null>(user?.fotoPerfil ?? null);
  const [document,       setDocument]       = useState("");

  // Municipality comes from the tutorial — read only in the profile
  const [municipality,  setMunicipality]  = useState(user?.municipio ?? "");
  const [department, setDepartment] = useState("Huila");

  const [loading, setLoading] = useState(false);
  const [message,  setMessage]  = useState("");

  // ── On mount: load real data from the backend ───────────────────────────────
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
            // The backend returns "yyyy-MM-dd"; the profile uses "DD/MM/YYYY"
            const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(me.birthdate));
            if (m) setBirthDate(`${m[3]}/${m[2]}/${m[1]}`);
          }
          // The photo lives in the backend (before, only on the phone, and it was lost)
          setProfilePhoto(me.profilePhoto ?? null);
          updateUser({ fotoPerfil: me.profilePhoto ?? undefined });
        }
      } catch (error) {
        console.error("Error al cargar el perfil desde el backend:", error);
      }

      try {
        // Municipality from the location tutorial
        const rawLocation = await AsyncStorage.getItem(STORAGE_KEY_LOCATION);
        if (rawLocation) {
          const location = JSON.parse(rawLocation);
          if (location.municipality) setMunicipality(location.municipality);
          if (location.department)   setDepartment(location.department);
        }
      } catch {
        // If reading fails we show the default values
      }
    };
    loadData();
  }, [user?.id]);

  // ── Photo selection ────────────────────────────────────────────────────────
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
    // Saved in the backend as soon as it is chosen, without waiting for "Save changes"
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

  // ── DD/MM/YYYY date validation: a real date and a reasonable age ───────────
  const validateDate = (date: string): boolean => !date.trim() || dateToIso(date) !== null;

  // ── Automatic date formatting while typing ─────────────────────────────────
  const handleDateChange = useCallback((text: string) => setBirthDate(formatDateText(text)), []);

  // Letters only in the name and 10 digits in the phone, as in the sign-up
  const changeName = useCallback((text: string) => setName(lettersOnly(text)), []);
  const changePhone = useCallback((text: string) => setPhoneNumber(digitsOnly(text, 10)), []);

  // ── Save changes ──────────────────────────────────────────────────────────
  const saveChanges = useCallback(async () => {
    if (!isValidName(name)) {
      setMessage("Escribe tu nombre completo.");
      return;
    }
    if (phoneNumber.trim() && !isValidCellphone(phoneNumber)) {
      setMessage("Escribe un celular de 10 dígitos que empiece por 3.");
      return;
    }
    if (!validateDate(birthDate)) {
      setMessage("Escribe una fecha válida DD/MM/AAAA.");
      return;
    }

    setLoading(true);
    try {
      // Persists in the backend
      const parts = name.trim().split(/\s+/);
      const firstName = parts[0] ?? "";
      const lastName = parts.slice(1).join(" ");

      // Converts DD/MM/YYYY to yyyy-MM-dd for the backend
      let birthdate: string | undefined;
      const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(birthDate.trim());
      if (m) birthdate = `${m[3]}-${m[2]}-${m[1]}`;

      await updateMe({
        firstName,
        lastName,
        telephone: phoneNumber.trim(),
        birthdate,
      });

      // Updates the auth context
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

  // ── Delete the account ────────────────────────────────────────────────────
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmRemove = useCallback(async (confirmation: string) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyAccount(confirmation.trim().toUpperCase());
      setDeleteVisible(false);
      // Nothing of hers stays on the phone: the private evidence copies and the cancel PINs
      try {
        if (typeof ShakeSensor?.deleteAllLocalEvidence === "function") ShakeSensor.deleteAllLocalEvidence();
      } catch {
        // Old build without the local copy
      }
      await removeCancelPins().catch(() => {});
      // Without a session, the app goes back to the sign-in screen on its own
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
    name: name,          setName: changeName,
    email: email,          setEmail: setEmail,
    phoneNumber: phoneNumber,        setPhoneNumber: changePhone,
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