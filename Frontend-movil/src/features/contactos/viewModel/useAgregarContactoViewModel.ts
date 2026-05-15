import { useCallback, useEffect, useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Contacts from "expo-contacts";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import type { MainStackParamList } from "../../../navigation/types";
import { useContactosContext } from "../../../contexts/ContactosContext";
import { useLocale } from "../../../contexts/LocaleContext";

type AgregarNav = NativeStackNavigationProp<MainStackParamList, "AgregarContacto">;
type AgregarRoute = RouteProp<MainStackParamList, "AgregarContacto">;

export function useAgregarContactoViewModel() {
  const navigation = useNavigation<AgregarNav>();
  const route = useRoute<AgregarRoute>();
  const { contactos, agregarContacto, actualizarContacto } = useContactosContext();
  const { t } = useLocale();
  const contactoParam = route.params?.contacto;
  const esEdicion = Boolean(contactoParam);

  const [nombre, setNombre] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (contactoParam) {
      setNombre(contactoParam.nombre);
      setParentesco(contactoParam.parentesco ?? "");
      setTelefono(contactoParam.telefono);
      setFotoUri(contactoParam.foto ?? null);
    } else {
      setNombre("");
      setParentesco("");
      setTelefono("");
      setFotoUri(null);
    }
  }, [
    contactoParam?.id,
    contactoParam?.nombre,
    contactoParam?.telefono,
    contactoParam?.parentesco,
    contactoParam?.foto,
  ]);

  const seleccionarFoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tu galería para seleccionar una foto."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setFotoUri(result.assets[0].uri);
    }
  }, []);

  const quitarFoto = useCallback(() => setFotoUri(null), []);

  const abrirAgenda = async () => {
    const { status } = await Contacts.requestPermissionsAsync();

    if (status === "granted") {
      try {
        const contactoSeleccionado = await Contacts.presentContactPickerAsync();

        if (contactoSeleccionado) {
          const nombreDesdeAgenda =
            contactoSeleccionado.name ||
            `${contactoSeleccionado.firstName || ""} ${contactoSeleccionado.lastName || ""}`.trim();

          setNombre(nombreDesdeAgenda);

          if (
            contactoSeleccionado.phoneNumbers &&
            contactoSeleccionado.phoneNumbers.length > 0
          ) {
            const numeroLimpio = contactoSeleccionado.phoneNumbers[0].number?.replace(
              /[^\d+]/g,
              ""
            );
            setTelefono(numeroLimpio || "");
          }

          if (
            contactoSeleccionado.imageAvailable &&
            (contactoSeleccionado as any).image?.uri
          ) {
            setFotoUri((contactoSeleccionado as any).image.uri);
          }
        }
      } catch (error) {
        console.error("Error al seleccionar contacto:", error);
      }
    } else {
      Alert.alert(t.agregar.permiso_denegado_titulo, t.agregar.permiso_denegado_desc);
    }
  };

  const guardar = useCallback(() => {
    const nombreNormalizado = nombre.trim();
    const parentescoNormalizado = parentesco.trim();
    const telefonoNormalizado = telefono.replace(/\D/g, "");

    if (!nombreNormalizado || !telefonoNormalizado) {
      Alert.alert(t.agregar.campos_incompletos, t.agregar.campos_incompletos_desc);
      return;
    }

    if (telefonoNormalizado.length < 10) {
      Alert.alert(t.agregar.telefono_invalido, t.agregar.telefono_invalido_desc);
      return;
    }

    // ✅ VALIDACIÓN DE DUPLICADO
    // En modo edición se excluye el contacto actual de la búsqueda,
    // para que actualizar su nombre/foto/parentesco sin cambiar el número no bloquee.
    const duplicado = contactos.find((c) => {
      const mismoTelefono = c.telefono.replace(/\D/g, "") === telefonoNormalizado;
      const esElMismo = esEdicion && c.id === contactoParam?.id;
      return mismoTelefono && !esElMismo;
    });

    if (duplicado) {
      Alert.alert(
        "Contacto duplicado",
        `El número ${telefonoNormalizado.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")} ya está registrado como contacto de emergencia de ${duplicado.nombre}.`,
        [{ text: "Entendido", style: "cancel" }]
      );
      return;
    }

    const payload = {
      nombre: nombreNormalizado,
      parentesco: parentescoNormalizado || undefined,
      telefono: telefonoNormalizado,
      foto: fotoUri ?? undefined,
    };

    if (esEdicion && contactoParam) {
      actualizarContacto(contactoParam.id, payload);
    } else {
      agregarContacto(payload);
    }

    navigation.goBack();
  }, [
    contactos,
    actualizarContacto,
    agregarContacto,
    contactoParam,
    esEdicion,
    fotoUri,
    navigation,
    nombre,
    parentesco,
    telefono,
    t,
  ]);

  const cancelar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    nombre, setNombre,
    parentesco, setParentesco,
    telefono, setTelefono,
    fotoUri,
    seleccionarFoto,
    quitarFoto,
    abrirAgenda,
    guardar,
    cancelar,
    esEdicion,
    tituloPantalla: esEdicion ? t.agregar.titulo_editar : t.agregar.titulo_agregar,
    etiquetaBotonGuardar: esEdicion
      ? t.agregar.boton_guardar_edicion
      : t.agregar.boton_guardar_nuevo,
  };
}