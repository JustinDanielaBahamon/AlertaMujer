import { useCallback, useEffect, useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Contacts from "expo-contacts";
import { Alert } from "react-native";
import type { MainStackParamList } from "../../src/navigation/types";

type AgregarNav = NativeStackNavigationProp<MainStackParamList, "AgregarContacto">;
type AgregarRoute = RouteProp<MainStackParamList, "AgregarContacto">;

export function useAgregarContactoViewModel() {
  const navigation = useNavigation<AgregarNav>();
  const route = useRoute<AgregarRoute>();
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
    // TODO: persistir (API) y devolver lista actualizada al tab Contactos
    navigation.goBack();
  }, [navigation]);

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
