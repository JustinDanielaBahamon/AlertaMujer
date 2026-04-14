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

/**
 * MODAL DE ACCIONES DE CONTACTO ACTUALIZADO
 */

import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './modalAccionesContacto.styles';

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
          activeOpacity={1} // Ajustado a 1 (máximo) para que sea sólido
          onPress={(e) => e.stopPropagation()} 
        >
          <View style={styles.modalCard}>
            
            {/* ÍCONO CON CÍRCULO MORADO */}
            <View style={styles.iconCircle}>
              <MaterialIcons name="person" size={40} color="#6B3FA0" />
            </View>

            {/* NOMBRE DEL CONTACTO */}
            <Text style={styles.modalTitle}>
              {nombreContacto}
            </Text>
            
            <Text style={styles.modalSubtitle}>
              ¿Qué deseas hacer?
            </Text>

            {/* BOTÓN ACTUALIZAR (con opacidad corregida) */}
            <TouchableOpacity 
              style={styles.btnActualizar} 
              activeOpacity={0.9} // Evita que se vea lo de atrás al presionar
              onPress={() => {
                onCerrar();
                onActualizar();
              }}
            >
              <MaterialIcons name="edit" size={22} color="#FFF" />
              <Text style={styles.btnTextActualizar}>Actualizar Datos</Text>
            </TouchableOpacity>

            {/* BOTÓN BORRAR (con opacidad corregida) */}
            <TouchableOpacity 
              style={styles.btnBorrar} 
              activeOpacity={0.1} // Evita que se vea lo de atrás al presionar
              onPress={() => {
                onCerrar();
                onBorrar();
              }}
            >
              <MaterialIcons name="delete" size={22} color="#E53935" />
              <Text style={styles.btnTextBorrar}>Eliminar Contacto</Text>
            </TouchableOpacity>

            {/* BOTÓN CANCELAR */}
            <TouchableOpacity 
              style={styles.btnCancelar} 
              activeOpacity={0.7} // Este puede ser más suave al ser solo texto
              onPress={onCerrar}
            >
              <Text style={styles.btnTextCancelar}>Cancelar</Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}