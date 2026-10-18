import { useCallback, useEffect, useRef, useState } from "react";
import { enviarMensaje, leerMensajes, type MensajeAlerta, type ParticipanteChat } from "../../services/alert-chat.service";

const REFRESCO_MS = 5000;

/** Chat de la alerta: trae los mensajes nuevos cada 5 s mientras está activo y permite enviar. */
export function useChatAlerta(participante: ParticipanteChat | null, activo: boolean) {
  const [mensajes, setMensajes] = useState<MensajeAlerta[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ultimoId = useRef(0);
  const clave = participante ? JSON.stringify(participante) : null;

  const agregar = useCallback((nuevos: MensajeAlerta[]) => {
    if (nuevos.length === 0) return;
    setMensajes((actuales) => {
      const ids = new Set(actuales.map((m) => m.id));
      const juntos = [...actuales, ...nuevos.filter((m) => !ids.has(m.id))];
      ultimoId.current = juntos.length ? juntos[juntos.length - 1].id : 0;
      return juntos;
    });
  }, []);

  useEffect(() => {
    if (!participante) return undefined;
    let vivo = true;
    const leer = () =>
      leerMensajes(participante, ultimoId.current)
        .then((nuevos) => vivo && agregar(nuevos))
        .catch(() => {
          // Sin conexión: se reintenta en la siguiente lectura
        });
    leer();
    const t = activo ? setInterval(leer, REFRESCO_MS) : null;
    return () => {
      vivo = false;
      if (t) clearInterval(t);
    };
    // participante se compara por su contenido (clave)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, activo, agregar]);

  const enviar = useCallback(
    async (texto: string) => {
      const cuerpo = texto.trim();
      if (!participante || !cuerpo || enviando) return false;
      setEnviando(true);
      setError(null);
      try {
        agregar([await enviarMensaje(participante, cuerpo)]);
        return true;
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "No se pudo enviar el mensaje. Intenta de nuevo.");
        return false;
      } finally {
        setEnviando(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clave, enviando, agregar],
  );

  return { mensajes, enviar, enviando, error };
}
