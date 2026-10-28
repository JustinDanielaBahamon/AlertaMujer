package expo.modules.shakesensor

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.core.content.FileProvider
import java.io.File

/**
 * Copy of the evidence inside the app (files/evidencias/<alert>/): neither the gallery nor the file
 * manager shows it, so whoever checks her phone does not find it. She takes it out when she decides:
 * "Descargar" copies it to Descargas/AlertaMujer and "Compartir" opens the share sheet.
 */
object EvidenceFiles {

  private fun root(context: Context) = File(context.filesDir, "evidencias")

  fun folder(context: Context, alertId: Int) = File(root(context), alertId.toString())

  /** Moves an uploaded chunk from the cache into the alert's folder; the new file, or null. */
  fun keep(context: Context, uri: String, alertId: Int): File? {
    val source = inside(context.cacheDir, uri) ?: return null
    val target = File(folder(context, alertId).apply { mkdirs() }, source.name)
    return if (source.renameTo(target) || (source.copyTo(target, true).exists() && source.delete())) target else null
  }

  fun list(context: Context, alertId: Int): List<File> =
    folder(context, alertId).listFiles().orEmpty().filter { it.isFile && it.length() > 0 }.sortedBy { it.name }

  fun deleteAlert(context: Context, alertId: Int): Boolean = folder(context, alertId).deleteRecursively()

  fun deleteAll(context: Context): Boolean = root(context).deleteRecursively()

  /** Copies the file to Descargas/AlertaMujer (Android 10+). The visible path, or null. */
  fun export(context: Context, uri: String): String? {
    val file = inside(root(context), uri) ?: return null
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return null
    val values = ContentValues().apply {
      put(MediaStore.Downloads.DISPLAY_NAME, file.name)
      put(MediaStore.Downloads.MIME_TYPE, mimeOf(file))
      put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/AlertaMujer")
    }
    val resolver = context.contentResolver
    val target = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values) ?: return null
    resolver.openOutputStream(target)?.use { out -> file.inputStream().use { it.copyTo(out) } } ?: return null
    return "Descargas/AlertaMujer/" + file.name
  }

  /** Opens the share sheet (WhatsApp, email...) with the file. */
  fun share(context: Context, uri: String): Boolean {
    val file = inside(root(context), uri) ?: return false
    val shared = FileProvider.getUriForFile(context, context.packageName + ".evidence", file)
    val send = Intent(Intent.ACTION_SEND)
      .setType(mimeOf(file))
      .putExtra(Intent.EXTRA_STREAM, shared)
      .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    context.startActivity(Intent.createChooser(send, "Compartir evidencia").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    return true
  }

  private fun mimeOf(file: File) = if (file.extension == "m4a") "audio/mp4" else "video/mp4"

  /** The file of a file:// uri, only if it is inside that folder (nothing else can be touched). */
  private fun inside(folder: File, uri: String): File? {
    val path = Uri.parse(uri).path ?: return null
    val file = File(path).canonicalFile
    return if (file.isFile && file.path.startsWith(folder.canonicalPath)) file else null
  }
}
