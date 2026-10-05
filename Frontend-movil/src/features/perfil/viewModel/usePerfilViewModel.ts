import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../../navigation/types";
import { useAuth } from "../../../contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { STORAGE_KEY_UBICACION } from "../../tutorial/viewModel/useLocationTutorialViewModel";
import { getMe, updateMe } from "../../../services/users.service";

type PerfilNavigation = NativeStackNavigationProp<MainStackParamList, "Perfil">;

// Clave de AsyncStorage para los datos del perfil
const STORAGE_KEY_PERFIL = "@alerta_mujer:perfil";

export function usePerfilViewModel() {
  const navigation = useNavigation<PerfilNavigation>();
  const { user, token, signIn } = useAuth();

  const [nombre,          setNombre]          = useState(user?.nombre        ?? "");
  const [correo,          setCorreo]          = useState(user?.correo        ?? "");
  const [telefono,        setTelefono]        = useState(user?.telefono      ?? "");
  const [fechaNacimiento, setFechaNacimiento] = useState(user?.fechaNacimiento ?? "");
  const [fotoPerfil,      setFotoPerfil]      = useState<string | null>(user?.fotoPerfil ?? null);

  // Municipio viene del tutorial — solo lectura en el perfil
  const [municipio,  setMunicipio]  = useState(user?.municipio ?? "");
  const [department, setDepartment] = useState("Huila");

  const [cargando, setCargando] = useState(false);
  const [mensaje,  setMensaje]  = useState("");

  // ── Al montar: carga datos reales del backend ─────────────────────────────
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        if (user?.id) {
          const me = await getMe();
          const nombreCompleto = `${me.firstName ?? ""} ${me.lastName ?? ""}`.trim();
          if (nombreCompleto) setNombre(nombreCompleto);
          if (me.email)       setCorreo(me.email);
          if (me.telephone)   setTelefono(me.telephone);
          if (me.birthdate) {
            // Backend devuelve "yyyy-MM-dd"; el perfil usa "DD/MM/YYYY"
            const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(me.birthdate));
            if (m) setFechaNacimiento(`${m[3]}/${m[2]}/${m[1]}`);
          }
        }
      } catch (error) {
        console.error("Error al cargar el perfil desde el backend:", error);
      }

      try {
        // Foto de perfil local (sin endpoint de imagen en el backend)
        const perfilRaw = await AsyncStorage.getItem(STORAGE_KEY_PERFIL);
        if (perfilRaw) {
          const perfil = JSON.parse(perfilRaw);
          if (perfil.fotoPerfil) setFotoPerfil(perfil.fotoPerfil);
        }

        // Municipio del tutorial de ubicación
        const ubicacionRaw = await AsyncStorage.getItem(STORAGE_KEY_UBICACION);
        if (ubicacionRaw) {
          const ubicacion = JSON.parse(ubicacionRaw);
          if (ubicacion.municipality) setMunicipio(ubicacion.municipality);
          if (ubicacion.department)   setDepartment(ubicacion.department);
        }
      } catch {
        // Si falla la lectura mostramos los valores por defecto
      }
    };
    cargarDatos();
  }, [user?.id]);

  // ── Selección de foto ─────────────────────────────────────────────────────
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

  // ── Validación de fecha DD/MM/YYYY ────────────────────────────────────────
  const validarFecha = (fecha: string): boolean => {
    if (!fecha.trim()) return true; // campo opcional
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = fecha.match(regex);
    if (!match) return false;
    const dia = parseInt(match[1], 10);
    const mes = parseInt(match[2], 10);
    const anio = parseInt(match[3], 10);
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;
    if (anio < 1900 || anio > new Date().getFullYear()) return false;
    return true;
  };

  // ── Formateo automático de fecha mientras escribe ─────────────────────────
  const handleFechaChange = useCallback((texto: string) => {
    // Solo dígitos y "/"
    const limpio = texto.replace(/[^\d/]/g, "");
    // Agrega "/" automáticamente en posición 2 y 5
    let formateado = limpio;
    if (limpio.length === 2 && !limpio.includes("/")) {
      formateado = limpio + "/";
    } else if (limpio.length === 5 && limpio.split("/").length === 2) {
      formateado = limpio + "/";
    }
    setFechaNacimiento(formateado.slice(0, 10));
  }, []);

  // ── Guardar cambios ───────────────────────────────────────────────────────
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
    if (telefono.trim() && telefono.trim().length < 7) {
      setMensaje("El teléfono no es válido.");
      return;
    }
    if (!validarFecha(fechaNacimiento)) {
      setMensaje("La fecha debe tener formato DD/MM/YYYY.");
      return;
    }

    setCargando(true);
    try {
      // Guarda la foto localmente (sin endpoint de imagen en el backend)
      await AsyncStorage.setItem(
        STORAGE_KEY_PERFIL,
        JSON.stringify({ fotoPerfil })
      );

      // Persiste en el backend
      const partes = nombre.trim().split(/\s+/);
      const firstName = partes[0] ?? "";
      const lastName = partes.slice(1).join(" ");

      // Convierte DD/MM/YYYY a yyyy-MM-dd para el backend
      let birthdate: string | undefined;
      const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fechaNacimiento.trim());
      if (m) birthdate = `${m[3]}-${m[2]}-${m[1]}`;

      await updateMe({
        firstName,
        lastName,
        telephone: telefono.trim(),
        birthdate,
      });

      // Actualiza el contexto de auth
      if (user) {
        signIn({
          ...user,
          nombre:          nombre.trim(),
          correo:          correo.trim(),
          telefono:        telefono.trim(),
          fechaNacimiento: fechaNacimiento.trim(),
          fotoPerfil:      fotoPerfil ?? undefined,
          municipio,
        }, token ?? "");
      }
      setMensaje("¡Perfil actualizado correctamente!");
    } catch {
      setMensaje("Error al guardar los cambios.");
    } finally {
      setCargando(false);
      setTimeout(() => setMensaje(""), 3000);
    }
  }, [nombre, correo, telefono, fechaNacimiento, fotoPerfil, municipio, user, signIn]);

  const volver = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    nombre,          setNombre,
    correo,          setCorreo,
    telefono,        setTelefono,
    fechaNacimiento, handleFechaChange,
    fotoPerfil,      seleccionarFoto,
    municipio,
    department,
    guardarCambios,
    volver,
    cargando,
    mensaje,
  };
}