import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView } from "expo-video";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import Card from "../../src/components/ui/card/card";
import CustomePermisos from "../../src/components/ui/modalMesanje/permisosMLL";
import { useMensajesTutorialViewModel } from "./useMensajesTutorialViewModel";

// 🆕 acepta vmExterno para compartir la misma instancia con bienvenida
interface Props {
  vmExterno?: ReturnType<typeof useMensajesTutorialViewModel>;
}

export default function MensajesScreen({ vmExterno }: Props) {
  const vmInterno = useMensajesTutorialViewModel();
  const vm = vmExterno ?? vmInterno; // usa el externo si existe

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>

      <View style={[styles.illustrationWrapper, { marginTop: -24, marginBottom: -23 }]}>
        <VideoView
          player={vm.player}
          allowsFullscreen={false}
          nativeControls={false}
          contentFit="contain"
          style={{ height: 212, width: 225 }}
        />
      </View>

      <Card title={"Mensajes y\nLlamadas"} style={cardStyles.card}>
        <View style={{ gap: 1 }}>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● SMS Automático: </Text>
            <Text style={{ fontWeight: "bold" }}>Aviso rápido.</Text>
            {" Se envía un mensaje de texto con tu ubicación exacta a tus contactos."}
          </Text>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Llamada SOS: </Text>
            <Text style={{ fontWeight: "bold" }}>Auxilio directo.</Text>
            {" El sistema inicia una llamada de emergencia a tus personas de confianza."}
          </Text>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Confirmación: </Text>
            <Text style={{ fontWeight: "bold" }}>Seguridad total.</Text>
            {" Recibirás una notificación cuando la ayuda esté en camino."}
          </Text>
        </View>
      </Card>

      <View style={{ flex: 1 }} />

      {/* Banner advertencia */}
      {vm.mostrarAdvertencia && (
        <View style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
          backgroundColor: "rgba(0,0,0,0.5)",
          paddingHorizontal: 24,
        }}>
          <View style={{
            backgroundColor: "#fff3cd",
            borderColor: "#ffc107",
            borderWidth: 1.5,
            borderRadius: 16,
            padding: 20,
            width: "100%",
            gap: 10,
          }}>
            <Text style={{ fontWeight: "bold", color: "#7d5a00", fontSize: 14, textAlign: "center" }}>
              ⚠️ Sin estos permisos las alertas de emergencia no funcionarán correctamente.
            </Text>
            <TouchableOpacity
              onPress={vm.reintentarPermisos}
              style={{ backgroundColor: "#381052", borderRadius: 14, padding: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Activar permisos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={vm.continuarSinPermisos}
              style={{ borderColor: "#858585", borderWidth: 1.5, borderRadius: 14, padding: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#555", fontWeight: "600", fontSize: 14 }}>Continuar sin permisos</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <CustomePermisos
        visible={vm.modalVisible}
        tipo={vm.tipoPermiso}
        onConfirmar={vm.confirmarModal}
        onCancelar={vm.cancelarModal}
      />

    </SafeAreaView>
  );
}