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
            Contactos de Emergencia{"\n"}
          </Text>

          {/* CARD */}
          
           <Card style={styles.cardPersonalizada}>
                <Text style={styles.textoInfo}>
                    
                    <Text style={{ fontWeight: 'bold' }}>
                    Agrega contactos de emergencia para que reciban tus alertas cuando más lo necesites:{"\n"}
                    </Text>

                    <Text style={{ fontWeight: 'bold' }}>
                    Notificación inmediata.
                    </Text> Tus contactos serán avisados automáticamente cuando actives una alerta, permitiéndoles reaccionar rápidamente.{"\n"}

                    <Text style={{ fontWeight: 'bold' }}>
                    Apoyo en situaciones de riesgo.
                    </Text> Ellos podrán ayudarte, comunicarse contigo o acudir a tu ubicación en caso de emergencia.

                </Text>
            </Card>
            

          {/* BOTONES */}
          <View style={styles.footer}>
            <CustomButton 
              title="Continuar" 
              onPress={() => router.push('/tutorial/mensajes')}
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