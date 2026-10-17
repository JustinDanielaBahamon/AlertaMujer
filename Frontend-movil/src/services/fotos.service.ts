import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

const LADO_PX = 400;
const CALIDAD = 0.6;

/**
 * Convierte una foto elegida (galería o agenda) en una imagen pequeña en data URI (~400 px, unas
 * decenas de KB) que se guarda en el backend. La URI de la galería es un archivo temporal que
 * Android puede borrar: por eso las fotos de perfil y de contactos desaparecían al refrescar.
 */
export async function aFotoGuardable(uri: string): Promise<string> {
  if (uri.startsWith("data:")) return uri;
  const contexto = ImageManipulator.manipulate(uri);
  contexto.resize({ width: LADO_PX });
  const imagen = await contexto.renderAsync();
  const resultado = await imagen.saveAsync({ compress: CALIDAD, format: SaveFormat.JPEG, base64: true });
  if (!resultado.base64) throw new Error("No se pudo procesar la foto");
  return `data:image/jpeg;base64,${resultado.base64}`;
}
