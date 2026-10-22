import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { useContactsContext } from "../../../contexts/ContactsContext";
import { useLocale } from "../../../contexts/LocaleContext";
import { useActivationMethods } from "../../../contexts/ActivationMethodsContext";
import type { MainStackParamList } from "../../../navigation/types";
import { missingCritical, checkPermissions } from "../../permissions/permissions";

type Nav = NativeStackNavigationProp<MainStackParamList>;

export type Requirement = {
  id: "datos" | "contactos" | "correos" | "permisos" | "foto";
  icon: string; // Ionicons
  title: string;
  detail: string;
  meets: boolean;
  /** false = recomendado: no impide que las alertas funcionen. */
  required: boolean;
  action?: { text: string; ir: () => void };
};

type ProfileData = { name: string; phoneNumber: string; birthDate: string; document: string; profilePhoto: string | null };

const validDate = (f: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(f.trim());

/** Revisa si la cuenta tiene lo necesario para que una alerta llegue y sirva de algo. */
export function useAccountRequirements(profile: ProfileData) {
  const navigation = useNavigation<Nav>();
  const { t } = useLocale();
  const r = t.perfil;
  const { contacts } = useContactsContext();
  const { config } = useActivationMethods();
  const [missingPermissions, setMissingPermissions] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      checkPermissions(config.agitar)
        .then((statuses) => setMissingPermissions(missingCritical(statuses).length))
        .catch(() => setMissingPermissions(null));
    }, [config.agitar]),
  );

  const requirements = useMemo<Requirement[]>(() => {
    const missingData = [
      profile.name.trim().split(/\s+/).length < 2 && r.req_dato_apellido,
      profile.phoneNumber.trim().length < 7 && r.req_dato_telefono,
      !validDate(profile.birthDate) && r.req_dato_fecha,
      !profile.document.trim() && r.req_dato_documento,
    ].filter(Boolean) as string[];
    const noEmail = contacts.filter((c) => !c.email?.trim()).length;
    const goToContacts = () => navigation.navigate("DrawerHome", { screen: "Home", params: { screen: "Contacts" } } as never);

    return [
      {
        id: "datos",
        icon: "id-card-outline",
        title: r.req_datos_titulo,
        detail: missingData.length === 0 ? r.req_datos_ok : `${r.req_datos_falta} ${missingData.join(", ")}.`,
        meets: missingData.length === 0,
        required: true,
      },
      {
        id: "contactos",
        icon: "people-outline",
        title: r.req_contactos_titulo,
        detail: contacts.length > 0 ? r.req_contactos_ok.replace("{n}", String(contacts.length)) : r.req_contactos_falta,
        meets: contacts.length > 0,
        required: true,
        action: contacts.length > 0 ? undefined : { text: r.req_contactos_accion, ir: goToContacts },
      },
      {
        id: "correos",
        icon: "mail-outline",
        title: r.req_correos_titulo,
        detail: noEmail === 0 ? r.req_correos_ok : r.req_correos_falta.replace("{n}", String(noEmail)),
        meets: contacts.length > 0 && noEmail === 0,
        required: true,
        action: noEmail > 0 ? { text: r.req_correos_accion, ir: goToContacts } : undefined,
      },
      {
        id: "permisos",
        icon: "shield-checkmark-outline",
        title: r.req_permisos_titulo,
        detail:
          missingPermissions === 0 ? r.req_permisos_ok : r.req_permisos_falta.replace("{n}", String(missingPermissions ?? "?")),
        meets: missingPermissions === 0,
        required: true,
        action: missingPermissions === 0 ? undefined : { text: r.req_permisos_accion, ir: () => navigation.navigate("Permissions") },
      },
      {
        id: "foto",
        icon: "camera-outline",
        title: r.req_foto_titulo,
        detail: profile.profilePhoto ? r.req_foto_ok : r.req_foto_falta,
        meets: !!profile.profilePhoto,
        required: false,
      },
    ];
  }, [profile, contacts, missingPermissions, navigation, r]);

  const requiredItems = requirements.filter((q) => q.required);
  const met = requiredItems.filter((q) => q.meets).length;
  return { requirements: requirements, met: met, total: requiredItems.length, list: met === requiredItems.length };
}
