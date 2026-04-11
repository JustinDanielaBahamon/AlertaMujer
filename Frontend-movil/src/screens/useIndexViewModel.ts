import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/types";
import { useAuth } from "../contexts/AuthContext";

type Nav = NativeStackNavigationProp<AuthStackParamList>;

export function useIndexViewModel() {
  const navigation = useNavigation<Nav>();
  const { signIn } = useAuth();

  const irAlLogin = useCallback(() => {
    navigation.navigate("Login");
  }, [navigation]);

  const entrarComoDemo = useCallback(() => {
    signIn(
      { id: 0, nombre: "Demo", correo: "demo@alertamujer.app" },
      { initialMainRoute: "DrawerHome" },
    );
  }, [signIn]);

  return { irAlLogin, entrarComoDemo };
}
