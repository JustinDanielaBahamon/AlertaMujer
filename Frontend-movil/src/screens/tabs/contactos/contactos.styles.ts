import { StyleSheet } from "react-native";



export const styles = StyleSheet.create({

  // --- CONTENEDORES PRINCIPALES ---

  ContenedorPrincipal: {

    flex: 1,

    backgroundColor: "#F8F9FE", 

    // Un gris muy claro tirando a azulado para resaltar las cards blancas

  },

  Header: {

    marginBottom: 0,

  },

  Gradiente: {

    paddingTop: 0.1,

    paddingHorizontal: 25,

    paddingBottom: 25,

    borderBottomLeftRadius: 45,

    borderBottomRightRadius: 45,

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

    fontSize: 14,

    color: "rgba(255, 255, 255, 0.8)",

    marginTop: 8,

    lineHeight: 20,

    width: 220,

  },

  Cuerpo: {

    flex: 1,

    paddingHorizontal: 20,

    marginTop: 10,

  },



  // --- FILA DE CONTEO (Tus contactos) ---

  Conteo: {

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 10,

    marginLeft:20,

    marginTop:10

  },

  Cousser: {

    backgroundColor: "#F3E5F5",

    borderRadius: 12,

    padding: 8,

    marginRight: 10,

  },



  // --- TARJETA DE CONTACTO (CARD PRINCIPAL) ---

  TarjetaWrapper: {

    marginBottom: 16,marginLeft:8 ,marginRight:8  },

  TarjetaContacto: {

    backgroundColor: "#FFFFFF",

    borderRadius: 25,

    padding: 16,

    // Sombras

    elevation: 4,

    shadowColor: "#000",

    shadowOffset: { width: 0, height: 4 },

    shadowOpacity: 0.08,

    shadowRadius: 10,

    marginBottom:20

  },



  // SECCIÓN SUPERIOR: Foto, Info y Editar

  SeccionSuperior: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",

    marginBottom: 15,

  },

  ContenedorFoto: {

    position: "relative",

  },

  FotoPerfil: {

    width: 80,

    height: 80,

    borderRadius: 40,

    borderWidth: 2,

    borderColor: "#7B1FA2", // El aro morado

  },

  PuntoEstado: {

    position: "absolute",

    bottom: 5,

    right: 2,

    width: 18,

    height: 18,

    borderRadius: 9,

    backgroundColor: "#28a745", // Verde disponible

    borderWidth: 3,

    borderColor: "#FFFFFF",

  },

  InfoContacto: {

    flex: 1,

    paddingLeft: 15,

  },

  NombreContacto: {

    fontSize: 19,

    fontWeight: "bold",

    color: "#333",

  },

  BadgeRelacion: {

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#F3E5F5",

    paddingHorizontal: 10,

    paddingVertical: 4,

    borderRadius: 12,

    marginVertical: 5,

    alignSelf: "flex-start",

  },

  TextoBadge: {

    color: "#7B1FA2",

    fontSize: 12,

    fontWeight: "bold",

    marginLeft: 4,

  },

  ContenedorTelefono: {

    flexDirection: "row",

    alignItems: "center",

    marginTop: 2,

  },

  Telefono: {

    fontSize: 14,

    color: "#777",

  },

  IconosSuperiores: {

    flexDirection: "row",

  },

  BotonIconoSmall: {

    backgroundColor: "#F5F5F5",

    padding: 8,

    borderRadius: 10,

    marginLeft: 8,

  },



  // SECCIÓN ACCIONES: Llamar, WhatsApp, Ubicación

  SeccionAcciones: {

    flexDirection: "row",

    justifyContent: "space-between",

    borderTopWidth: 1,

    borderTopColor: "#F0F0F0",

    paddingTop: 15,

    paddingHorizontal: 10,

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

  },

  TextoAccion: {

    fontSize: 11,

    color: "#666",

    fontWeight: "500",

  },



  // --- FOOTER: ¿QUIERES AGREGAR MÁS? ---

  TarjetaSugerencia: {

    backgroundColor: "#F9F7FF",

    borderRadius: 20,

    padding: 20,

    flexDirection: "row",

    alignItems: "center",

    borderStyle: "dashed", // Borde punteado

    borderWidth: 1.5,

    borderColor: "#D1C4E9",

    marginTop: 10,

    marginBottom: 100, // Espacio para que el botón flotante no tape nada

    margin:10

  },

  CirculoDashed: {

    width: 60,

    height: 60,

    borderRadius: 30,

    borderWidth: 1.5,

    borderStyle: "dashed",

    borderColor: "#B39DDB",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 15,

  },

  BotonAgregarSmall: {

    backgroundColor: "#7B1FA2",

    paddingHorizontal: 15,

    paddingVertical: 10,

    borderRadius: 12,

    elevation: 2,

  },



  // --- BOTÓN FLOTANTE Y SWIPE ---

  BotonFlotante: {

    position: "absolute",

    bottom: 30,

    right: 13,

    width: 65,

    height: 65,

    borderRadius: 32.5,

    backgroundColor: "#6B3FA0",

    justifyContent: "center",

    alignItems: "center",

    elevation: 8,

    shadowColor: "#6B3FA0",

    shadowOffset: { width: 0, height: 4 },

    shadowOpacity: 0.4,

    shadowRadius: 8,

  },

  RowBack: {

    alignItems: "center",

    backgroundColor: "#FF5252",

    flex: 1,

    flexDirection: "row",

    justifyContent: "flex-end",

    paddingRight: 20,

    borderRadius: 25,

    marginBottom: 40,

    marginLeft:8,

    marginRight:8

  },

  BotonBorrarSwipe: {

    alignItems: "center",

    justifyContent: "center",

    width: 80,

    height: "100%",

  },

  // ESTA ES LA QUE FALTABA PARA EL ERROR TS(2551)

  TextoBorrarSwipe: {

    color: "#FFF",

    fontSize: 12,

    fontWeight: "bold",

    marginTop: 4,

  },ContenedorCuadros: {

    padding: 15,

    gap: 15,

  },

  ContenedorBuscador: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#F5F5F5',

    borderRadius: 12,

    paddingHorizontal: 12,

    paddingVertical: 10,

    marginHorizontal: 15,

    marginTop: 0 ,

    marginBottom: 7,

    gap: 8,

},

InputBuscador: {

    flex: 1,

    fontSize: 14,

    color: '#333',

    padding: 0,  // reset del padding por defecto en Android

},

});