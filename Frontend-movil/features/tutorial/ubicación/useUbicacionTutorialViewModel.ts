import { useCallback, useRef, useState } from "react";
import LottieView from "lottie-react-native";

// ─── Constantes de datos ──────────────────────────────────────────────────────
export const MUNICIPIOS_HUILA = [
  "Neiva", "Pitalito", "Garzón", "San Agustín", "Gigante",
  "Campoalegre", "Rivera", "La Plata", "Palermo", "Isnos",
  "Timaná", "Algeciras", "Suaza", "El Agrado", "Paicol",
  "Saladoblanco", "Oporapa", "Elías", "Tarqui", "Altamira",
  "La Argentina", "Pital", "Tesalia", "Aipe", "Villavieja",
  "Tello", "Hobo", "Yaguará", "Iquira", "Teruel",
  "Baraya", "Colombia", "Santa María",
] as const;

// Placeholder vacío para forzar selección
export const PLACEHOLDER_MUNICIPIO = "";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface UbicacionErrors {
  departamento: string | null;
  municipio: string | null;
}

// ─── ViewModel ────────────────────────────────────────────────────────────────
export function useUbicacionTutorialViewModel() {
  const [departamento, setDepartamento] = useState("Huila");
  const [municipio, setMunicipio]       = useState(PLACEHOLDER_MUNICIPIO);
  const [modalConfirmacionVisible, setModalConfirmacionVisible] = useState(false);
  const [errors, setErrors]             = useState<UbicacionErrors>({ departamento: null, municipio: null });
  const [showValidationBanner, setShowValidationBanner] = useState(false);

  const resolverPaso = useRef<(valor: boolean) => void>(() => {});

  // ── Lottie ref (por si se necesita controlar) ────────────────────────────
  const lottieRef = useRef<LottieView>(null);

  // ── Validación ────────────────────────────────────────────────────────────
  const validar = useCallback((): boolean => {
    const newErrors: UbicacionErrors = {
      departamento: !departamento ? "Selecciona un departamento" : null,
      municipio:    (!municipio || municipio === PLACEHOLDER_MUNICIPIO)
                    ? "Selecciona un municipio" : null,
    };
    setErrors(newErrors);

    const hayError = Object.values(newErrors).some(Boolean);
    setShowValidationBanner(hayError);

    // Oculta el banner automáticamente tras 3 segundos
    if (hayError) {
      setTimeout(() => setShowValidationBanner(false), 3000);
    }

    return !hayError;
  }, [departamento, municipio]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Limpia el error de un campo cuando el usuario interactúa con él */
  const limpiarError = useCallback((campo: keyof UbicacionErrors) => {
    setErrors((prev) => ({ ...prev, [campo]: null }));
    setShowValidationBanner(false);
  }, []);

  /** El botón "Guardar Ubicación" dentro de la card */
  const abrirConfirmacion = useCallback(() => {
    if (!validar()) return;          // ← validación antes de abrir modal
    setModalConfirmacionVisible(true);
  }, [validar]);

  /** El Pager llama esto cuando el usuario intenta deslizar */
  const pedirConfirmacionUbicacion = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!validar()) {
        resolve(false);              // bloquea el deslizamiento
        return;
      }
      resolverPaso.current = resolve;
      setModalConfirmacionVisible(true);
    });
  }, [validar]);

  const cerrarConfirmacion = useCallback(() => {
    setModalConfirmacionVisible(false);
    resolverPaso.current(false);
  }, []);

  const confirmarUbicacion = useCallback(() => {
    setModalConfirmacionVisible(false);
    resolverPaso.current(true);
  }, []);

  return {
    // estado de formulario
    departamento,
    municipio,
    // setters con limpieza de error integrada
    setDepartamento: (val: string) => {
      setDepartamento(val);
      limpiarError("departamento");
    },
    setMunicipio: (val: string) => {
      setMunicipio(val);
      limpiarError("municipio");
    },
    // validación
    errors,
    showValidationBanner,
    // modal
    modalConfirmacionVisible,
    abrirConfirmacion,
    cerrarConfirmacion,
    confirmarUbicacion,
    pedirConfirmacionUbicacion,
    // datos
    municipiosHuila: MUNICIPIOS_HUILA,
    // lottie
    lottieRef,
  };
}