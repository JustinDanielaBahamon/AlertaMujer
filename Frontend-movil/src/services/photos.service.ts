import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

const SIDE_PX = 400;
const QUALITY = 0.6;

/**
 * Turns a chosen photo (gallery or phone contacts) into a small data URI image (~400 px, a few
 * tens of KB) stored in the backend. The gallery URI is a temporary file that
 * Android may delete: that is why profile and contact photos disappeared on refresh.
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
