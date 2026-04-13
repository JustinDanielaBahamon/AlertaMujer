import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// IMPORTAMOS EL VIEWMODEL
import { useAjustesViewModel } from './useAjustesViewModel';
import { styles } from './ajustes.styles';

export default function AjustesComponent({ navigation }: any) {
  // EXTRAEMOS LO NECESARIO DEL VIEWMODEL
  const { 
    theme, 
    toggleTheme, 
    toggleLocale, 
    obtenerTextoIdioma, 
    obtenerIconoTema 
  } = useAjustesViewModel();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleTheme} style={styles.item}>
        <Text style={{ color: theme.text }}>{obtenerIconoTema()}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleLocale} style={styles.item}>
        <Text style={{ color: theme.text }}>🌍 Idioma: {obtenerTextoIdioma()}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => navigation.navigate("TutorialBienvenida")} 
        style={styles.item}
      >
        <Text style={{ color: theme.text }}>📖 Ver Tutoriales</Text>
      </TouchableOpacity>
    </View>
  );
}



