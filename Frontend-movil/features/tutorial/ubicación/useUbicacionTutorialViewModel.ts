import { useCallback, useRef, useState } from "react";
import LottieView from "lottie-react-native";

export const MUNICIPIOS_HUILA = [
  "Neiva", "Pitalito", "Garzón", "San Agustín", "Gigante",
  "Campoalegre", "Rivera", "La Plata", "Palermo", "Isnos",
  "Timaná", "Algeciras", "Suaza", "El Agrado", "Paicol",
  "Saladoblanco", "Oporapa", "Elías", "Tarqui", "Altamira",
  "La Argentina", "Pital", "Tesalia", "Aipe", "Villavieja",
  "Tello", "Hobo", "Yaguará", "Iquira", "Teruel",
  "Baraya", "Colombia", "Santa María",
] as const;

export const PLACEHOLDER_MUNICIPIO = "";

export interface UbicacionErrors {
  departamento: string | null;
  municipio: string | null;
}

export function useUbicacionTutorialViewModel() {
  const [departamento, setDepartamento] = useState("Huila");
  const [municipio, setMunicipio]       = useState(PLACEHOLDER_MUNICIPIO);
  const [modalConfirmacionVisible, setModalConfirmacionVisible] = useState(false);
  const [errors, setErrors]             = useState<UbicacionErrors>({ departamento: null, municipio: null });
  const [showValidationBanner, setShowValidationBanner] = useState(false);

  const resolverPaso  = useRef<(valor: boolean) => void>(() => {});
  // ← Flag: el usuario ya confirmó desde el botón, no mostrar modal de nuevo
  const yaConfirmado  = useRef(false);

  const lottieRef = useRef<LottieView>(null);

  const validar = useCallback((): boolean => {
    const newErrors: UbicacionErrors = {
      departamento: !departamento ? "Selecciona un departamento" : null,
      municipio:    (!municipio || municipio === PLACEHOLDER_MUNICIPIO)
                    ? "Selecciona un municipio" : null,
    };
    setErrors(newErrors);
    const hayError = Object.values(newErrors).some(Boolean);
    setShowValidationBanner(hayError);
    if (hayError) setTimeout(() => setShowValidationBanner(false), 3000);
    return !hayError;
  }, [departamento, municipio]);

  const limpiarError = useCallback((campo: keyof UbicacionErrors) => {
    setErrors((prev) => ({ ...prev, [campo]: null }));
    setShowValidationBanner(false);
  }, []);

  /** Botón "Guardar Ubicación" dentro de la card */
  const abrirConfirmacion = useCallback(() => {
    if (!validar()) return;
    setModalConfirmacionVisible(true);
  }, [validar]);

  /** 
   * El Pager llama esto al intentar avanzar.
   * Si el usuario ya confirmó desde el botón → resuelve true sin abrir modal.
   * Si no → abre el modal normalmente.
   */
  const pedirConfirmacionUbicacion = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!validar()) {
        resolve(false);
        return;
      }
      // ← Ya confirmó desde el botón, avanza directo sin modal
      if (yaConfirmado.current) {
        yaConfirmado.current = false; // reset para la próxima vez
        resolve(true);
        return;
      }
      resolverPaso.current = resolve;
      setModalConfirmacionVisible(true);
    });
  }, [validar]);

  const confirmarUbicacion = useCallback(() => {
    setModalConfirmacionVisible(false);
    yaConfirmado.current = true;
    resolverPaso.current(true);
  }, []);

  // ← Si el usuario toca "Cambiar datos" pero ya confirmó antes, no hace nada
  const cerrarConfirmacion = useCallback(() => {
    if (yaConfirmado.current) return; // ← bloquea el regreso si ya confirmó
    setModalConfirmacionVisible(false);
    resolverPaso.current(false);
  }, []);

  

  return {
    departamento,
    municipio,
    setDepartamento: (val: string) => { setDepartamento(val); limpiarError("departamento"); yaConfirmado.current = false; },
    setMunicipio:    (val: string) => { setMunicipio(val);    limpiarError("municipio");    yaConfirmado.current = false; },
    errors,
    showValidationBanner,
    modalConfirmacionVisible,
    abrirConfirmacion,
    cerrarConfirmacion,
    confirmarUbicacion,
    pedirConfirmacionUbicacion,
    municipiosHuila: MUNICIPIOS_HUILA,
    lottieRef,
    yaConfirmado, // ← agregar esto
  };
}