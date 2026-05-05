import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../src/navigation/types";
import { useAuth } from "../../src/contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";

type PerfilNavigation = NativeStackNavigationProp<MainStackParamList, "Perfil">;

export function usePerfilViewModel() {
  const navigation = useNavigation<PerfilNavigation>();
  const { user, signIn } = useAuth();

  const [nombre, setNombre]     = useState(user?.nombre ?? "");
  const [correo, setCorreo]     = useState(user?.correo ?? "");
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(user?.fotoPerfil ?? null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje]   = useState("");

  const seleccionarFoto = useCallback(async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      setMensaje("Necesitas dar permiso para acceder a la galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setFotoPerfil(result.assets[0].uri);
    }
  }, []);

  const guardarCambios = useCallback(async () => {
    if (!nombre.trim()) {
      setMensaje("El nombre no puede estar vacío.");
      return;
    }
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
    if (!emailValido) {
      setMensaje("El correo no tiene un formato válido.");
      return;
    }
    setCargando(true);
    try {
      if (user) {
        signIn({
          ...user,
          nombre: nombre.trim(),
          correo: correo.trim(),
          fotoPerfil: fotoPerfil ?? undefined,
        });
      }
      setMensaje("¡Perfil actualizado correctamente!");
    } catch {
      setMensaje("Error al guardar los cambios.");
    } finally {
      setCargando(false);
    }
  }, [nombre, correo, fotoPerfil, user, signIn]);

  const irACambiarContrasena = useCallback(() => {
    navigation.navigate("RecuperarContrasena" as never);
  }, [navigation]);

  const volver = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    nombre, setNombre,
    correo, setCorreo,
    fotoPerfil,
    seleccionarFoto,
    guardarCambios,
    irACambiarContrasena,
    volver,
    cargando,
    mensaje,
  };
}