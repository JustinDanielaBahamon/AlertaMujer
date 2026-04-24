import { useCallback, useEffect, useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Contacts from "expo-contacts";
import { Alert } from "react-native";
import type { MainStackParamList } from "../../src/navigation/types";
import { useContactosContext } from "../../src/contexts/ContactosContext";

type AgregarNav = NativeStackNavigationProp<MainStackParamList, "AgregarContacto">;
type AgregarRoute = RouteProp<MainStackParamList, "AgregarContacto">;

export function useAgregarContactoViewModel() {
  const navigation = useNavigation<AgregarNav>();
  const route = useRoute<AgregarRoute>();
  const { agregarContacto, actualizarContacto } = useContactosContext();
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
        "Permiso denegado",
        "Ve a configuracion para permitir que la app acceda a tus contactos.",
      );
    }
  };

  const guardar = useCallback(() => {
    const nombreNormalizado = nombre.trim();
    const parentescoNormalizado = parentesco.trim();
    const telefonoNormalizado = telefono.replace(/\D/g, "");

    if (!nombreNormalizado || !telefonoNormalizado) {
      Alert.alert("Campos incompletos", "Ingresa nombre y teléfono para continuar.");
      return;
    }

    if (telefonoNormalizado.length < 10) {
      Alert.alert("Teléfono inválido", "Ingresa un número de teléfono válido.");
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
    tituloPantalla: esEdicion ? "Actualizar contacto" : "Agregar contacto",
    etiquetaBotonGuardar: esEdicion ? "Guardar cambios" : "Guardar contacto",
  };
}
