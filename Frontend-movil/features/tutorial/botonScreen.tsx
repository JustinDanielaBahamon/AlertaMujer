import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { styles } from './universalStyle';

import CustomButton from '../../src/components/ui/button/aceptar'; 
import CustomButton2 from '../../src/components/ui/button/cancelar'; 
import Card from '../../src/components/ui/card';

export default function ActivacionTutorial() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.container}>
          
          {/* LOGO */}
          <View style={styles.header}>
            <Image 
              source={require('../../assets/imagesAlertaMujer/logoAlertaMujer.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* TÍTULO */}
          <Text style={styles.titulo}>
            Como funciona el{"\n"}boton
          </Text>

          {/* CARD */}
          <Card style={styles.cardPersonalizada}>
            <Text style={styles.textoInfo}>
              <Text style={{ fontWeight: 'bold' }}>
                El botón de emergencia tiene 3 formas de activarse según tu nivel de peligro:{"\n"}
              </Text>

              <Text style={{ fontWeight: 'bold' }}>
                Toque corto Alerta discreta.
              </Text> Envía un SMS silencioso con tu ubicación a tus contactos.{"\n"}

              <Text style={{ fontWeight: 'bold' }}>
                Doble toque Alerta urgente.
              </Text> Tus contactos reciben notificación y llamada automática.{"\n"}

              <Text style={{ fontWeight: 'bold' }}>
                Mantener presionado Alerta máxima.
              </Text> Inicia grabación, activa sirena y comparte tu ubicación en tiempo real.
            </Text>
          </Card>

          {/* BOTONES */}
          <View style={styles.footer}>
            <CustomButton 
              title="Continuar" 
              onPress={() => router.push('/tutorial/mensaje')}
            />

            <View style={{ marginTop: 2, width: '100%', alignItems: 'center' }}>
              <CustomButton2 
              title="Regresar" 
             
              onPress={() => router.push('/tutorial/bienvenida')} 
            />
            </View>
          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}