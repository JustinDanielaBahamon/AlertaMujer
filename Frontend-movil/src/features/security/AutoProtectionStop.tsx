import { useEffect, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import { useLocale } from "../../contexts/LocaleContext";
import CancelPinModal from "../activeAlert/view/CancelPinModal";
import { isAutoStopLink, stopWithPin } from "./autoProtectionStop";

/**
 * "Detener" of the automatic protection, when she has a cancel PIN, opens the app here to ask for it. If
 * the link arrives before the session is restored it waits for it.
 */
export default function AutoProtectionStop({ withSession }: { withSession: boolean }) {
  const { t } = useLocale();
  const s = t.proteccionAutomatica;
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);
  // Changes with each tap on "Detener" so the effect below runs again
  const [requests, setRequests] = useState(0);

  useEffect(() => {
    const receive = (url: string | null) => {
      if (!isAutoStopLink(url)) return;
      pending.current = true;
      setRequests((n) => n + 1);
    };
    Linking.getInitialURL().then(receive).catch(() => {});
    const sub = Linking.addEventListener("url", ({ url }) => receive(url));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!pending.current || !withSession) return;
    pending.current = false;
    setError(null);
    setVisible(true);
  }, [requests, withSession]);

  const submit = async (pin: string) => {
    const result = await stopWithPin(pin);
    if (result === "wrong") {
      setError(s.pin_incorrecto);
      return;
    }
    setVisible(false);
    // The same message for both PINs: whoever is watching cannot tell which one she typed
    Alert.alert(s.detenida_titulo, s.detenida_texto);
  };

  return (
    <CancelPinModal
      visible={visible}
      error={error}
      onSubmit={submit}
      onClose={() => setVisible(false)}
      title={s.detener_titulo}
      description={s.detener_descripcion}
      confirmLabel={s.detener_confirmar}
    />
  );
}
