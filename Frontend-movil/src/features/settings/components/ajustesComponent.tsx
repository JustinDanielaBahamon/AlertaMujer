import { Ionicons } from '@expo/vector-icons';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import ModalIdioma from '../../../components/ui/modalIdioma/modalIdioma';
import { AppMode } from '../../../contexts/ThemeContext';
import { useLocale } from '../../../contexts/LocaleContext';
import { obtenerEstilos } from '../styles/ajustes.styles';
import { OPCIONES_IDIOMA, useAjustesViewModel } from '../viewModel/useAjustesViewModel';

export default function AjustesComponent({ navigation }: any) {
  const {
    theme,
    toggleTheme,
    setMode,
    locale,
    modalIdiomaVisible,
    abrirModalIdioma,
    cerrarModalIdioma,
    seleccionarIdioma,
    obtenerTextoIdioma,
    obtenerIconoTema,
  } = useAjustesViewModel();

  const { t } = useLocale();

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
          {t.ajustes.temas}
        </Text>
        <View style={styles.filaColores}>
          {temasExtra.map((tema) => (
            <TouchableOpacity
              key={tema.id}
              onPress={() => setMode(tema.id)}
              accessibilityLabel={`${t.ajustes.tema} ${tema.label}`}
              style={styles.circuloWrapper}
            >
              <View
                style={[
                  styles.circulo,
                  { backgroundColor: tema.color },
                  theme.mode === tema.id && styles.circuloActivo,
                ]}
              >
                {theme.mode === tema.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* idioma */}
      <TouchableOpacity onPress={abrirModalIdioma} style={styles.item}>
        <View style={styles.filaConChevron}>
          <Ionicons name="globe-outline" size={17} color={theme.text} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.text, flex: 1, fontSize: 14 }}>
            {t.ajustes.idioma}: {obtenerTextoIdioma()}
          </Text>
          <Ionicons name="chevron-forward" size={15} color={theme.tabActiveColor} />
        </View>
      </TouchableOpacity>

      {/* metodos de activacion */}
      <TouchableOpacity
        onPress={() => navigation.navigate("MetodosActivacion")}
        style={styles.item}
      >
        <View style={styles.filaConChevron}>
          <Ionicons name="flash-outline" size={17} color={theme.text} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.text, flex: 1, fontSize: 14 }}>{t.ajustes.metodos_activacion}</Text>
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
          <Text style={{ color: theme.text, flex: 1, fontSize: 14 }}>{t.ajustes.ver_tutoriales}</Text>
          <Ionicons name="chevron-forward" size={15} color={theme.tabActiveColor} />
        </View>
      </TouchableOpacity>

      {/* modal de seleccion de idioma */}
      <ModalIdioma
        visible={modalIdiomaVisible}
        locale={locale}
        opciones={OPCIONES_IDIOMA}
        theme={theme}
        onSeleccionar={seleccionarIdioma}
        onCerrar={cerrarModalIdioma}
      />

    </View>
  );
}