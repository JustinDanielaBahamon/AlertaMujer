import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAjustesViewModel } from './useAjustesViewModel';
import { obtenerEstilos } from './ajustes.styles';
import { AppMode } from '../../src/contexts/ThemeContext';

export default function AjustesComponent({ navigation }: any) {
  const { theme, toggleTheme, toggleLocale, setMode, obtenerTextoIdioma, obtenerIconoTema } =
    useAjustesViewModel();

  const styles = obtenerEstilos(theme);

  const temasExtra: { id: AppMode; color: string; label: string }[] = [
    { id: 'rosa',    color: '#ee108a', label: 'Rosa' },
    { id: 'vino',    color: '#680808', label: 'Vino' },
    { id: 'fucsia',  color: '#0b013b', label: 'Fucsia' },
    { id: 'magenta', color: '#490449', label: 'Magenta' },
  ];

  return (
    <View style={styles.container}>

      {/* MODO CLARO / OSCURO */}
      <TouchableOpacity onPress={toggleTheme} style={styles.item}>
        <Text style={{ color: theme.text, fontWeight: '500' }}>
          {obtenerIconoTema()}
        </Text>
      </TouchableOpacity>

      {/* TEMAS PREDETERMINADOS */}
      <View style={styles.item}>
        <Text style={[styles.tituloSeccion, { color: theme.text }]}>
          Temas Predeterminados
        </Text>
        <View style={styles.filaColores}>
          {temasExtra.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setMode(t.id)}
              accessibilityLabel={`Tema ${t.label}`}
               style={styles.circuloWrapper} 
            >
              <View
                style={[
                  styles.circulo,
                  { backgroundColor: t.color },
                  theme.mode === t.id && styles.circuloActivo,
                ]}
              >
                {theme.mode === t.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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