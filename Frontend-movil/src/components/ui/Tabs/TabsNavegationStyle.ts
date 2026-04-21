import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { AppTheme } from "../../../contexts/ThemeContext";

export function getTabScreenOptions(theme: AppTheme): BottomTabNavigationOptions {
  return {
    headerShown: false,
    tabBarActiveTintColor: theme.tabActiveColor,
    tabBarInactiveTintColor: theme.tabInactiveColor,
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 5,
    },
    tabBarStyle: {
      backgroundColor: theme.tabBackground,
      borderTopWidth: 0,
      position: "relative",
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
  };
}