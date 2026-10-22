import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

const SIDE_PX = 400;
const QUALITY = 0.6;

/**
 * Convierte una foto elegida (galería o agenda) en una imagen pequeña en data URI (~400 px, unas
 * decenas de KB) que se guarda en el backend. La URI de la galería es un archivo temporal que
 * Android puede borrar: por eso las fotos de perfil y de contactos desaparecían al refrescar.
 */
export async function toStorablePhoto(uri: string): Promise<string> {
  if (uri.startsWith("data:")) return uri;
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: SIDE_PX });
  const image = await context.renderAsync();
  const result = await image.saveAsync({ compress: QUALITY, format: SaveFormat.JPEG, base64: true });
  if (!result.base64) throw new Error("No se pudo procesar la foto");
  return `data:image/jpeg;base64,${result.base64}`;
}
