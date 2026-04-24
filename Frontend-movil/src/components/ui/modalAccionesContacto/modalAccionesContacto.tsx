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
import { styles } from './modalAccionesContacto.styles';
import { useLocale } from '../../../contexts/LocaleContext';

interface ModalAccionesContactoProps {
  visible: boolean;
  nombreContacto: string;
  onActualizar: () => void;
  onBorrar: () => void;
  onCerrar: () => void;
}

export default function ModalAccionesContacto({ 
  visible, 
  nombreContacto, 
  onActualizar, 
  onBorrar,
  onCerrar 
}: ModalAccionesContactoProps) {
  const { t } = useLocale();

  return (
    <Modal 
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCerrar}
    >
      {/* Fondo oscuro semitransparente */}
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onCerrar}
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
              {nombreContacto}
            </Text>
            
            <Text style={styles.modalSubtitle}>
              {t.contactos.que_deseas}
            </Text>

            {/* BOTON ACTUALIZAR */}
            <TouchableOpacity 
              style={styles.btnActualizar} 
              activeOpacity={0.9}
              onPress={() => {
                onCerrar();
                onActualizar();
              }}
            >
              <MaterialIcons name="edit" size={22} color="#FFF" />
              <Text style={styles.btnTextActualizar}>{t.contactos.actualizar}</Text>
            </TouchableOpacity>

            {/* BOTON BORRAR */}
            <TouchableOpacity 
              style={styles.btnBorrar} 
              activeOpacity={0.1}
              onPress={() => {
                onCerrar();
                onBorrar();
              }}
            >
              <MaterialIcons name="delete" size={22} color="#E53935" />
              <Text style={styles.btnTextBorrar}>{t.contactos.eliminar_contacto}</Text>
            </TouchableOpacity>

            {/* BOTON CANCELAR */}
            <TouchableOpacity 
              style={styles.btnCancelar} 
              activeOpacity={0.7}
              onPress={onCerrar}
            >
              <Text style={styles.btnTextCancelar}>{t.modal.cancelar}</Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}