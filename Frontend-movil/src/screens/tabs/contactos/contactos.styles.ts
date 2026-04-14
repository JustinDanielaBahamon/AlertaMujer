/**
 * ESTILOS DE LA PANTALLA DE CONTACTOS
 * 
 * Define todos los estilos visuales de la lista de contactos,
 * incluyendo los nuevos estilos para swipe-to-delete.
 */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Contenedor principal (toda la pantalla)
  ContenedorPrincipal: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  // Cuerpo con padding
  Cuerpo: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Título principal "Mis Contactos de Confianza"
  TituloPagina: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6B3FA0",
    marginBottom: 8,
  },

  // Subtítulo explicativo
  Subtitulo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },

  // Wrapper de la tarjeta (necesario para SwipeListView)
  TarjetaWrapper: {
    marginBottom: 12,
  },

  // Tarjeta individual de contacto
  TarjetaContacto: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3, // Sombra en Android
    shadowColor: "#000", // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Contenedor de la foto de perfil
  ContenedorFoto: {
    position: "relative",
    marginRight: 15,
  },

  // Imagen de perfil circular
  FotoPerfil: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0E0E0",
  },

  // Badge de parentesco (ej: "Hermana", "Madre")
  BadgeRelacion: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#6B3FA0",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  // Texto del badge
  TextoBadge: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },

  // Contenedor de nombre y teléfono
  InfoContacto: {
    flex: 1,
  },

  // Nombre del contacto
  NombreContacto: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },

  // Contenedor de ícono + teléfono
  ContenedorTelefono: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Número de teléfono formateado
  Telefono: {
    fontSize: 14,
    color: "#666",
  },

  // Ícono de lápiz (editar rápido)
  IconoEditar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3E5F5",
    justifyContent: "center",
    alignItems: "center",
  },

  // ESTILOS PARA SWIPE-TO-DELETE

  // Fondo que aparece al deslizar (rojo)
  RowBack: {
    alignItems: "center",
    backgroundColor: "#E53935",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 15,
    borderRadius: 15,
    marginBottom: 12,
  },

  // Botón de borrar que aparece al deslizar
  BotonBorrarSwipe: {
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: "100%",
  },

  // Texto "Eliminar" del swipe
  TextoBorrarSwipe: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  // BOTÓN FLOTANTE "+"

  BotonFlotante: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6B3FA0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});