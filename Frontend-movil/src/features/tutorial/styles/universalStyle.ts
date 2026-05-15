import { StyleSheet } from "react-native";

export const COLORS = {
  purpleMain:  '#6006aa',
  purpleLight: '#fdfdfd',
  purpleMid:   '#300c9e',
  purpleDark:  '#5B21B6',
  purpleSoft:  '#3b288fce',
  purplePale:  '#8f17be',
  bgPage:      '#ddd9f5',
  bgCard:      '#FFFFFF',
  textTitle:   '#1E1B4B',
  textBody:    '#4B5563',
  sosPrimary:  'rgb(255, 189, 65)',
  sosLight:    '#FEE2E2',
  sosDark:     '#c01d1d',
};

export const styles = StyleSheet.create({
  // Layout base
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPage,
    alignItems: 'center',
  },

  // Card — versión estándar (otras pantallas)
  card: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: COLORS.bgCard,
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.purpleDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.purpleLight,
    overflow: 'hidden',
  },

  // Card — versión grande (Bienvenida y pantallas con más contenido)
  cardLarge: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 18,
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 28,
    padding: 24,
    shadowColor: COLORS.purpleDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.purpleLight,
    overflow: 'hidden',
  },

  // Acento superior de card (funciona para ambas variantes)
  cardAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 5,
    backgroundColor: COLORS.purpleMain,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // Títulos
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textTitle,
    textAlign: 'center',
    lineHeight: 32,
    marginTop: 8,
    marginBottom: 16,
  },
  cardTitleHighlight: {
    color: COLORS.purpleMain,
  },

  // Divisor
  divider: {
    height: 1,
    backgroundColor: COLORS.purpleLight,
    marginBottom: 12,
  },

  // Bloques de descripción simples
  descBlock: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },
  descText: {
    fontSize: 14,
    color: COLORS.textBody,
    lineHeight: 22,
    textAlign: 'center',
    flex: 1,
  },
  descBold: {
    fontWeight: '700',
    color: COLORS.purpleDark,
  },

  // Filas con icono (reutilizable en cualquier pantalla)
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 12,
  },
  rowIcon: {
    fontSize: 28,
    marginTop: 2,
  },
  rowTextContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textTitle,
    marginBottom: 3,
  },
  rowDesc: {
    fontSize: 13,
    color: COLORS.textBody,
    lineHeight: 20,
  },

  // Badge
  badge: {
    alignSelf: 'center',
    marginTop: 'auto',
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.purpleSoft,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.purpleDark,
  },

  // Botón primario
  buttonPrimary: {
    backgroundColor: COLORS.purpleMain,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.purpleDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Botón secundario
  buttonSecondary: {
    borderWidth: 2,
    borderColor: COLORS.purpleMain,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: COLORS.purpleMain,
    fontSize: 16,
    fontWeight: '600',
  },

  // Botón SOS
  buttonSOS: {
    backgroundColor: COLORS.sosPrimary,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: COLORS.sosDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonSOSText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
});



