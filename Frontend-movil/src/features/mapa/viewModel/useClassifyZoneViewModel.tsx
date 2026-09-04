import { useCallback, useMemo, useState } from "react";

export type NivelRiesgo =
  | "muy_seguro"
  | "medio_seguro"
  | "peligroso";

export type ClasificarZonaForm = {
  direccion: string;
  ciudad: string;
  barrio: string;
  descripcion: string;
  nivelRiesgo: NivelRiesgo | null;
};

const MAX_DESCRIPTION_LENGTH = 250;

export function useClasificarZonaViewModel() {
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [barrio, setBarrio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [nivelRiesgo, setNivelRiesgo] =
    useState<NivelRiesgo | null>(null);
  const [error, setError] = useState("");

  const form = useMemo<ClasificarZonaForm>(
    () => ({
      direccion,
      ciudad,
      barrio,
      descripcion,
      nivelRiesgo,
    }),
    [direccion, ciudad, barrio, descripcion, nivelRiesgo]
  );

  const isFormValid = useMemo(() => {
    return (
      direccion.trim().length > 0 &&
      ciudad.trim().length > 0 &&
      barrio.trim().length > 0 &&
      nivelRiesgo !== null
    );
  }, [direccion, ciudad, barrio, nivelRiesgo]);

  const seleccionarRiesgo = useCallback((nivel: NivelRiesgo) => {
    setNivelRiesgo(nivel);
    setError("");
  }, []);

  const actualizarDescripcion = useCallback((texto: string) => {
    setDescripcion(texto.slice(0, MAX_DESCRIPTION_LENGTH));
  }, []);

  const enviarReporte = useCallback(() => {
    if (!isFormValid) {
      setError("Completa dirección, ciudad, barrio y nivel de riesgo.");
      return false;
    }

    console.log("Reporte listo para enviar:", form);
    setError("");
    return true;
  }, [form, isFormValid]);

  return {
    form,
    error,
    isFormValid,
    descriptionLength: descripcion.length,
    maxDescriptionLength: MAX_DESCRIPTION_LENGTH,
    setDireccion,
    setCiudad,
    setBarrio,
    actualizarDescripcion,
    seleccionarRiesgo,
    enviarReporte,
  };
}
