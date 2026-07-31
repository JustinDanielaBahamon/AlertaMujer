import { View, Text, TouchableOpacity } from "react-native";
import { useIndexViewModel } from "./useIndexViewModel";
import { useLocale } from "../contexts/LocaleContext";

export default function Index() {
  const vm = useIndexViewModel();
  const { t } = useLocale();

  return (
    <View
      style={{
        backgroundColor: "black",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white" }}>{t.indexDemo.mensaje}</Text>

      <TouchableOpacity onPress={vm.entrarComoDemo}>
        <Text
          style={{
            color: "white",
            marginTop: 30,
            borderRadius: 20,
            borderColor: "white",
            borderWidth: 3,
            padding: 10,
            backgroundColor: "purple",
          }}
        >
          {t.indexDemo.btn_demo}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={vm.irAlLogin}>
        <Text
          style={{
            color: "white",
            marginTop: 30,
            borderRadius: 20,
            borderColor: "white",
            borderWidth: 3,
            padding: 10,
            backgroundColor: "purple",
          }}
        >
          {t.indexDemo.btn_login}
        </Text>
      </TouchableOpacity>
    </View>
  );
}