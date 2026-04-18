import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView } from "expo-video";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import Card from "../../src/components/ui/card/card";
import PermisosModal from "../../src/components/ui/modalMesanje/permisosMLL";
import { useSeguridadTutorialViewModel } from "./useSeguridadTutorialViewModel";

// Acepta vmExterno para que bienvenida.tsx conecte pedirPermisos al pager
interface Props {
  vmExterno?: ReturnType<typeof useSeguridadTutorialViewModel>;
}

export default function CamaraMicrofonoTutorial({ vmExterno }: Props) {
  const vmInterno = useSeguridadTutorialViewModel();
  const vm = vmExterno ?? vmInterno;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>

      <View style={[styles.illustrationWrapper, { marginTop: -45, marginBottom: -29 }]}>
        <VideoView
          style={{ height: 200, width: 210 }}
          player={vm.player}
          nativeControls={false}
          contentFit="contain"
          allowsFullscreen={false}
        />
      </View>

      <Card title={`Seguridad en\nVideo y Audio`} style={cardStyles.card}>
        <View style={{ gap: 1 }}>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Registro Clave: </Text>
            <Text style={{ fontWeight: "bold" }}>Evidencia real.</Text> Se inicia captura automática de audio y video para documentar tu entorno.
          </Text>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Respaldo Total: </Text>
            <Text style={{ fontWeight: "bold" }}>Herramienta legal.</Text> Tu voz y entorno son protegidos para dejar constancia de los hechos.
          </Text>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Privacidad: </Text>
            <Text style={{ fontWeight: "bold" }}>Encriptado.</Text> Tus grabaciones se manejan bajo los más altos estándares de seguridad.
          </Text>
        </View>
      </Card>

      <View style={{ flex: 1 }} />

      {/* Banner amarillo si negó cámara o audio */}
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
              ⚠️ Sin cámara y micrófono no podrás grabar evidencia en caso de emergencia.
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

      {/* Primero modal cámara → luego modal audio (mismo componente, cambia tipo) */}
      <PermisosModal
        visible={vm.modalVisible}
        tipo={vm.tipoPermiso}
        onConfirmar={vm.confirmarModal}
        onCancelar={vm.cancelarModal}
      />

    </SafeAreaView>
  );
}