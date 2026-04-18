import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VideoView } from "expo-video";
import Card from "../../src/components/ui/card/card";
import { useContactoTutorialViewModel } from "./useContactoTutorialViewModel";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";

// Reutilizamos el mismo componente de modal de mensajes
// pero le pasamos tipo "contacto" para mostrar ícono y texto diferente
import PermisosModal from "../../src/components/ui/modalMesanje/permisosMLL";

interface Props {
  vmExterno?: ReturnType<typeof useContactoTutorialViewModel>;
}

export default function ContactosScreen({ vmExterno }: Props) {
  const vmInterno = useContactoTutorialViewModel();
  const vm = vmExterno ?? vmInterno;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>

      <View style={[styles.illustrationWrapper, { marginTop: -34, marginBottom: -31 }]}>
        <VideoView
          style={{ height: 200, width: 250 }}
          player={vm.player}
          nativeControls={false}
          contentFit="contain"
          allowsFullscreen={false}
        />
      </View>

      <Card title={`Tu Red de\nApoyo`} style={cardStyles.card}>
        <View style={{ gap: 6 }}>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Confianza: </Text>
            <Text style={{ fontWeight: "bold" }}>Red segura.</Text> Agrega a tus familiares y amigos cercanos para que te cuiden.
          </Text>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Notificaciones: </Text>
            <Text style={{ fontWeight: "bold" }}>Aviso inmediato.</Text> Ellos recibirán tu ubicación exacta cuando actives una alerta.
          </Text>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>● Gestión: </Text>
            <Text style={{ fontWeight: "bold" }}>Siempre conectada.</Text> Puedes gestionar tus contactos en cualquier momento desde tu perfil.
          </Text>
        </View>
      </Card>

      <View style={{ flex: 1 }} />

      {/* Banner amarillo si negó permisos */}
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
              ⚠️ Sin acceso a contactos no podrás elegir personas de confianza para tus alertas.
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

      {/* Reutilizamos el mismo modal de mensajes con tipo "contacto" */}
      <PermisosModal
        visible={vm.modalVisible}
        tipo="contacto"
        onConfirmar={vm.confirmarModal}
        onCancelar={vm.cancelarModal}
      />

    </SafeAreaView>
  );
}