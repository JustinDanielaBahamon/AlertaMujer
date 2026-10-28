import { StyleSheet } from "react-native";
import { COLORS } from "../../../features/tutorial/styles/universalStyle";

export const styles = StyleSheet.create({
  // Only for text inside the card content
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