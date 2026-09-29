import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

  container: {
    backgroundColor: 'rgb(202,171,222)', // tu color
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  logo: {
    width: 80,
    height: 64,
    resizeMode: 'contain',
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  icono: {
    fontSize: 20,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  menuIcon: {
    fontSize: 24,
  },

});