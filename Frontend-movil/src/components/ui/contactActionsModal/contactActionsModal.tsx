/**
 * MODAL DE ACCIONES DE CONTACTO
 * 
 * Este componente muestra un modal bonito cuando el usuario toca un contacto.
 * Permite elegir entre ACTUALIZAR o BORRAR el contacto.
 * 
 * USO:
 * <ModalAccionesContacto 
 *   visible={true/false}
 *   nombreContacto="Tatiana Montero"
 *   onActualizar={() => { // editar contacto }}
 *   onBorrar={() => { // confirmar borrado }}
 *   onCerrar={() => { // cerrar modal }}
 * />
 */

import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './contactActionsModal.styles';
import { useLocale } from '../../../contexts/LocaleContext';

interface ContactActionsModalProps {
  visible: boolean;
  contactNameValue: string;
  onUpdate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function ContactActionsModal({ 
  visible, 
  contactNameValue, 
  onUpdate, 
  onDelete,
  onClose 
}: ContactActionsModalProps) {
  const { t } = useLocale();

  return (
    <Modal 
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Fondo oscuro semitransparente */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        {/* Tarjeta blanca del modal */}
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()} 
        >
          <View style={styles.modalCard}>
            
            {/* ICONO CON CIRCULO MORADO */}
            <View style={styles.iconCircle}>
              <MaterialIcons name="person" size={40} color="#6B3FA0" />
            </View>

            {/* NOMBRE DEL CONTACTO */}
            <Text style={styles.modalTitle}>
              {contactNameValue}
            </Text>
            
            <Text style={styles.modalSubtitle}>
              {t.contactos.que_deseas}
            </Text>

            {/* BOTON ACTUALIZAR */}
            <TouchableOpacity 
              style={styles.updateBtn} 
              activeOpacity={0.9}
              onPress={() => {
                onClose();
                onUpdate();
              }}
            >
              <MaterialIcons name="edit" size={22} color="#FFF" />
              <Text style={styles.updateBtnText}>{t.contactos.actualizar}</Text>
            </TouchableOpacity>

            {/* BOTON BORRAR */}
            <TouchableOpacity 
              style={styles.deleteBtn} 
              activeOpacity={0.1}
              onPress={() => {
                onClose();
                onDelete();
              }}
            >
              <MaterialIcons name="delete" size={22} color="#E53935" />
              <Text style={styles.deleteBtnText}>{t.contactos.eliminar_contacto}</Text>
            </TouchableOpacity>

            {/* BOTON CANCELAR */}
            <TouchableOpacity 
              style={styles.cancelBtn} 
              activeOpacity={0.7}
              onPress={onClose}
            >
              <Text style={styles.cancelBtnText}>{t.modal.cancelar}</Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}