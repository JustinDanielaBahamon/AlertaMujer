import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { Picker } from "@react-native-picker/picker";

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import ModalConfirmacion from "@/src/components/ui/modalConfirmacion/confirmacion";

// Botones
import CustomButton from "../../src/components/ui/button/aceptar";
import CustomButton2 from "../../src/components/ui/button/cancelar";
import Card from "../../src/components/ui/card/card";
import { useUbicacionTutorialViewModel } from "./useUbicacionTutorialViewModel";

const { width } = Dimensions.get("window");

export default function UbicacionScreen() {
  const vm = useUbicacionTutorialViewModel();

  return (
    <View style={{ width: width }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center", // 🔥 CENTRA TODO VERTICALMENTE
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container]}>
          
          <Card style={cardStyles.card}>
            <Text style={cardStyles.title}>Tu Ubicación</Text>

            <View style={cardStyles.innerContainer}>
              <Text style={[cardStyles.description, { marginBottom: 15 }]}>
                📍 Selecciona tu ubicación para recibir ayuda local:
              </Text>

              <Text style={{ color: "#fff", fontSize: 12, marginBottom: 5, marginLeft: 10 }}>
                Departamento
              </Text>
              <View style={{ backgroundColor: "#fff", borderRadius: 15, marginBottom: 15, overflow: "hidden" }}>
                <Picker
                  selectedValue={vm.departamento}
                  onValueChange={(itemValue) => vm.setDepartamento(itemValue)}
                  style={{ height: 50, width: "100%" }}
                >
                  <Picker.Item label="Huila" value="Huila" />
                </Picker>
              </View>

              <Text style={{ color: "#fff", fontSize: 12, marginBottom: 5, marginLeft: 10 }}>
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

              {/* BOTONES */}
              <View style={{ marginTop: 20, gap: 5 }}>
                <CustomButton 
                  title="Guardar Ubicación" 
                  onPress={() => vm.abrirConfirmacion()} 
                />
                {/* <CustomButton2 title="Regresar" onPress={() => vm.regresar()} /> */}
              </View>

            </View>
          </Card>

        </View>
      </ScrollView>

      {/* MODAL */}
      <ModalConfirmacion
        visible={vm.modalConfirmacionVisible}
        departamento={vm.departamento}
        municipio={vm.municipio}
        onConfirmar={vm.confirmarUbicacion}
        onRegresar={vm.cerrarConfirmacion}
      />
    </View>
  );
}