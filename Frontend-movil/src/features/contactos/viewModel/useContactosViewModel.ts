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

import { useCallback, useState ,useMemo} from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import { Alert, Share } from "react-native";
import { WEB_URL } from "../../../constants/enlaces";
import { useLocale } from "../../../contexts/LocaleContext";
import { contactosService, type EstadoAppContacto } from "../../../services/contactos.service";
import type { Contacto } from "../models/Contacto";
import { getMainStackNavigation } from "../../../navigation/navigationHelpers";
import { useContactosContext } from "../../../contexts/ContactosContext";

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

/** Con menos de estos contactos es fácil que nadie vea la alerta a tiempo. */
export const CONTACTOS_RECOMENDADOS = 5;

export function useContactosTabViewModel() {
  const { t } = useLocale();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { contactos, eliminarContacto, refrescarContactos, loading } = useContactosContext();
  const [busqueda, setBusqueda] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  /**
   * RECARGAR AL ENFOCAR LA PANTALLA
   * Igual que en Historial: cada vez que el usuario entra a la pestaña
   * de Contactos, se vuelve a pedir la lista al backend. Así, si el
   * contacto se creó/editó/borró en otro lado (web, u otra sesión),
   * la móvil siempre muestra lo último al abrir la pantalla.
   */
  // Estado real de cada contacto (antes decía "Disponible" sin revisar nada)
  const [estadoApp, setEstadoApp] = useState<Record<string, EstadoAppContacto>>({});
  const cargarEstadoApp = useCallback(() => {
    contactosService.getEstadoApp().then(setEstadoApp).catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      refrescarContactos();
      cargarEstadoApp();
    }, [refrescarContactos, cargarEstadoApp]),
  );

  /** Comparte el enlace de la app para que el contacto reciba las alertas también en su celular. */
  const invitarALaApp = useCallback((contacto: Contacto) => {
    const mensaje = t.contactos.invitar_mensaje
      .replace("{nombre}", (contacto.nombre || "").split(" ")[0] || "")
      .replace("{correo}", contacto.email || "")
      .replace("{url}", WEB_URL);
    Share.share({ message: mensaje }).catch(() => {});
  }, [t]);

  /**
   * PULL TO REFRESH (deslizar hacia abajo para recargar)
   * Mismo comportamiento que tiene el módulo de Historial.
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      cargarEstadoApp();
      await refrescarContactos();
    } finally {
      setRefreshing(false);
    }
  }, [refrescarContactos, cargarEstadoApp]);

  const contactosFiltrados = useMemo(() =>
    contactos.filter(c => {
      const nombreStr = (c.nombre || '').toLowerCase();
      const telefonoStr = c.telefono || '';
      return nombreStr.includes(busqueda.toLowerCase()) || telefonoStr.includes(busqueda);
    }),
    [contactos, busqueda]  // ← solo recalcula cuando estos dos cambian
  );
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
   * ALERTA INDIVIDUAL
   * Inicia la alerta normal (pantalla de 5 segundos) pero solo para este contacto.
   */
  const alertarContacto = useCallback(
    (contacto: Contacto) => {
      const main = getMainStackNavigation(navigation);
      if (!main) {
        return;
      }
      main.navigate("Activacion", { contacto });
    },
    [navigation],
  );

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
            eliminarContacto(contacto.id);
          },
        },
      ],
    );
  }, [eliminarContacto]);

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
    busqueda,
    loading,
    refreshing,
    onRefresh,
    estadoApp,
    faltanContactos: Math.max(0, CONTACTOS_RECOMENDADOS - contactos.length),
    invitarALaApp,
    
    // Funciones de utilidad
    formatearTelefonoMostrar,
    contactosFiltrados,
    // Acciones
    abrirModalAcciones,
    cerrarModalAcciones,
    handleActualizar,
    handleBorrar,
    irAgregarContacto,
    alertarContacto,
    borrarConSwipe,
    setBusqueda
  };
}