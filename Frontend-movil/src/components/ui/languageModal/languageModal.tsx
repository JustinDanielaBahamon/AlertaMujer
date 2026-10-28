import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { AppLocale, useLocale } from '../../../contexts/LocaleContext';
import { localStyles } from './languageModal.style';

export type LanguageOption = {
  code: AppLocale;
  label: string;
};

interface LanguageModalProps {
  visible: boolean;
  locale: AppLocale;
  options: LanguageOption[];
  theme: any;
  onSelect: (locale: AppLocale) => void;
  onClose: () => void;
}

export default function LanguageModal({
  visible,
  locale,
  options,
  theme,
  onSelect,
  onClose,
}: LanguageModalProps) {
  const { t } = useLocale();
  const accent = theme.tabActiveColor;

  // Name of each language in the current language, below its own name
  const translatedName: Record<AppLocale, string> = {
    es: t.modal.idioma_es,
    en: t.modal.idioma_en,
    pt: t.modal.idioma_pt,
    fr: t.modal.idioma_fr,
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={localStyles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[localStyles.modalCard, { backgroundColor: theme.card }]}>
          <View style={[localStyles.headerIconBox, { backgroundColor: accent + '22' }]}>
            <Ionicons name="language" size={26} color={accent} />
          </View>
          <Text style={[localStyles.modalTitle, { color: theme.text }]}>{t.modal.seleccionar_idioma}</Text>
          <Text style={[localStyles.modalSub, { color: theme.text }]}>{t.modal.idioma_subtitulo}</Text>

          {options.map((option) => {
            const selected = option.code === locale;
            return (
              <TouchableOpacity
                key={option.code}
                style={[
                  localStyles.option,
                  { borderColor: selected ? accent : accent + '30' },
                  selected && { backgroundColor: accent + '18' },
                ]}
                onPress={() => onSelect(option.code)}
                accessibilityRole="radio"
                accessibilityState={{ selected: selected }}
              >
                <View style={[localStyles.code, { backgroundColor: selected ? accent : accent + '22' }]}>
                  <Text style={[localStyles.codeText, { color: selected ? '#fff' : accent }]}>
                    {option.code.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[localStyles.optionText, { color: theme.text }]}>{option.label}</Text>
                  <Text style={[localStyles.optionSub, { color: theme.text }]}>{translatedName[option.code]}</Text>
                </View>
                {selected && <Ionicons name="checkmark-circle" size={22} color={accent} />}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={localStyles.closeBtn} onPress={onClose}>
            <Text style={[localStyles.closeBtnText, { color: accent }]}>{t.modal.cerrar}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
