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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <TouchableOpacity
        style={localStyles.overlay}
        activeOpacity={1}
        onPress={onCerrar}
      >
        <TouchableOpacity activeOpacity={1} style={[localStyles.modalCard, { backgroundColor: theme.card }]}>
          <Text style={[localStyles.modalTitle, { color: theme.text }]}>{t.modal.seleccionar_idioma}</Text>

          {opciones.map((opcion) => {
            const seleccionado = opcion.code === locale;
            return (
              <TouchableOpacity
                key={opcion.code}
                style={[
                  localStyles.opcion,
                  seleccionado && { backgroundColor: theme.tabActiveColor + '22' },
                ]}
                onPress={() => onSeleccionar(opcion.code)}
              >
                <Ionicons
                  name={seleccionado ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={theme.tabActiveColor}
                />
                <Text style={[localStyles.opcionTexto, { color: theme.text }]}>
                  {opcion.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={localStyles.btnCerrar} onPress={onCerrar}>
            <Text style={[localStyles.btnCerrarTexto, { color: theme.tabActiveColor }]}>
              {t.modal.cerrar}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}