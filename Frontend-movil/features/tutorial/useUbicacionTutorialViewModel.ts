import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../../src/navigation/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export const MUNICIPIOS_HUILA = [
  "Neiva",
  "Pitalito",
  "Garzón",
  "San Agustín",
  "Gigante",
  "Campoalegre",
  "Rivera",
  "La Plata",
  "Palermo",
  "Isnos",
];

export function useUbicacionTutorialViewModel() {
  const navigation = useNavigation<Nav>();
  const [departamento, setDepartamento] = useState("Huila");
  const [municipio, setMunicipio] = useState("Neiva");
  const [modalConfirmacionVisible, setModalConfirmacionVisible] = useState(false);

  const abrirConfirmacion = useCallback(() => {
    setModalConfirmacionVisible(true);
  }, []);

  const cerrarConfirmacion = useCallback(() => {
    setModalConfirmacionVisible(false);
  }, []);

  const confirmarUbicacion = useCallback(() => {
    setModalConfirmacionVisible(false);
    navigation.navigate("TutorialContacto");
  }, [navigation]);

  const regresar = useCallback(() => {
    navigation.navigate("TutorialMensaje");
  }, [navigation]);

  return {
    departamento,
    setDepartamento,
    municipio,
    setMunicipio,
    modalConfirmacionVisible,
    abrirConfirmacion,
    cerrarConfirmacion,
    confirmarUbicacion,
    regresar,
    municipiosHuila: MUNICIPIOS_HUILA,
  };
}
