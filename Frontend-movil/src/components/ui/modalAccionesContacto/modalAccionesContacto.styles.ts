
/**
 * ESTILOS DEL MODAL DE ACCIONES
 * 
 * Define todos los colores, tamaños y posiciones del modal.
 * Usa el color morado de tu app (#6B3FA0).
 */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Fondo oscuro que cubre toda la pantalla
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // Negro con 60% de opacidad
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Tarjeta blanca del modal
  modalCard: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    elevation: 10, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  
  // Círculo morado con ícono de persona
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F3E5F5', // Morado muy claro
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  // Nombre del contacto (título principal)
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6B3FA0', // Tu morado
    marginBottom: 5,
  },
  
  // Subtítulo "¿Qué deseas hacer?"
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  
  // BOTÓN ACTUALIZAR (morado sólido)
  btnActualizar: {
    width: '100%',
    height: 55,
    backgroundColor: '#6B3FA0',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    // --- CAMBIOS AQUÍ ---
    gap: 12, // Aumentamos de 8 a 12 para que el lápiz no choque con la T de Tatiana o la A de Actualizar
    paddingHorizontal: 60, 
  },
  btnTextActualizar: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // BOTÓN BORRAR (blanco con borde rojo)
  btnBorrar: {
    width: '100%',
    height: 55,
    backgroundColor: '#FFF',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E53935',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    // --- CAMBIOS AQUÍ ---
    gap: 12, // Mantenemos la simetría con el botón de arriba
    paddingHorizontal: 50,
  },
  btnTextBorrar: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // BOTÓN CANCELAR (transparente, solo texto)
  btnCancelar: {
    width: '100%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTextCancelar: {
    color: '#999',
    fontSize: 15,
    fontWeight: '500',
  },
});