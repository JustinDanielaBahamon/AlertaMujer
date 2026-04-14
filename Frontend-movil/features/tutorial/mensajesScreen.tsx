import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import Card from "../../src/components/ui/card/card";

// Componentes y lógica de permisos
import CustomePermisos from "../../src/components/ui/modalMesanje/permisosMLL";
import { useMensajesTutorialViewModel } from "./useMensajesTutorialViewModel";

const { width } = Dimensions.get("window");

export default function MensajesScreen() {
  const vm = useMensajesTutorialViewModel();

  return (
    <View style={{ width: width }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* ELIMINADO EL HEADER PORQUE YA ESTÁ EN EL PADRE */}

          <Card style={cardStyles.card}>
            <Text style={cardStyles.title}>
              Sistema de mensajes{"\n"}y llamadas
            </Text>

            <View style={cardStyles.innerContainer}>
              <Text style={cardStyles.description}>
                <Text style={{ fontWeight: "bold" }}>
                  Cuando activas una alerta, el sistema contacta a tus personas de confianza automáticamente:{"\n\n"}
                </Text>

                <Text style={{ fontWeight: "bold" }}>📩 Mensaje automático:</Text>
                {"\n"}Se envía un SMS con tu ubicación exacta.{"\n\n"}

                <Text style={{ fontWeight: "bold" }}>📞 Llamada de emergencia:</Text>
                {"\n"}Se realiza una llamada de auxilio a tus contactos.
              </Text>
            </View>
          </Card>

          {/* ELIMINADOS LOS PUNTOS MANUALES PORQUE EL PADRE LOS MANEJA DINÁMICAMENTE */}

          <View style={{ flex: 1 }} />
        </View>
      </ScrollView>

      {/* MODAL DE PERMISOS: Se queda aquí, fuera del scroll para que flote sobre la pantalla */}
      <CustomePermisos
        visible={vm.modalVisible}
        tipo={vm.tipoPermiso}
        onConfirmar={vm.confirmarModal}
        onCancelar={vm.cancelarModal}
      />
    </View>
  );
}