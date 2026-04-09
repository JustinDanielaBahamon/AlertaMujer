import React from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../src/components/ui/button/aceptar'; 
import Card from '../../src/components/ui/card/card';

import { styles } from "./universalStyle";
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle";

export default function Bienvenido() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. EL LOGO */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/imagesAlertaMujer/logoAlertaMujer.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* 2. EL CUADRO DE TEXTO (Siguiendo el diseño de tu imagen) */}
      <Card style={cardStyles.card}>
        
        {/* Título: queda fuera del cuadro oscuro, sobre el fondo claro de la Card */}
        <Text style={cardStyles.title}>
          Conoce más sobre{"\n"}Alerta Mujer
        </Text>

        {/* Cuadro Oscuro: envuelve el texto informativo */}
        <View style={cardStyles.innerContainer}>
          <Text style={cardStyles.description}>
            <Text style={{ fontWeight: 'bold' }}>Tu seguridad es nuestra prioridad.{"\n\n"}</Text>
            Esta aplicación nace para ser tu red de apoyo digital, diseñada para cuidarte y darte tranquilidad en cada paso que des. {"\n\n"}
            Con Alerta Mujer, tienes a tu alcance herramientas inmediatas para <Text style={{ fontWeight: 'bold' }}>pedir ayuda, difundir tu ubicación en tiempo real</Text> y conectar con tus seres queridos ante cualquier situación de riesgo. 
          </Text>
        </View>
        
      </Card>

      {/* 3. EL BOTÓN */}
      <View style={[styles.footer, { marginTop: 2 }]}> {/* Cambia el 50 para bajarlo más o menos */}
        <CustomButton 
          title="Continuar" 
          onPress={() => navigation.navigate("TutorialBoton")}
        />
      </View>
    </SafeAreaView>
  );
}