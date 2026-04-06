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
            Sistema de Notificación {"\n"}
          </Text>

          {/* CARD */}
          
          <Card style={styles.cardPersonalizada}>
                <Text style={styles.textoInfo}>
                    
                    <Text style={{ fontWeight: 'bold' }}>
                    Activa las notificaciones para recibir alertas importantes y mantenerte informada en todo momento:{"\n"}
                    </Text>

                    <Text style={{ fontWeight: 'bold' }}>
                    Avisos en tiempo real.
                    </Text> Recibirás notificaciones cuando se envíe una alerta o cuando tus contactos necesiten tu ayuda.{"\n"}

                    <Text style={{ fontWeight: 'bold' }}>
                    Mayor seguridad.
                    </Text> Las notificaciones te permiten reaccionar rápidamente ante cualquier situación de riesgo.

                </Text>
          </Card>
                        

          {/* BOTONES */}
          <View style={styles.footer}>
            <CustomButton 
              title="Continuar" 
              onPress={() => router.push('/tutorial/boton')}
            />

            <View style={{ marginTop: 2, width: '100%', alignItems: 'center' }}>
              <CustomButton2 
              title="Regresar" 
             
              onPress={() => router.push('/tutorial/boton')} 
            />
            </View>
          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}