import { useLocale } from "../../contexts/LocaleContext";
import PolicyDocument from "./PolicyDocument";

export default function Terms() {
  const { t } = useLocale();
  const p = t.politicaTerminos;
  const items = ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map((n) => ({
    title: p[`item${n}_titulo` as keyof typeof p],
    description: p[`item${n}_desc` as keyof typeof p],
  }));
  return (
    <PolicyDocument
      title={p.encabezado}
      subtitle="Las reglas de uso de la app"
      icon="document-text"
      items={items}
      backText={p.volver}
    />
  );
}
