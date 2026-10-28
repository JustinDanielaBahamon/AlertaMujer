import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { AppTheme } from "../../../contexts/ThemeContext";

export function getTabScreenOptions(theme: AppTheme): BottomTabNavigationOptions {
  return {
    headerShown: false,
    tabBarActiveTintColor: theme.tabActiveColor,
    tabBarInactiveTintColor: theme.tabInactiveColor,
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.5,
      marginBottom: 6,
      marginTop: 2,
    },
    tabBarIconStyle: {
      marginTop: 6,
    },
    tabBarStyle: {
      backgroundColor: theme.tabBackground,
      borderTopWidth: 0,
      elevation: 10,
      shadowColor: "#7B2CBF",
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      height: 70,
      paddingBottom: 12,
      paddingTop: 4,
    },
  };
}