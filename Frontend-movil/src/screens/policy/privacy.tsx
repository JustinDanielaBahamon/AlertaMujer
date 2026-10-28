import { useLocale } from "../../contexts/LocaleContext";
import PolicyDocument from "./PolicyDocument";

export default function Privacy() {
  const { t } = useLocale();
  const p = t.politicaPrivacidad;
  const items = ([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((n) => ({
    title: p[`item${n}_titulo` as keyof typeof p],
    description: p[`item${n}_desc` as keyof typeof p],
  }));
  return (
    <PolicyDocument
      title={p.encabezado}
      subtitle="Cómo cuidamos tus datos"
      icon="shield-checkmark"
      items={items}
      backText={p.volver}
    />
  );
}
