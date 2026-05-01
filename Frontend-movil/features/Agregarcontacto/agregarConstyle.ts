import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F2EDF8",
  },

  scrollContent: {
    paddingBottom: 40,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },

  tituloRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  titulo: {
    fontSize: 30,
    fontWeight: "800",
    color: "#4A1D76",
  },
  sectionHeader:{
    alignItems:'center',
    marginBottom: 18,

  },
  subtitulo: {
    fontSize: 14,
    color: "#6E6184",
    marginTop: 4,
  },

  headerIconBadge: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: "#EFE5F8",
    alignItems: "center",
    justifyContent: "center",
  },

  plusBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#8A47C2",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9E0F3",
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

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: "#EDE1F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom:3
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#5B2A89",
  },

  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF8FD",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EDE6F6",
    padding: 11.3,
    marginBottom: 12,
  },

  inputTextWrap: {
    flex: 1,
    marginLeft: 10,
  },

  inputLabel: {
    fontSize: 12,
    color: "#6E6184",
  },

  inputCustom: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F1430",
  },

  contactIcon: {
    marginLeft: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#8A47C2",
    alignItems: "center",
    justifyContent: "center",
  },

  infoBox: {
    flexDirection: "row",
    backgroundColor: "#EFE7F8",
    padding: 12,
    borderRadius: 14,
    marginTop: 6,
  },

  infoText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#4D3A60",
    padding:5
  },
  infoIconAbajo: {
    justifyContent: "center",
  },

  previewTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "700",
    color: "#6A2B9F",
  },

  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    marginBottom: 16,
  },

  previewAvatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#E8DAF7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  previewAvatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#5F2D8F",
  },

  previewBody: {
    flex: 1,
  },

  previewName: {
    fontSize: 17,
    fontWeight: "800",
  },

  previewChip: {
    flexDirection: "row",
    backgroundColor: "#F2EAFB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
    alignSelf: "flex-start",
  },

  previewChipText: {
    marginLeft: 4,
    fontSize: 12,
  },

  previewValue: {
    marginTop: 4,
    fontSize: 14,
  },

  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2FCB8A",
    marginRight: 6,
  },

  statusText: {
    fontSize: 13,
    color: "#2CA975",
  },

  btnGuardarPrincipal: {
    borderRadius: 14,
    height: 52,
    marginBottom: 10,
  },

  buttonInner: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  btnTextWhite: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 6,
  },

  btnCancelarLink: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0D2F0",
  },

  btnTextGray: {
    fontSize: 16,
    color: "#5A2A89",
    fontWeight: "600",
  },

});