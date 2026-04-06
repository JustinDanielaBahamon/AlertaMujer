import React from 'react';
import { View, Text, Image,  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'
import CustomButton from '../../src/components/ui/button/aceptar'; 
 import Card from '../../src/components/ui/card/card';
import {styles} from "./universalStyle"

export default function Bienvenido() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}> {/* para que sirve el SafeAreaVie Asegura que
       el contenido se renderice dentro de los límites seguros del dispositivo */}
      
      {/* EL LOGO */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/imagesAlertaMujer/logoAlertaMujer.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* 2. EL TÍTULO */}
      <Text style={styles.titulo}>
        Conoce más sobre{"\n"}Alerta Mujer
      </Text>

      {/* 3. EL CUADRO DE TEXTO (Usando el  componente Card) */}
      
        <Card style={styles.cardPersonalizada}>
        <Text style={styles.textoInfo}>
          Esta app está diseñada para acompañarte y ayudarte a sentirte más segura en tu día a día. 
          Ofrece herramientas para pedir ayuda, compartir tu ubicación y acceder a información útil, 
          para que nunca te sientas sola.
        </Text>
      </Card>

      {/* 4. EL BOTÓN (Usando tu componente Button) */}
      <View style={styles.footer}>
        <CustomButton 
          title="Continuar" 
          onPress={() => router.push('/tutorial/boton')} 
        />
      </View>

    </SafeAreaView>
);
}

