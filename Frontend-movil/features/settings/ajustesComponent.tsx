import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Switch, View, Text, TouchableOpacity } from 'react-native';
import { useAjustesViewModel } from './useAjustesViewModel';
import { obtenerEstilos } from './ajustes.styles';
import { AppMode } from '../../src/contexts/ThemeContext';

export default function AjustesComponent({ navigation }: any) {
  const { theme, toggleTheme, toggleLocale, setMode, obtenerTextoIdioma, obtenerIconoTema } =
    useAjustesViewModel();

  const styles = obtenerEstilos(theme);

  const temasExtra: { id: AppMode; color: string; label: string }[] = [
    { id: 'rosa',    color: '#ee108a', label: 'Rosa' },
    { id: 'vino',    color: '#770736', label: 'Vino' },
    { id: 'Azul',  color: '#0b013b', label: 'Azul' },
    { id: 'magenta', color: '#490449', label: 'Magenta' },
  ];

  const esModoOscuro = theme.mode === 'dark';

  return (
    <View style={styles.container}>

      {/* modo claro y oscuro */}
      <View style={styles.item}>
        <View style={styles.filaSwitch}>
          <Ionicons
            name={esModoOscuro ? 'moon-outline' : 'sunny-outline'}
            size={18}
            color={theme.text}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.textoSwitch, { color: theme.text }]}>
            {obtenerIconoTema().replace(/^[^\s]+\s/, '')}
          </Text>
          <Switch
            value={esModoOscuro}
            onValueChange={toggleTheme}
            trackColor={{ false: '#ccc', true: theme.tabActiveColor }}
            thumbColor="#fff"
            style={{ marginLeft: 'auto' }}
          />
        </View>
      </View>

      {/* temas predeterminados */}
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

      {/* idioma */}
      <TouchableOpacity onPress={toggleLocale} style={styles.item}>
        <View style={styles.filaConChevron}>
          <Ionicons name="globe-outline" size={17} color={theme.text} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.text, flex: 1, fontSize: 14 }}>
            Idioma: {obtenerTextoIdioma()}
          </Text>
          <Ionicons name="chevron-forward" size={15} color={theme.tabActiveColor} />
        </View>
      </TouchableOpacity>

      {/* tutoriales */}
      <TouchableOpacity
        onPress={() => navigation.navigate("TutorialBienvenida")}
        style={[styles.item, { borderBottomWidth: 0 }]}
      >
        <View style={styles.filaConChevron}>
          <Ionicons name="school-outline" size={17} color={theme.text} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.text, flex: 1, fontSize: 14 }}>Ver Tutoriales</Text>
          <Ionicons name="chevron-forward" size={15} color={theme.tabActiveColor} />
        </View>
      </TouchableOpacity>

    </View>
  );
}