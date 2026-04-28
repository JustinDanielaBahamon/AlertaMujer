import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

  // ── CONTENEDOR PRINCIPAL ─────────────────────────────────────────────────
  ContenedorPrincipal: {
    flex: 1,
  },

  // ── HEADER ──────────────────────────────────────────────────────────────
  Header: {
    marginBottom: 0,
  },
  Gradiente: {
    paddingTop: 48,           // espacio para el status bar
    paddingHorizontal: 25,
    paddingBottom: 28,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  HeaderContenido: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  TituloHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    width: 220,
  },
  SubtituloHeader: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 6,
    lineHeight: 20,
    width: 220,
  },

  // ── CONTEO ───────────────────────────────────────────────────────────────
  Conteo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 8,
    marginLeft: 18,
  },
  // El color de fondo del Cousser lo pone el theme (contactCousserBg)
  Cousser: {
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
  },

  // ── BUSCADOR ─────────────────────────────────────────────────────────────
  ContenedorBuscador: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 14,
    marginBottom: 10,
    gap: 8,
  },
  InputBuscador: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },

  // ── TARJETA DE CONTACTO ───────────────────────────────────────────────────
  // El backgroundColor, borderWidth y borderColor los pone el TSX con el theme
  TarjetaWrapper: {
    marginBottom: 4,
    marginLeft: 10,
    marginRight: 10,
  },
  TarjetaContacto: {
    borderRadius: 24,
    padding: 16,
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    marginBottom: 16,
  },

  // Sección superior
  SeccionSuperior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  ContenedorFoto: {
    position: "relative",
  },
  FotoPerfil: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2.5,
    // borderColor lo pone el TSX con theme.contactAvatarBorder
  },
  PuntoEstado: {
    position: "absolute",
    bottom: 4,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#28a745",
    borderWidth: 2.5,
    // borderColor lo pone el TSX para que combine con el fondo de la card
  },
  InfoContacto: {
    flex: 1,
    paddingLeft: 14,
  },
  NombreContacto: {
    fontSize: 18,
    fontWeight: "bold",
    // color lo pone el TSX con theme.contactNombre
  },
  BadgeRelacion: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor y borderColor los pone el TSX
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 5,
    alignSelf: "flex-start",
  },
  TextoBadge: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
    // color lo pone el TSX con theme.contactBadgeText
  },
  ContenedorTelefono: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  Telefono: {
    fontSize: 13,
    // color lo pone el TSX con theme.contactSubtext
  },
  IconosSuperiores: {
    flexDirection: "row",
  },
  BotonIconoSmall: {
    // backgroundColor lo pone el TSX
    padding: 8,
    borderRadius: 10,
    marginLeft: 8,
  },

  // Sección acciones
  SeccionAcciones: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    // borderTopColor lo pone el TSX con theme.contactDivider
    paddingTop: 14,
    paddingHorizontal: 6,
  },
  ItemAccion: {
    alignItems: "center",
    flex: 1,
  },
  CirculoIcono: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    // backgroundColor lo pone el TSX
  },
  TextoAccion: {
    fontSize: 11,
    fontWeight: "500",
    // color lo pone el TSX con theme.contactSubtext
  },

  // ── FOOTER — TARJETA SUGERENCIA ──────────────────────────────────────────
  TarjetaSugerencia: {
    // backgroundColor y borderColor los pone el TSX
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1.5,
    marginTop: 6,
    marginBottom: 100,
    marginHorizontal: 10,
  },
  CirculoDashed: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderStyle: "dashed",
    // borderColor lo pone el TSX
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  BotonAgregarSmall: {
    // backgroundColor lo pone el TSX
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
  },

  // ── SWIPE BORRAR ─────────────────────────────────────────────────────────
  RowBack: {
    alignItems: "center",
    backgroundColor: "#FF5252",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 20,
    borderRadius: 24,
    marginBottom: 16,
    marginHorizontal: 10,
  },
  BotonBorrarSwipe: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: "100%",
  },
  TextoBorrarSwipe: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },

  // ── BOTÓN FLOTANTE ────────────────────────────────────────────────────────
  BotonFlotante: {
    position: "absolute",
    bottom: 30,
    right: 14,
    width: 64,
    height: 64,
    borderRadius: 32,
    // backgroundColor y shadowColor los pone el TSX
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  // ── MISC ──────────────────────────────────────────────────────────────────
  ContenedorCuadros: {
    padding: 15,
    gap: 15,
  },
});