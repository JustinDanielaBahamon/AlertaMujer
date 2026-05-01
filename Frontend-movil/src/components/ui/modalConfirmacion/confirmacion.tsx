import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { localStyles } from './confirmacionStyle';

interface ModalConfirmacionProps {
  visible: boolean;
  departamento: string;
  municipio: string;
  onConfirmar: () => void;
  onRegresar: () => void;
  soloConfirmar: boolean; // ← agregar esto
}

export default function ModalConfirmacion({ 
  visible, 
  departamento, 
  municipio, 
  onConfirmar, 
  onRegresar,
  soloConfirmar, // ← agregar esto
}: ModalConfirmacionProps) {
  
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onRegresar}>
      <View style={localStyles.overlay}>
        <View style={localStyles.modalCard}>
          
          <View style={localStyles.iconCircle}>
            <Text style={localStyles.iconText}>⚠️</Text>
          </View>

          <Text style={localStyles.modalTitle}>¡Casi listos!</Text>
          
          <Text style={localStyles.modalSubtitle}>
            Confirma que tu ubicación sea correcta para poder asistirte mejor:
          </Text>

          <View style={localStyles.infoBox}>
            <View style={localStyles.dataRow}>
              <Text style={localStyles.dataLabel}>Departamento:</Text>
              <Text style={localStyles.dataValue}>{departamento}</Text>
            </View>
            <View style={localStyles.dataRow}>
              <Text style={localStyles.dataLabel}>Municipio:</Text>
              <Text style={localStyles.dataValue}>{municipio}</Text>
            </View>
          </View>

          <View style={localStyles.buttonContainer}>
            <TouchableOpacity style={localStyles.btnConfirmar} onPress={onConfirmar}>
              <Text style={localStyles.btnTextConfirmar}>Sí, confirmar</Text>
            </TouchableOpacity>

            {/* ← Solo muestra "Cambiar datos" si NO ha confirmado aún */}
            {!soloConfirmar && (
              <TouchableOpacity style={localStyles.btnRegresar} onPress={onRegresar}>
                <Text style={localStyles.btnTextRegresar}>Cambiar datos</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
}