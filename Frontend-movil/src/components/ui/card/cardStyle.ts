import { StyleSheet } from "react-native";
import { COLORS } from "../../../../features/tutorial/universalStyle";

export const styles = StyleSheet.create({
  // Solo para texto dentro del contenido de la card
  description: {
    fontSize: 14,
    color: COLORS.textBody,
    lineHeight: 22,
    marginBottom: 4,
  },
  descriptionBold: {
    fontWeight: '700',
    color: COLORS.purpleDark,
  },
  descriptionHighlight: {
    fontWeight: '700',
    color: COLORS.purpleMain,
  },
});