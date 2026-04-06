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
            Ubicación Automatica{"\n"}
          </Text>

          {/* CARD */}
          
          <Card style={styles.cardPersonalizada}>
                <Text style={styles.textoInfo}>
                    
                    <Text style={{ fontWeight: 'bold' }}>
                    Cuando activas una alerta, la app comparte tu ubicación automáticamente en tiempo real para que tus contactos de emergencia sepan dónde estás en todo momento:{"\n"}
                    </Text>

                    <Text style={{ fontWeight: 'bold' }}>
                    Ubicación en tiempo real.
                    </Text> Tus contactos podrán ver tu ubicación exacta y seguir tus movimientos mientras la alerta esté activa, facilitando que puedan encontrarte rápidamente.{"\n"}

                    <Text style={{ fontWeight: 'bold' }}>
                    Acceso inmediato.
                    </Text> La ubicación se envía de forma automática, sin que tengas que hacer nada más, incluso en situaciones de riesgo o presión.

                </Text>
            </Card>
            

          {/* BOTONES */}
          <View style={styles.footer}>
            <CustomButton 
              title="Continuar" 
              onPress={() => router.push('/tutorial/contacto')}
            />

            <View style={{ marginTop: 2, width: '100%', alignItems: 'center' }}>
              <CustomButton2 
              title="Regresar" 
             
              onPress={() => router.push('/tutorial/ubicacion')} 
            />
            </View>
          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}