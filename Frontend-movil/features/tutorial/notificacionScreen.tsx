import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView } from "expo-video";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import Card from "../../src/components/ui/card/card";
import PermisosModal from "../../src/components/ui/modalMesanje/permisosMLL";
import { useNotificacionTutorialViewModel } from "./useNotificacionTutorialViewModel";

interface Props {
  vmExterno?: ReturnType<typeof useNotificacionTutorialViewModel>;
}

export default function NotificacionTutorial({ vmExterno }: Props) {
  const vmInterno = useNotificacionTutorialViewModel();
  const vm = vmExterno ?? vmInterno;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>

      <View style={[styles.illustrationWrapper, { marginTop: -60, marginBottom: -50 }]}>
        <VideoView
          style={{ height: 150, width: 200 }}
          player={vm.player}
          nativeControls={false}
          contentFit="contain"
          allowsFullscreen={false}
        />
      </View>

      <Card title={`Mantente\nInformada`} style={cardStyles.card}>
        <View style={{ gap: 5 }}>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Alertas SOS: </Text>
            <Text style={{ fontWeight: "bold" }}>Tiempo real.</Text> Recibirás avisos críticos incluso si la aplicación no está abierta.
          </Text>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Red de Apoyo: </Text>
            <Text style={{ fontWeight: "bold" }}>Seguridad activa.</Text> Mantente siempre conectada para ayudar o ser ayudada sin demora.
          </Text>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Rapidez: </Text>
            <Text style={{ fontWeight: "bold" }}>Comunicación.</Text> La notificación inmediata es la herramienta más poderosa para tu protección.
          </Text>
        </View>
      </Card>

      {/* Botón Finalizar — usa abrirModal en lugar de pedirPermisos */}
      <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
        <TouchableOpacity
          onPress={vm.abrirModal}
          style={{
            backgroundColor: "#381052",
            borderRadius: 20,
            paddingVertical: 14,
            paddingHorizontal: 40,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
            Finalizar y Activar
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      {/* Banner si negó notificaciones */}
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
              ⚠️ Sin notificaciones no recibirás avisos cuando tu red de apoyo responda.
            </Text>
            <TouchableOpacity
              onPress={vm.reintentarPermisos}
              style={{ backgroundColor: "#381052", borderRadius: 14, padding: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Activar notificaciones</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={vm.continuarSinPermisos}
              style={{ borderColor: "#858585", borderWidth: 1.5, borderRadius: 14, padding: 12, alignItems: "center" }}
            >
              <Text style={{ color: "#555", fontWeight: "600", fontSize: 14 }}>Ir al inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <PermisosModal
        visible={vm.modalVisible}
        tipo="notificacion"
        onConfirmar={vm.confirmarModal}
        onCancelar={vm.cancelarModal}
      />

    </SafeAreaView>
  );
}