/**
 * VIEWMODEL DE CONTACTOS (MVVM)
 * 
 * Maneja toda la lógica de la lista de contactos:
 * - Estado de la lista de contactos
 * - Modal de acciones (abrir/cerrar)
 * - Confirmación de borrado
 * - Navegación a agregar/editar
 * 
 * La vista (contactos.tsx) solo consume este ViewModel.
 */

import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { Alert } from "react-native";
import type { Contacto } from "../../src/models/Contacto";
import { getMainStackNavigation } from "../../src/navigation/navigationHelpers";

// Datos de ejemplo (luego vendrán del backend)
const CONTACTOS_MOCK_INICIAL: Contacto[] = [
  {
    id: "1",
    nombre: "Tatiana Montero",
    parentesco: "Hermana",
    telefono: "3176866754",
  },
];

/**
 * Formatea un teléfono de 10 dígitos a formato: 317 686 6754
 */
function formatearTelefonoMostrar(telefono: string): string {
  const soloDigitos = telefono.replace(/\D/g, "");
  if (soloDigitos.length === 10) {
    return `${soloDigitos.slice(0, 3)} ${soloDigitos.slice(3, 6)} ${soloDigitos.slice(6)}`;
  }
  return telefono;
}

export function useContactosTabViewModel() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  
  // Estado: Lista de contactos
  const [contactos, setContactos] = useState<Contacto[]>(CONTACTOS_MOCK_INICIAL);
  
  // Estado: ¿Está abierto el modal de acciones?
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estado: ¿Qué contacto se seleccionó?
  const [contactoSeleccionado, setContactoSeleccionado] = useState<Contacto | null>(null);

  /**
   * ABRIR MODAL DE ACCIONES
   * Se ejecuta cuando el usuario toca un contacto.
   */
  const abrirModalAcciones = useCallback((contacto: Contacto) => {
    setContactoSeleccionado(contacto); // Guardar cuál contacto tocó
    setModalVisible(true);              // Mostrar el modal
  }, []);

  /**
   * CERRAR MODAL DE ACCIONES
   */
  const cerrarModalAcciones = useCallback(() => {
    setModalVisible(false);
    // Esperar a que termine la animación antes de limpiar
    setTimeout(() => setContactoSeleccionado(null), 300);
  }, []);

  /**
   * NAVEGAR A AGREGAR/EDITAR CONTACTO
   * Si recibe un contacto, abre en modo "editar" (con datos precargados).
   * Si no recibe contacto, abre en modo "crear nuevo".
   */
  const navegarAgregarOEditar = useCallback(
    (contacto?: Contacto) => {
      const main = getMainStackNavigation(navigation);
      if (!main) {
        return;
      }
      if (contacto) {
        // Modo editar: pasar el contacto como parámetro
        main.navigate("AgregarContacto", { contacto });
      } else {
        // Modo crear nuevo
        main.navigate("AgregarContacto", undefined);
      }
    },
    [navigation],
  );

  /**
   * IR A AGREGAR NUEVO CONTACTO
   * Se ejecuta al tocar el botón flotante "+"
   */
  const irAgregarContacto = useCallback(() => {
    navegarAgregarOEditar(undefined);
  }, [navegarAgregarOEditar]);

  /**
   * CONFIRMAR BORRADO
   * Muestra un Alert nativo de confirmación antes de borrar.
   */
  const confirmarBorrar = useCallback((contacto: Contacto) => {
    Alert.alert(
      "¿Eliminar contacto?",
      `${contacto.nombre} ya no recibirá tus alertas de emergencia.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            // Eliminar del estado (filtrar todos excepto este)
            setContactos((prev) => prev.filter((c) => c.id !== contacto.id));
          },
        },
      ],
    );
  }, []);

  /**
   * ACCIÓN: ACTUALIZAR
   * Se ejecuta cuando el usuario toca "Actualizar" en el modal.
   */
  const handleActualizar = useCallback(() => {
    if (contactoSeleccionado) {
      navegarAgregarOEditar(contactoSeleccionado);
    }
  }, [contactoSeleccionado, navegarAgregarOEditar]);

  /**
   * ACCIÓN: BORRAR
   * Se ejecuta cuando el usuario toca "Borrar" en el modal.
   */
  const handleBorrar = useCallback(() => {
    if (contactoSeleccionado) {
      confirmarBorrar(contactoSeleccionado);
    }
  }, [contactoSeleccionado, confirmarBorrar]);

  /**
   * BORRAR CON SWIPE (deslizar)
   * Se ejecuta cuando el usuario desliza un contacto hacia la izquierda.
   */
  const borrarConSwipe = useCallback((contacto: Contacto) => {
    confirmarBorrar(contacto);
  }, [confirmarBorrar]);

  // Retornar todo lo que la vista necesita
  return {
    // Estado
    contactos,
    modalVisible,
    contactoSeleccionado,
    
    // Funciones de utilidad
    formatearTelefonoMostrar,
    
    // Acciones
    abrirModalAcciones,
    cerrarModalAcciones,
    handleActualizar,
    handleBorrar,
    irAgregarContacto,
    borrarConSwipe,
  };
}