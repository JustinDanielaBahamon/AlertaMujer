/**
 * CONTACT ACTIONS MODAL
 *
 * Shows a modal when the user taps a contact.
 * Lets them choose to UPDATE or DELETE the contact.
 *
 * USAGE:
 * <ContactActionsModal
 *   visible={true/false}
 *   contactName="Tatiana Montero"
 *   onUpdate={() => { // edit contact }}
 *   onDelete={() => { // confirm deletion }}
 *   onClose={() => { // close modal }}
 * />
 */

import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './contactActionsModal.styles';
import { useLocale } from '../../../contexts/LocaleContext';
import { useDialogColors } from "../dialogColors";

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
  const dialog = useDialogColors();
  const { t } = useLocale();

  return (
    <Modal 
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Semi-transparent dark background */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        {/* White modal card */}
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()} 
        >
          <View style={[styles.modalCard, dialog.card]}>
            
            {/* ICON WITH A PURPLE CIRCLE */}
            <View style={styles.iconCircle}>
              <MaterialIcons name="person" size={40} color="#6B3FA0" />
            </View>

            {/* CONTACT NAME */}
            <Text style={styles.modalTitle}>
              {contactNameValue}
            </Text>
            
            <Text style={[styles.modalSubtitle, dialog.text]}>
              {t.contactos.que_deseas}
            </Text>

            {/* UPDATE BUTTON */}
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

            {/* DELETE BUTTON */}
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

            {/* CANCEL BUTTON */}
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