import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

// Importamos lod componentes de la carpeta UI
import CustomButton from '../../src/components/ui/button/aceptar'; 
//import { Card } from '../../src/components/ui/card';

export default function Bienvenido() {
  const router = useRouter();

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

      {/* 2. EL TÍTULO */}
      <Text style={styles.titulo}>
        Conoce más sobre{"\n"}Alerta Mujer
      </Text>

      {/* 3. EL CUADRO DE TEXTO (Usando tu componente Card) */}
      
         {/*<Card style={styles.cardPersonalizada}>
        <Text style={styles.textoInfo}>
          Esta app está diseñada para acompañarte y ayudarte a sentirte más segura en tu día a día. 
          Ofrece herramientas para pedir ayuda, compartir tu ubicación y acceder a información útil, 
          para que nunca te sientas sola.
        </Text>
      </Card>*/}

      {/* 4. EL BOTÓN (Usando tu componente Button) */}
      <View style={styles.footer}>
        <CustomButton 
          title="Continuar" 
          onPress={() => router.push('./login')} 
        />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C8B2D6', // El color lila de fondo
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  header: {
    marginTop: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A4A4A',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  cardPersonalizada: {
    backgroundColor: '#EBE0F3', // Lila clarito del recuadro
    borderRadius: 30,
    padding: 30,
    width: '85%',
    elevation: 5,
  },
  textoInfo: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#000',
    fontWeight: '500',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  }
});