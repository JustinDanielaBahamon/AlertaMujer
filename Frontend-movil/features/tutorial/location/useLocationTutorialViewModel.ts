import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useRef, useState } from "react";
import LottieView from "lottie-react-native";

export const MUNICIPALITIES_HUILA = [
  "Neiva", "Pitalito", "Garzón", "San Agustín", "Gigante",
  "Campoalegre", "Rivera", "La Plata", "Palermo", "Isnos",
  "Timaná", "Algeciras", "Suaza", "El Agrado", "Paicol",
  "Saladoblanco", "Oporapa", "Elías", "Tarqui", "Altamira",
  "La Argentina", "Pital", "Tesalia", "Aipe", "Villavieja",
  "Tello", "Hobo", "Yaguará", "Iquira", "Teruel",
  "Baraya", "Colombia", "Santa María",
] as const;

export const PLACEHOLDER_MUNICIPALITY = "";

// Clave fija de AsyncStorage para la ubicación
export const STORAGE_KEY_UBICACION = "@alerta_mujer:ubicacion";

export interface LocationErrors {
  department: string | null;
  municipality: string | null;
}

export function useLocationTutorialViewModel() {
  const [department, setDepartment]     = useState("Huila");
  const [municipality, setMunicipality] = useState(PLACEHOLDER_MUNICIPALITY);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [errors, setErrors]             = useState<LocationErrors>({ department: null, municipality: null });
  const [showValidationBanner, setShowValidationBanner] = useState(false);
  const [alreadyConfirmed, setAlreadyConfirmed]         = useState(false);

  const alreadyConfirmedRef = useRef(false);
  const resolveStep = useRef<(value: boolean) => void>(() => {});
  const lottieRef   = useRef<LottieView>(null);

  const validate = useCallback((): boolean => {
    const newErrors: LocationErrors = {
      department:   !department ? "Selecciona un departamento" : null,
      municipality: (!municipality || municipality === PLACEHOLDER_MUNICIPALITY)
                    ? "Selecciona un municipio" : null,
    };
    setErrors(newErrors);
    const hasError = Object.values(newErrors).some(Boolean);
    setShowValidationBanner(hasError);
    if (hasError) setTimeout(() => setShowValidationBanner(false), 3000);
    return !hasError;
  }, [department, municipality]);

  const clearError = useCallback((field: keyof LocationErrors) => {
    setErrors((prev) => ({ ...prev, [field]: null }));
    setShowValidationBanner(false);
  }, []);

  const openConfirmation = useCallback(() => {
    if (!validate()) return;
    setConfirmationModalVisible(true);
  }, [validate]);

  const requestLocationConfirmation = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!validate()) { resolve(false); return; }
      if (alreadyConfirmedRef.current) { resolve(true); return; }
      resolveStep.current = resolve;
      setConfirmationModalVisible(true);
    });
  }, [validate]);

  // Guarda departamento + municipio en AsyncStorage al confirmar
  const confirmLocation = useCallback(async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY_UBICACION,
        JSON.stringify({ department, municipality })
      );
    } catch {
      // Si falla el guardado no bloqueamos el flujo
    }
    alreadyConfirmedRef.current = true;
    setAlreadyConfirmed(true);
    setConfirmationModalVisible(false);
    resolveStep.current(true);
  }, [department, municipality]);

  const closeConfirmation = useCallback(() => {
    if (alreadyConfirmedRef.current) {
      setConfirmationModalVisible(false);
      return;
    }
    setConfirmationModalVisible(false);
    resolveStep.current(false);
  }, []);

  return {
    department,
    municipality,
    setDepartment: (val: string) => {
      setDepartment(val);
      clearError("department");
      alreadyConfirmedRef.current = false;
      setAlreadyConfirmed(false);
    },
    setMunicipality: (val: string) => {
      setMunicipality(val);
      clearError("municipality");
      alreadyConfirmedRef.current = false;
      setAlreadyConfirmed(false);
    },
    errors,
    showValidationBanner,
    confirmationModalVisible,
    openConfirmation,
    closeConfirmation,
    confirmLocation,
    requestLocationConfirmation,
    municipalitiesHuila: MUNICIPALITIES_HUILA,
    lottieRef,
    alreadyConfirmed,
  };
}