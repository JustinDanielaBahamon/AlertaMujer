import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

  container: {
    backgroundColor: 'rgb(202,171,222)', // tu color
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
  },

  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },

  actions: {
    flexDirection: "row",
    gap: 15,
  },

  icono: {
    fontSize: 20,
  }

});