import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { useContactosContext } from "../../../contexts/ContactosContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useMetodosActivacion } from "../../../contexts/MetodosActivacionContext";
import type { MainStackParamList } from "../../../navigation/types";
import { faltantesCriticos, revisarPermisos } from "../../permisos/permisos";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export type Requisito = {
  id: "datos" | "contactos" | "correos" | "permisos" | "foto";
  icono: string; // Ionicons
  titulo: string;
  detalle: string;
  cumple: boolean;
  /** false = recomendado: no impide que las alertas funcionen. */
  necesario: boolean;
  accion?: { texto: string; ir: () => void };
};

type DatosPerfil = { nombre: string; telefono: string; fechaNacimiento: string; documento: string; fotoPerfil: string | null };

const fechaValida = (f: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(f.trim());

/** Revisa si la cuenta tiene lo necesario para que una alerta llegue y sirva de algo. */
export function useRequisitosCuenta(perfil: DatosPerfil) {
  const navigation = useNavigation<Nav>();
  const { t } = useLocale();
  const r = t.perfil;
  const { contactos } = useContactosContext();
  const { config } = useMetodosActivacion();
  const [permisosFaltantes, setPermisosFaltantes] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      revisarPermisos(config.agitar)
        .then((estados) => setPermisosFaltantes(faltantesCriticos(estados).length))
        .catch(() => setPermisosFaltantes(null));
    }, [config.agitar]),
  );

  const requisitos = useMemo<Requisito[]>(() => {
    const faltanDatos = [
      perfil.nombre.trim().split(/\s+/).length < 2 && r.req_dato_apellido,
      perfil.telefono.trim().length < 7 && r.req_dato_telefono,
      !fechaValida(perfil.fechaNacimiento) && r.req_dato_fecha,
      !perfil.documento.trim() && r.req_dato_documento,
    ].filter(Boolean) as string[];
    const sinCorreo = contactos.filter((c) => !c.email?.trim()).length;
    const irAContactos = () => navigation.navigate("DrawerHome", { screen: "Inicio", params: { screen: "Contactos" } } as never);

    return [
      {
        id: "datos",
        icono: "id-card-outline",
        titulo: r.req_datos_titulo,
        detalle: faltanDatos.length === 0 ? r.req_datos_ok : `${r.req_datos_falta} ${faltanDatos.join(", ")}.`,
        cumple: faltanDatos.length === 0,
        necesario: true,
      },
      {
        id: "contactos",
        icono: "people-outline",
        titulo: r.req_contactos_titulo,
        detalle: contactos.length > 0 ? r.req_contactos_ok.replace("{n}", String(contactos.length)) : r.req_contactos_falta,
        cumple: contactos.length > 0,
        necesario: true,
        accion: contactos.length > 0 ? undefined : { texto: r.req_contactos_accion, ir: irAContactos },
      },
      {
        id: "correos",
        icono: "mail-outline",
        titulo: r.req_correos_titulo,
        detalle: sinCorreo === 0 ? r.req_correos_ok : r.req_correos_falta.replace("{n}", String(sinCorreo)),
        cumple: contactos.length > 0 && sinCorreo === 0,
        necesario: true,
        accion: sinCorreo > 0 ? { texto: r.req_correos_accion, ir: irAContactos } : undefined,
      },
      {
        id: "permisos",
        icono: "shield-checkmark-outline",
        titulo: r.req_permisos_titulo,
        detalle:
          permisosFaltantes === 0 ? r.req_permisos_ok : r.req_permisos_falta.replace("{n}", String(permisosFaltantes ?? "?")),
        cumple: permisosFaltantes === 0,
        necesario: true,
        accion: permisosFaltantes === 0 ? undefined : { texto: r.req_permisos_accion, ir: () => navigation.navigate("Permisos") },
      },
      {
        id: "foto",
        icono: "camera-outline",
        titulo: r.req_foto_titulo,
        detalle: perfil.fotoPerfil ? r.req_foto_ok : r.req_foto_falta,
        cumple: !!perfil.fotoPerfil,
        necesario: false,
      },
    ];
  }, [perfil, contactos, permisosFaltantes, navigation, r]);

  const necesarios = requisitos.filter((q) => q.necesario);
  const cumplidos = necesarios.filter((q) => q.cumple).length;
  return { requisitos, cumplidos, total: necesarios.length, lista: cumplidos === necesarios.length };
}
