import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker'; // Asegúrate de instalarlo o usar un modal

import { styles } from './universalStyle';
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";
import ModalConfirmacion from '@/src/components/ui/modalConfirmacion/confirmacion';

import CustomButton from '../../src/components/ui/button/aceptar'; 
import CustomButton2 from '../../src/components/ui/button/cancelar'; 
import Card from '../../src/components/ui/card/card';

export default function UbicacionScreen() {
  const router = useRouter();
  
  // Datos del Huila
  const [departamento, setDepartamento] = useState('Huila'); 
  const [municipio, setMunicipio] = useState('Neiva'); 
  const [modalConfirmacionVisible, setModalConfirmacionVisible] = useState(false);

  // Lista simplificada de municipios del Huila
  const municipiosHuila = [
    "Neiva", "Pitalito", "Garzón", "San Agustín", "Gigante", 
    "Campoalegre", "Rivera", "La Plata", "Palermo", "Isnos"
  ];

  const handleContinuarPantalla = () => {
    setModalConfirmacionVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          
          {/* LOGO */}
          <View style={styles.header}>
            <Image 
              source={require('../../assets/imagesAlertaMujer/logoAlertaMujer.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* CARD CON DISEÑO UNIFICADO */}
          <Card style={cardStyles.card}>
            <Text style={cardStyles.title}>Tu Ubicación</Text>

            <View style={cardStyles.innerContainer}>
              <Text style={[cardStyles.description, { marginBottom: 15 }]}>
                📍 Selecciona tu ubicación para recibir ayuda local:
              </Text>

              {/* Selector de Departamento */}
              <Text style={{ color: '#fff', fontSize: 12, marginBottom: 5, marginLeft: 10 }}>Departamento</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 15, marginBottom: 15, overflow: 'hidden' }}>
                <Picker
                  selectedValue={departamento}
                  onValueChange={(itemValue) => setDepartamento(itemValue)}
                  style={{ height: 50, width: '100%' }}
                >
                  <Picker.Item label="Huila" value="Huila" />
                </Picker>
              </View>

              {/* Selector de Municipio */}
              <Text style={{ color: '#fff', fontSize: 12, marginBottom: 5, marginLeft: 10 }}>Municipio</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden' }}>
                <Picker
                  selectedValue={municipio}
                  onValueChange={(itemValue) => setMunicipio(itemValue)}
                  style={{ height: 50, width: '100%' }}
                >
                  {municipiosHuila.map((muni) => (
                    <Picker.Item key={muni} label={muni} value={muni} />
                  ))}
                </Picker>
              </View>
            </View>
          </Card>

          <View style={{ flex: 1 }} />

          {/* BOTONES */}
          <View style={[styles.footer, { paddingBottom: 40 }]}>
            <CustomButton title="Continuar" onPress={handleContinuarPantalla} />
            <View style={{ marginTop: 10, width: '100%', alignItems: 'center' }}>
              <CustomButton2 title="Regresar" onPress={() => router.back()} />
            </View>
          </View>

        </View>
      </ScrollView>

      <ModalConfirmacion 
        visible={modalConfirmacionVisible}
        departamento={departamento}
        municipio={municipio}
        onConfirmar={() => {
            setModalConfirmacionVisible(false);
            router.push('/tutorial/contactos');
        }}
        onRegresar={() => setModalConfirmacionVisible(false)}
      />
    </SafeAreaView>
  );
}