import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { AppLocale, useLocale } from '../../../contexts/LocaleContext';
import { localStyles } from './modalIdioma.style';

export type OpcionIdioma = {
  code: AppLocale;
  label: string;
};

interface ModalIdiomaProps {
  visible: boolean;
  locale: AppLocale;
  opciones: OpcionIdioma[];
  theme: any;
  onSeleccionar: (locale: AppLocale) => void;
  onCerrar: () => void;
}

export default function ModalIdioma({
  visible,
  locale,
  opciones,
  theme,
  onSeleccionar,
  onCerrar,
}: ModalIdiomaProps) {
  const { t } = useLocale();
  const accent = theme.tabActiveColor;

  // Nombre de cada idioma en el idioma actual, debajo de su nombre propio
  const nombreTraducido: Record<AppLocale, string> = {
    es: t.modal.idioma_es,
    en: t.modal.idioma_en,
    pt: t.modal.idioma_pt,
    fr: t.modal.idioma_fr,
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <TouchableOpacity style={localStyles.overlay} activeOpacity={1} onPress={onCerrar}>
        <TouchableOpacity activeOpacity={1} style={[localStyles.modalCard, { backgroundColor: theme.card }]}>
          <View style={[localStyles.iconoHeader, { backgroundColor: accent + '22' }]}>
            <Ionicons name="language" size={26} color={accent} />
          </View>
          <Text style={[localStyles.modalTitle, { color: theme.text }]}>{t.modal.seleccionar_idioma}</Text>
          <Text style={[localStyles.modalSub, { color: theme.text }]}>{t.modal.idioma_subtitulo}</Text>

          {opciones.map((opcion) => {
            const seleccionado = opcion.code === locale;
            return (
              <TouchableOpacity
                key={opcion.code}
                style={[
                  localStyles.opcion,
                  { borderColor: seleccionado ? accent : accent + '30' },
                  seleccionado && { backgroundColor: accent + '18' },
                ]}
                onPress={() => onSeleccionar(opcion.code)}
                accessibilityRole="radio"
                accessibilityState={{ selected: seleccionado }}
              >
                <View style={[localStyles.codigo, { backgroundColor: seleccionado ? accent : accent + '22' }]}>
                  <Text style={[localStyles.codigoTexto, { color: seleccionado ? '#fff' : accent }]}>
                    {opcion.code.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[localStyles.opcionTexto, { color: theme.text }]}>{opcion.label}</Text>
                  <Text style={[localStyles.opcionSub, { color: theme.text }]}>{nombreTraducido[opcion.code]}</Text>
                </View>
                {seleccionado && <Ionicons name="checkmark-circle" size={22} color={accent} />}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={localStyles.btnCerrar} onPress={onCerrar}>
            <Text style={[localStyles.btnCerrarTexto, { color: accent }]}>{t.modal.cerrar}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
