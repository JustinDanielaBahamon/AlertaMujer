import { useCallback, useEffect, useRef, useState } from "react";
import { sendMessage, readMessages, type AlertMessage, type ChatParticipant } from "../../services/alert-chat.service";

const REFRESH_MS = 5000;

/** Chat de la alerta: trae los mensajes nuevos cada 5 s mientras está activo y permite enviar. */
export function useAlertChat(participant: ChatParticipant | null, enabled: boolean) {
  const [messages, setMessages] = useState<AlertMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastId = useRef(0);
  const key = participant ? JSON.stringify(participant) : null;

  const add = useCallback((newOnes: AlertMessage[]) => {
    if (newOnes.length === 0) return;
    setMessages((currentOnes) => {
      const ids = new Set(currentOnes.map((m) => m.id));
      const together = [...currentOnes, ...newOnes.filter((m) => !ids.has(m.id))];
      lastId.current = together.length ? together[together.length - 1].id : 0;
      return together;
    });
  }, []);

  useEffect(() => {
    if (!participant) return undefined;
    let alive = true;
    const leer = () =>
      readMessages(participant, lastId.current)
        .then((newOnes) => alive && add(newOnes))
        .catch(() => {
          // Sin conexión: se reintenta en la siguiente lectura
        });
    leer();
    const t = enabled ? setInterval(leer, REFRESH_MS) : null;
    return () => {
      alive = false;
      if (t) clearInterval(t);
    };
    // participante se compara por su contenido (clave)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, add]);

  const send = useCallback(
    async (text: string) => {
      const body = text.trim();
      if (!participant || !body || sending) return false;
      setSending(true);
      setError(null);
      try {
        add([await sendMessage(participant, body)]);
        return true;
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "No se pudo enviar el mensaje. Intenta de nuevo.");
        return false;
      } finally {
        setSending(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, sending, add],
  );

  return { messages: messages, send: send, sending: sending, error };
}
