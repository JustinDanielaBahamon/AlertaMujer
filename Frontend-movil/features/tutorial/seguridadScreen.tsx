import React from 'react';
import { View, Text, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera } from 'expo-camera'; // npx expo install expo-camera
import { Audio } from 'expo-av';     // npx expo install expo-av

// Estilos
import { styles } from './universalStyle';
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";

// Componentes
import CustomButton from '../../src/components/ui/button/aceptar'; 
import CustomButton2 from '../../src/components/ui/button/cancelar'; 
import Card from '../../src/components/ui/card/card';

export default function CamaraMicrofonoTutorial() {
  const router = useRouter();

  const handleSolicitarPermisos = async () => {
    // 1. Solicitar Cámara
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    
    // 2. Solicitar Micrófono (Audio)
    const { status: audioStatus } = await Audio.requestPermissionsAsync();

    if (cameraStatus === 'granted' && audioStatus === 'granted') {
      // Si ambos son concedidos, vamos a notificaciones
      router.push('/tutorial/notificacion');
    } else {
      // Si alguno falta, explicamos la importancia
      Alert.alert(
        "Permisos necesarios",
        "Para tu protección, necesitamos acceder a la cámara y micrófono. Esto permite generar evidencia en video si te encuentras en peligro.",
        [{ text: "Reintentar", onPress: () => handleSolicitarPermisos() }, { text: "Cancelar", style: "cancel" }]
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <Image 
              source={require('../../assets/imagesAlertaMujer/logoAlertaMujer.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Card style={cardStyles.card}>
            <Text style={cardStyles.title}>
              Seguridad en{"\n"}Video y Audio
            </Text>

            <View style={cardStyles.innerContainer}>
              <Text style={cardStyles.description}>
                <Text style={{ fontWeight: 'bold' }}>Tu voz y tu entorno son evidencia clave.{"\n\n"}</Text>

                Al activar una alerta, Alerta Mujer utiliza estos sensores para que <Text style={{ fontWeight: 'bold' }}>nunca estés en silencio.</Text>{"\n\n"}

                <Text style={{ fontWeight: 'bold' }}>📸 Registro de evidencia:</Text> 
                {"\n"}Se inicia una captura automática de audio y video para documentar todo lo que ocurre en tiempo real.{"\n\n"}

                <Text style={{ fontWeight: 'bold' }}>🛡️ Respaldo total:</Text> 
                {"\n"}Esta información se convierte en una herramienta legal poderosa para protegerte y dejar constancia de los hechos.
              </Text>
            </View>
          </Card>

          <View style={{ flex: 1 }} />

          {/* BOTONES */}
          <View style={[styles.footer, { paddingBottom: 40 }]}>
            <CustomButton 
              title="Permitir y Continuar" 
              onPress={handleSolicitarPermisos}
            />

            <View style={{ marginTop: 10, width: '100%', alignItems: 'center' }}>
              <CustomButton2 
                title="Regresar" 
                onPress={() => router.push('/tutorial/contactos')} 
              />
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}