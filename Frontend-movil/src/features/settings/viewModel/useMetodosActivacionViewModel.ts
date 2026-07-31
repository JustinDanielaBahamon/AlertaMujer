import { useNavigation } from "@react-navigation/native";
import { useLocale } from "../../../contexts/LocaleContext";

export interface PasoMetodo {
  texto: string;
}

export interface MetodoActivacion {
  id: string;
  icono: string;
  titulo: string;
  descripcion: string;
  pasos: PasoMetodo[];
}

function getMetodosActivacion(t: ReturnType<typeof useLocale>["t"]): MetodoActivacion[] {
  return [
    {
      id: "agitar",
      icono: "phone-portrait-outline",
      titulo: t.metodosActivacion.agitar_titulo,
      descripcion: t.metodosActivacion.agitar_desc,
      pasos: [
        { texto: t.metodosActivacion.agitar_paso1 },
        { texto: t.metodosActivacion.agitar_paso2 },
        { texto: t.metodosActivacion.agitar_paso3 },
        { texto: t.metodosActivacion.agitar_paso4 },
      ],
    },
    {
      id: "popup",
      icono: "notifications-outline",
      titulo: t.metodosActivacion.popup_titulo,
      descripcion: t.metodosActivacion.popup_desc,
      pasos: [
        { texto: t.metodosActivacion.popup_paso1 },
        { texto: t.metodosActivacion.popup_paso2 },
        { texto: t.metodosActivacion.popup_paso3 },
        { texto: t.metodosActivacion.popup_paso4 },
      ],
    },
  ];
}

export function useMetodosActivacionViewModel() {
  const navigation = useNavigation();
  const { t } = useLocale();

  const volver = () => {
    navigation.goBack();
  };

  return {
    metodos: getMetodosActivacion(t),
    volver,
  };
}