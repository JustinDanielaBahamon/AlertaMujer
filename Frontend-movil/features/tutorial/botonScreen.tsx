import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { styles } from './universalStyle';
import { styles as cardStyles } from "../../src/components/ui/card/cardStyle"; // Importante

import CustomButton from '../../src/components/ui/button/aceptar'; 
import CustomButton2 from '../../src/components/ui/button/cancelar'; 
import Card from '../../src/components/ui/card/card';

export default function ActivacionTutorial() {
  const navigation = useNavigation<any>();

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

          {/* CARD CON DISEÑO MEJORADO */}
          <Card style={cardStyles.card}>
            {/* Título arriba, fuera del cuadro oscuro */}
            <Text style={cardStyles.title}>
              Cómo funciona el{"\n"}botón
            </Text>

            {/* Cuadro Morado Oscuro */}
            <View style={cardStyles.innerContainer}>
              <Text style={cardStyles.description}>
                <Text style={{ fontWeight: 'bold' }}>
                  El botón de emergencia tiene 3 formas de activarse:{"\n\n"}
                </Text>

                <Text style={{ fontWeight: 'bold', color: '#fffb00' }}>● Toque corto: </Text>
                <Text style={{ fontWeight: 'bold' }}>Alerta discreta.</Text> Envía un SMS silencioso con tu ubicación.{"\n\n"}

                <Text style={{ fontWeight: 'bold', color: '#FFD700' }}>● Doble toque: </Text>
                <Text style={{ fontWeight: 'bold' }}>Alerta urgente.</Text> Tus contactos reciben notificación y llamada.{"\n\n"}

                <Text style={{ fontWeight: 'bold', color: '#FFD700' }}>● Mantener: </Text>
                <Text style={{ fontWeight: 'bold' }}>Alerta máxima.</Text> Inicia grabación, sirena y ubicación en tiempo real.
              </Text>
            </View>
          </Card>

          {/* ESPACIADOR FLEXIBLE */}
          <View style={{ flex: 1 }} />

          {/* BOTONES CON MARGEN INFERIOR CONTROLADO */}
          <View style={[styles.footer, { paddingBottom: 40 }]}>
            <CustomButton 
              title="Continuar" 
              onPress={() => navigation.navigate("TutorialMensaje")}
            />

            <View style={{ marginTop: 5, width: '100%', alignItems: 'center' }}>
              <CustomButton2 
                title="Regresar" 
                onPress={() => navigation.navigate("TutorialBienvenida")}
              />
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}