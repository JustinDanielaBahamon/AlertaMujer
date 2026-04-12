import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Contacts from 'expo-contacts'; 
import { Alert } from "react-native";

export function useAgregarContactoViewModel() {
  const navigation = useNavigation<any>();
  
  // Estados para manejar los datos del formulario
  const [nombre, setNombre] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [telefono, setTelefono] = useState("");

  /**
   * Solicita permisos y abre la agenda nativa del dispositivo.
   * Al seleccionar un contacto, rellena automáticamente los campos del formulario.
   */
  const abrirAgenda = async () => {
    // 1. Solicitar permisos al sistema operativo
    const { status } = await Contacts.requestPermissionsAsync();
    
    if (status === 'granted') {
      try {
        /**
         * CORRECCIÓN: presentContactPickerAsync devuelve el contacto directamente, 
         * no un objeto desestructurado { contact }.
         */
        const contactoSeleccionado = await Contacts.presentContactPickerAsync();
        
        if (contactoSeleccionado) {
          // 2. Extraer nombre (prioriza el nombre completo 'name')
          const nombreDesdeAgenda = contactoSeleccionado.name || 
            `${contactoSeleccionado.firstName || ""} ${contactoSeleccionado.lastName || ""}`.trim();
          
          setNombre(nombreDesdeAgenda);
          
          // 3. Extraer primer número de teléfono disponible
          if (contactoSeleccionado.phoneNumbers && contactoSeleccionado.phoneNumbers.length > 0) {
            /**
             * Usamos una expresión regular para limpiar el número:
             * [^\d+] -> Quita todo lo que NO sea un número o el signo +
             */
            const numeroLimpio = contactoSeleccionado.phoneNumbers[0].number?.replace(/[^\d+]/g, "");
            setTelefono(numeroLimpio || "");
          }
          
          // Nota para el equipo: Los campos se llenan pero la pantalla NO se cierra 
          // para permitir que la usuaria edite el nombre o agregue el parentesco.
        }
      } catch (error) {
        console.error("Error al seleccionar contacto:", error);
      }
    } else {
      Alert.alert(
        "Permiso denegado", 
        "Ve a configuración para permitir que la app acceda a tus contactos."
      );
    }
  };

  /**
   * Finaliza el flujo volviendo a la pantalla anterior.
   */
  const guardar = useCallback(() => {
    // TODO: Implementar lógica de persistencia (API/Firebase) aquí
    navigation.goBack();
  }, [navigation]);

  const cancelar = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    nombre, setNombre,
    parentesco, setParentesco,
    telefono, setTelefono,
    abrirAgenda, 
    guardar,
    cancelar,
  };
}