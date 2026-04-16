import React from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import ModalConfirmacion from "@/src/components/ui/modalConfirmacion/confirmacion";
import Card from "../../src/components/ui/card/card";
import CustomButton from "../../src/components/ui/button/aceptar"; // Importamos tu botón de aceptar
import { useUbicacionTutorialViewModel } from "./useUbicacionTutorialViewModel";

export default function UbicacionScreen() {
  const vm = useUbicacionTutorialViewModel();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      
      {/* 1. HEADER CON IMAGEN */}
      <View style={[styles.img, { width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: -40}]}>
        <Image
          source={require("../../assets/imagesAlertaMujer/ScTutorial/ubicacion.png")} 
          style={{ height: 250, width: 270 }} 
          resizeMode="contain"
        />
      </View>

      {/* 2. TARJETA DE CONFIGURACIÓN */}
      <Card 
        title={`Tu Ubicación`}
        style={cardStyles.card}
      >
        <View style={{ gap: 1 }}>
          <Text style={[cardStyles.description, { textAlign: 'left', marginBottom: 5 }]}>
            <Text style={{ fontWeight: "bold", color: "#f5caef" }}>📍 Ayuda local: </Text>
            Selecciona tu ubicación para que los servicios de emergencia sepan dónde encontrarte.
          </Text>

          <Text style={{ color: "#fff", fontSize: 12, marginBottom: 2, marginLeft: 10, fontWeight: '600' }}>
            Departamento
          </Text>
          <View style={{ backgroundColor: "#fff", borderRadius: 15, marginBottom: 10, overflow: "hidden" }}>
            <Picker
              selectedValue={vm.departamento}
              onValueChange={(itemValue) => vm.setDepartamento(itemValue)}
              style={{ height: 50, width: "100%" }}
            >
              <Picker.Item label="Huila" value="Huila" />
            </Picker>
          </View>

          <Text style={{ color: "#fff", fontSize: 12, marginBottom: 2, marginLeft: 10, fontWeight: '600' }}>
            Municipio
          </Text>
          <View style={{ backgroundColor: "#fff", borderRadius: 15, overflow: "hidden" }}>
            <Picker
              selectedValue={vm.municipio}
              onValueChange={(itemValue) => vm.setMunicipio(itemValue)}
              style={{ height: 50, width: "100%" }}
            >
              {vm.municipiosHuila.map((muni) => (
                <Picker.Item key={muni} label={muni} value={muni} />
              ))}
            </Picker>
          </View>
        </View>
        {/* 3. BOTÓN DE ACCIÓN (Guardar/Confirmar) */}
      <View style={{ width: '100%', alignItems: 'center', marginTop: 12 }}>
        <CustomButton 
            title="Guardar Ubicación" 
            onPress={vm.abrirConfirmacion} 
        />
      </View>
      </Card>

      {/* Espaciador para la paginación */}
      <View style={{ flex: 1 }} />

      <ModalConfirmacion
        visible={vm.modalConfirmacionVisible}
        departamento={vm.departamento}
        municipio={vm.municipio}
        onConfirmar={vm.confirmarUbicacion}
        onRegresar={vm.cerrarConfirmacion}
      />
      
    </SafeAreaView>
  );
}