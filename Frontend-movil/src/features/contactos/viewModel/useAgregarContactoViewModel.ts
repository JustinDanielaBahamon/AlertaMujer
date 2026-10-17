import { useCallback, useEffect, useState } from "react";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Contacts from "expo-contacts";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

import type { MainStackParamList } from "../../../navigation/types";
import { useContactosContext } from "../../../contexts/ContactosContext";
import { aFotoGuardable } from "../../../services/fotos.service";
import { useLocale } from "../../../contexts/LocaleContext";
import { esCorreoValido, textosContactoExtra } from "../contactosExtra";

type AgregarNav = NativeStackNavigationProp<
  MainStackParamList,
  "AgregarContacto"
>;

type AgregarRoute = RouteProp<
  MainStackParamList,
  "AgregarContacto"
>;

export function useAgregarContactoViewModel() {
  const navigation = useNavigation<AgregarNav>();
  const route = useRoute<AgregarRoute>();

  const {
    contactos,
    agregarContacto,
    actualizarContacto,
  } = useContactosContext();

  const { t, locale } = useLocale();

  const contactoParam = route.params?.contacto;
  const esEdicion = Boolean(contactoParam);

  const [nombre, setNombre] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreoState] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  /**
   * El correo no admite espacios: se eliminan mientras se escribe.
   */
  const setCorreo = useCallback((valor: string) => {
    setCorreoState(valor.replace(/\s/g, ""));
  }, []);

  /**
   * Cargar datos cuando estamos editando un contacto
   */
  useEffect(() => {
    if (contactoParam) {
      setNombre(contactoParam.nombre ?? '');
      setParentesco(contactoParam.parentesco ?? "");
      setTelefono(contactoParam.telefono);
      setCorreoState(contactoParam.email ?? "");
      setFotoUri(contactoParam.foto ?? null);
    } else {
      setNombre("");
      setParentesco("");
      setTelefono("");
      setCorreoState("");
      setFotoUri(null);
    }
  }, [
    contactoParam?.id,
    contactoParam?.nombre,
    contactoParam?.telefono,
    contactoParam?.parentesco,
    contactoParam?.email,
    contactoParam?.foto,
  ]);

  // La foto se reduce y se guarda como data URI: así queda en el backend y no se pierde
  const ponerFoto = useCallback(async (uri: string) => {
    try {
      setFotoUri(await aFotoGuardable(uri));
    } catch (error) {
      console.warn("No se pudo procesar la foto del contacto:", error);
      Alert.alert("Foto", "No se pudo usar esa foto. Intenta con otra.");
    }
  }, []);

  /**
   * Seleccionar foto desde la galería
   */
  const seleccionarFoto = useCallback(async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        t.agregar.permiso_galeria_titulo,
        t.agregar.permiso_galeria_desc
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (!result.canceled && result.assets.length > 0) {
      ponerFoto(result.assets[0].uri);
    }
  }, [t, ponerFoto]);

  /**
   * Quitar foto
   */
  const quitarFoto = useCallback(() => {
    setFotoUri(null);
  }, []);

  /**
   * Abrir agenda del teléfono
   */
  const abrirAgenda = async () => {
    const { status } =
      await Contacts.requestPermissionsAsync();

    if (status === "granted") {
      try {
        const contactoSeleccionado =
          await Contacts.presentContactPickerAsync();

        if (contactoSeleccionado) {
          const nombreDesdeAgenda =
            contactoSeleccionado.name ||
            `${contactoSeleccionado.firstName || ""} ${
              contactoSeleccionado.lastName || ""
            }`.trim();

          setNombre(nombreDesdeAgenda);

          if (
            contactoSeleccionado.phoneNumbers &&
            contactoSeleccionado.phoneNumbers.length > 0
          ) {
            const numeroLimpio =
              contactoSeleccionado.phoneNumbers[0].number?.replace(
                /[^\d+]/g,
                ""
              );

            setTelefono(numeroLimpio || "");
          }

          if (
            contactoSeleccionado.imageAvailable &&
            (contactoSeleccionado as any).image?.uri
          ) {
            ponerFoto((contactoSeleccionado as any).image.uri);
          }
        }
      } catch (error) {
        console.error(
          "Error al seleccionar contacto:",
          error
        );
      }
    } else {
      Alert.alert(
        t.agregar.permiso_denegado_titulo,
        t.agregar.permiso_denegado_desc
      );
    }
  };

  /**
   * Guardar o actualizar contacto
   */
  const guardar = useCallback(() => {
    const extra = textosContactoExtra[locale];

    const nombreNormalizado = nombre.trim();
    const parentescoNormalizado = parentesco.trim();
    const telefonoNormalizado = telefono.replace(/\D/g, "");
    const correoNormalizado = correo.trim().toLowerCase();

    if (!nombreNormalizado || !telefonoNormalizado) {
      Alert.alert(
        t.agregar.campos_incompletos,
        t.agregar.campos_incompletos_desc
      );
      return;
    }

    if (telefonoNormalizado.length < 10) {
      Alert.alert(
        t.agregar.telefono_invalido,
        t.agregar.telefono_invalido_desc
      );
      return;
    }

    /**
     * Validación del correo electrónico (obligatorio y con formato válido)
     */
    if (!correoNormalizado) {
      Alert.alert(
        extra.correo_requerido_titulo,
        extra.correo_requerido_desc
      );
      return;
    }

    if (!esCorreoValido(correoNormalizado)) {
      Alert.alert(
        extra.correo_invalido_titulo,
        extra.correo_invalido_desc
      );
      return;
    }

    /**
     * Validación de contacto duplicado
     *
     * En modo edición se excluye el contacto actual
     * para permitir modificarlo sin bloquear el teléfono.
     */
    const duplicado = contactos.find((c) => {
      const mismoTelefono =
        c.telefono.replace(/\D/g, "") ===
        telefonoNormalizado;

      const esElMismo =
        esEdicion &&
        c.id === contactoParam?.id;

      return mismoTelefono && !esElMismo;
    });

    if (duplicado) {
      Alert.alert(
        t.agregar.duplicado_titulo,
        t.agregar.duplicado_desc
          .replace(
            "{telefono}",
            telefonoNormalizado.replace(
              /(\d{3})(\d{3})(\d{4})/,
              "$1 $2 $3"
            )
          )
          .replace(
            "{nombre}",
            duplicado.nombre ?? ""
          ),
        [
          {
            text: t.agregar.duplicado_boton,
            style: "cancel",
          },
        ]
      );

      return;
    }

    const payload = {
      nombre: nombreNormalizado,
      parentesco:
        parentescoNormalizado || undefined,
      telefono: telefonoNormalizado,
      email: correoNormalizado,
      foto: fotoUri ?? undefined,
    };

    if (esEdicion && contactoParam) {
      actualizarContacto(
        contactoParam.id,
        payload
      );
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
    correo,
    locale,
    t,
  ]);

  /**
   * Cancelar
   */
  const cancelar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    nombre,
    setNombre,

    parentesco,
    setParentesco,

    telefono,
    setTelefono,

    correo,
    setCorreo,

    fotoUri,

    seleccionarFoto,
    quitarFoto,
    abrirAgenda,

    guardar,
    cancelar,

    esEdicion,

    tituloPantalla: esEdicion
      ? t.agregar.titulo_editar
      : t.agregar.titulo_agregar,

    etiquetaBotonGuardar: esEdicion
      ? t.agregar.boton_guardar_edicion
      : t.agregar.boton_guardar_nuevo,
  };
}