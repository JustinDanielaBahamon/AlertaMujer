import { View, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { styles } from "./inicio.styles";
import { MaterialIcons } from "@expo/vector-icons";
import { useInicioViewModel } from "../../../../features/inicio/useInicioViewModel";

export default function Inicio() {
  const vm = useInicioViewModel();

  return (
    <View style={styles.container}>
      
      <View style={styles.containerUbicacion}>
        <MaterialIcons name="location-on" size={24} color="#7B2CBF" />
        <Text style={styles.iconoUbicacion}></Text>

        <View style={styles.infoUbicacion}>
          <Text style={styles.tituloUbicacion}>Ubicación actual</Text>
          <Text style={styles.textoUbicacion} numberOfLines={1}>
            {vm.ubicacionNombre}
          </Text>
        </View>

        <TouchableOpacity onPress={vm.obtenerUbicacion} disabled={vm.cargando}>
          {vm.cargando ? (
            <ActivityIndicator size="small" color="#7B2CBF" />
          ) : (
            <MaterialIcons name="refresh" size={24} color="#7B2CBF" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.centerSection}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={vm.onPressInBoton}
          onPressOut={vm.onPressOutBoton}
          onPress={vm.activarAlerta}
          style={[
            styles.botonAlerta,
            {
              transform: [{ scale: vm.pressed ? 0.92 : 1 }],
              opacity: vm.pressed ? 0.85 : 1,
              shadowOffset: {
                width: 0,
                height: vm.pressed ? 2 : 10,
              },
              shadowOpacity: vm.pressed ? 0.2 : 0.5,
              elevation: vm.pressed ? 4 : 12,
            },
          ]}
        >
          <Image
            source={require("../../../../assets/imagesAlertaMujer/ScInicio/boton2.png")}
            style={styles.imagen}
          />
        </TouchableOpacity>
        <Text style={styles.textoAlerta}>Presiona en caso de Emergencia</Text>
      </View>
    </View>
  );
}
