
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";

export const themeColors = {
  active: '#45046b',     // <-- Color del icono y texto cuando estás en esa pantalla
  inactive: '#fefeff',   // <-- Color de los iconos y textos que NO están seleccionados
  background: 'rgb(202,171,222)', // <-- El color de fondo de toda la barra de abajo
  shadow: '#000',        // <-- Color de la sombra (usualmente negro o una versión oscura del fondo)
};

export const tabScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarActiveTintColor: themeColors.active,
  tabBarInactiveTintColor: themeColors.inactive,
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5, // Ajusta el texto para que no quede pegado al borde
  },
  tabBarStyle: {
    backgroundColor: themeColors.background,
    borderTopWidth: 0,
    // 1. QUITAMOS 'absolute' para que se pegue al fondo naturalmente
    position: 'relative', 
    // 2. QUITAMOS los Radius para que sea cuadrada
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    elevation: 10,
    shadowColor: themeColors.shadow,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
};