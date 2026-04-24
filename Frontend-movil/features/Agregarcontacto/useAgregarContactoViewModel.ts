import { useCallback, useEffect, useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Contacts from "expo-contacts";
import { Alert } from "react-native";
import type { MainStackParamList } from "../../src/navigation/types";
import { useContactosContext } from "../../src/contexts/ContactosContext";
import { useLocale } from "../../src/contexts/LocaleContext";

type AgregarNav = NativeStackNavigationProp<MainStackParamList, "AgregarContacto">;
type AgregarRoute = RouteProp<MainStackParamList, "AgregarContacto">;

export function useAgregarContactoViewModel() {
  const navigation = useNavigation<AgregarNav>();
  const route = useRoute<AgregarRoute>();
  const { agregarContacto, actualizarContacto } = useContactosContext();
  const { t } = useLocale();
  const contactoParam = route.params?.contacto;
  const esEdicion = Boolean(contactoParam);

  const [nombre, setNombre] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    if (contactoParam) {
      setNombre(contactoParam.nombre);
      setParentesco(contactoParam.parentesco ?? "");
      setTelefono(contactoParam.telefono);
    } else {
      setNombre("");
      setParentesco("");
      setTelefono("");
    }
  }, [contactoParam?.id, contactoParam?.nombre, contactoParam?.telefono, contactoParam?.parentesco]);

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

          if (contactoSeleccionado.phoneNumbers && contactoSeleccionado.phoneNumbers.length > 0) {
            const numeroLimpio = contactoSeleccionado.phoneNumbers[0].number?.replace(/[^\d+]/g, "");
            setTelefono(numeroLimpio || "");
          }
        }
      } catch (error) {
        console.error("Error al seleccionar contacto:", error);
      }
    } else {
      Alert.alert(
        t.agregar.permiso_denegado_titulo,
        t.agregar.permiso_denegado_desc,
      );
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

    const payload = {
      nombre: nombreNormalizado,
      parentesco: parentescoNormalizado || undefined,
      telefono: telefonoNormalizado,
    };

    if (esEdicion && contactoParam) {
      actualizarContacto(contactoParam.id, payload);
    } else {
      agregarContacto(payload);
    }

    navigation.goBack();
  }, [
    actualizarContacto,
    agregarContacto,
    contactoParam,
    esEdicion,
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
    nombre,
    setNombre,
    parentesco,
    setParentesco,
    telefono,
    setTelefono,
    abrirAgenda,
    guardar,
    cancelar,
    esEdicion,
    tituloPantalla: esEdicion ? t.agregar.titulo_editar : t.agregar.titulo_agregar,
    etiquetaBotonGuardar: esEdicion ? t.agregar.boton_guardar_edicion : t.agregar.boton_guardar_nuevo,
  };
}