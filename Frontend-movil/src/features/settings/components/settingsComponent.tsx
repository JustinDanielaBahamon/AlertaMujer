import { Ionicons } from '@expo/vector-icons';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import LanguageModal from '../../../components/ui/languageModal/languageModal';
import { AppMode } from '../../../contexts/ThemeContext';
import { useLocale } from '../../../contexts/LocaleContext';
import { getStyles } from '../styles/settings.styles';
import { LANGUAGE_OPTIONS, useSettingsViewModel } from '../viewModel/useSettingsViewModel';

export default function SettingsComponent({ navigation }: any) {
  const {
    theme,
    toggleTheme,
    setMode,
    locale,
    languageModalVisible: languageModalVisible,
    openLanguageModal: openLanguageModal,
    closeLanguageModal: closeLanguageModal,
    selectLanguage: selectLanguage,
    getLanguageText: getLanguageText,
    getThemeIcon: getThemeIcon,
  } = useSettingsViewModel();

  const { t } = useLocale();

  const styles = getStyles(theme);

  const extraThemes: { id: AppMode; color: string; label: string }[] = [
    { id: 'rosa',    color: '#ee108a', label: 'Rosa' },
    { id: 'vino',    color: '#770736', label: 'Vino' },
    { id: 'Azul',  color: '#0b013b', label: 'Azul' },
    { id: 'magenta', color: '#490449', label: 'Magenta' },
  ];

  const isDarkMode = theme.mode === 'dark';

  return (
    <View style={styles.container}>

      {/* modo claro y oscuro */}
      <View style={styles.item}>
        <View style={styles.switchRow}>
          <Ionicons
            name={isDarkMode ? 'moon-outline' : 'sunny-outline'}
            size={18}
            color={theme.text}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.switchText, { color: theme.text }]}>
            {getThemeIcon().replace(/^[^\s]+\s/, '')}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#ccc', true: theme.tabActiveColor }}
            thumbColor="#fff"
            style={{ marginLeft: 'auto' }}
          />
        </View>
      </View>

      {/* temas predeterminados */}
      <View style={styles.item}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t.ajustes.temas}
        </Text>
        <View style={styles.colorsRow}>
          {extraThemes.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => setMode(option.id)}
              accessibilityLabel={`${t.ajustes.tema} ${option.label}`}
              style={styles.circleWrapper}
            >
              <View
                style={[
                  styles.circle,
                  { backgroundColor: option.color },
                  theme.mode === option.id && styles.activeCircle,
                ]}
              >
                {theme.mode === option.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* idioma */}
      <TouchableOpacity onPress={openLanguageModal} style={styles.item}>
        <View style={styles.chevronRow}>
          <Ionicons name="globe-outline" size={17} color={theme.text} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.text, flex: 1, fontSize: 14 }}>{t.ajustes.idioma}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: 12,
              backgroundColor: theme.tabActiveColor + '22',
              marginRight: 4,
            }}
          >
            <Text style={{ color: theme.tabActiveColor, fontSize: 12, fontWeight: '800' }}>
              {locale.toUpperCase()}
            </Text>
            <Text style={{ color: theme.text, fontSize: 12 }}>{getLanguageText()}</Text>
          </View>
          <Ionicons name="chevron-forward" size={15} color={theme.tabActiveColor} />
        </View>
      </TouchableOpacity>

      {/* metodos de activacion */}
      <TouchableOpacity
        onPress={() => navigation.navigate("ActivationMethods")}
        style={styles.item}
      >
        <View style={styles.chevronRow}>
          <Ionicons name="flash-outline" size={17} color={theme.text} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.text, flex: 1, fontSize: 14 }}>{t.ajustes.metodos_activacion}</Text>
          <Ionicons name="chevron-forward" size={15} color={theme.tabActiveColor} />
        </View>
      </TouchableOpacity>

      {/* notificaciones */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Notifications")}
        style={styles.item}
      >
        <View style={styles.chevronRow}>
          <Ionicons name="notifications-outline" size={17} color={theme.text} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.text, flex: 1, fontSize: 14 }}>{t.ajustes.notificaciones}</Text>
          <Ionicons name="chevron-forward" size={15} color={theme.tabActiveColor} />
        </View>
      </TouchableOpacity>

      {/* acerca de */}
      <TouchableOpacity
        onPress={() => navigation.navigate("About")}
        style={styles.item}
      >
        <View style={styles.chevronRow}>
          <Ionicons name="information-circle-outline" size={17} color={theme.text} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.text, flex: 1, fontSize: 14 }}>{t.ajustes.acerca_de}</Text>
          <Ionicons name="chevron-forward" size={15} color={theme.tabActiveColor} />
        </View>
      </TouchableOpacity>

      {/* tutoriales */}
      <TouchableOpacity
        onPress={() => navigation.navigate("WelcomeTutorial")}
        style={[styles.item, { borderBottomWidth: 0 }]}
      >
        <View style={styles.chevronRow}>
          <Ionicons name="school-outline" size={17} color={theme.text} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.text, flex: 1, fontSize: 14 }}>{t.ajustes.ver_tutoriales}</Text>
          <Ionicons name="chevron-forward" size={15} color={theme.tabActiveColor} />
        </View>
      </TouchableOpacity>

      {/* modal de seleccion de idioma */}
      <LanguageModal
        visible={languageModalVisible}
        locale={locale}
        options={LANGUAGE_OPTIONS}
        theme={theme}
        onSelect={selectLanguage}
        onClose={closeLanguageModal}
      />

    </View>
  );
}