import { StyleSheet } from "react-native";  

export const styles = StyleSheet.create({
    MainContainer: {
        flex: 1
    },
    HeaderContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 20, // Un poco más de espacio en cabecera
        justifyContent: 'center'
    },
    HeaderText: {
        fontSize: 28,
        fontWeight: 'bold',
        color:'purple'
    },
    BoxesContainer: {
        padding: 10, // Aumentado ligeramente para mejor respiro en bordes
    },
    // --- MEJORA RESPONSIVE: Botón de emergencia ---
    PoliceButton: {
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderRadius: 14.5,
        height: 45, // Un poco más alto para accesibilidad táctil
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%', // Que ocupe el ancho del padre en móviles
        maxWidth: 220,  // Pero que no crezca infinito en tablets
    },
    CallIcon: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    callText: {
        fontSize: 18,
        color: 'white',
        marginLeft: 8
    },
    SecondSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 0,
    },
    // --- MEJORA RESPONSIVE: Cuadros laterales ---
    ViolenceContainer: {
        borderRadius: 22,
        padding: 20,
        width: '48%', // Usa porcentaje para que siempre quepan dos
    },
    MentalContainer: {
        borderRadius: 22,
        padding: 20,
        width: '48%', // Usa porcentaje
        alignItems: 'flex-end'
    },
    callViolenceLine: {
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderRadius: 14.5,
        height: 40,
        width: '100%', // Se adapta al cuadro
        alignItems: 'center',
        justifyContent: 'center',
    },
    callMentalHealth: {
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderRadius: 14.5,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%', // Se adapta al cuadro
    },
    // --- Iconos y otros elementos ---
    userIcon: {
        backgroundColor: 'purple',
        width: 47,
        height: 47,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    bulbIcon: {
        backgroundColor: 'rgba(205, 117, 230, 0.29)',
        width: 47,
        height: 47,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    ThirdSection: {
        marginTop: 15
    },
    TownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    starIcon: {
        backgroundColor: 'purple',
        borderRadius: 15,
        padding: 10,
        marginRight: 10,
    },
    secondSectionCall: {
        color: 'white',
        fontWeight: '700',
    },
  Header: {
    marginBottom: 0, 

  },
  Gradient: {
    paddingTop: 0.1,
    paddingHorizontal: 15,
    paddingBottom: 25,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  HeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  HeaderTitle: {
    fontSize: 24.3,
    fontWeight: "bold",
    color: "#FFFFFF",
    width: 220,
  },
  HeaderSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 8,
    lineHeight: 20,
    width: 220,
  },Body: {
    flex: 1,  // ← sin esto, el ScrollView hijo no tiene espacio para expandirse
},Scroll: {
    flex: 1,
},
  
});