
/**
 * ACTIONS MODAL STYLES
 *
 * Defines every color, size and position of the modal.
 * Uses the app purple (#6B3FA0).
 */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Dark background covering the whole screen
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // Black with 60% opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // White modal card
  modalCard: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    elevation: 10, // Shadow on Android
    shadowColor: '#000', // Shadow on iOS
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  
  // Purple circle with a person icon
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F3E5F5', // Very light purple
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  // Contact name (main title)
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6B3FA0', // Your purple
    marginBottom: 5,
  },
  
  // "What do you want to do?" subtitle
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  
  // UPDATE BUTTON (solid purple)
  updateBtn: {
    width: '100%',
    height: 55,
    backgroundColor: '#6B3FA0',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    // --- CHANGES HERE ---
    gap: 12, // Raised from 8 to 12 so the pencil does not touch the first letter of the name or of the label
    paddingHorizontal: 60, 
  },
  updateBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // DELETE BUTTON (white with a red border)
  deleteBtn: {
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
    // --- CHANGES HERE ---
    gap: 12, // We keep the symmetry with the button above
    paddingHorizontal: 50,
  },
  deleteBtnText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // CANCEL BUTTON (transparent, text only)
  cancelBtn: {
    width: '100%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#999',
    fontSize: 15,
    fontWeight: '500',
  },
});