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

  icon: {
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
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: "#D946EF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

});