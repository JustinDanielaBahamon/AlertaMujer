import { createDrawerNavigator } from "@react-navigation/drawer";
import TabNavigator from "./TabNavigator";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Inicio" component={TabNavigator} />
    </Drawer.Navigator>
  );
}