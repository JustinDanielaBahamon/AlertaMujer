import { StyleSheet } from "react-native";  

export const styles = StyleSheet.create({
    MainContainer: {
        flex: 1
    },
    HeaderContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingVertical: 20, // A little more space in the header
        justifyContent: 'center'
    },
    HeaderText: {
        fontSize: 28,
        fontWeight: 'bold',
        color:'purple'
    },
    BoxesContainer: {
        padding: 10, // Slightly increased for better breathing room at the edges
    },
    // --- RESPONSIVE IMPROVEMENT: emergency button ---
    PoliceButton: {
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderRadius: 14.5,
        height: 45, // A bit taller for touch accessibility
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%', // Takes the parent's width on phones
        maxWidth: 220,  // But does not grow forever on tablets
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
    // --- RESPONSIVE IMPROVEMENT: side boxes ---
    ViolenceContainer: {
        borderRadius: 22,
        padding: 20,
        width: '48%', // Uses a percentage so two always fit
    },
    MentalContainer: {
        borderRadius: 22,
        padding: 20,
        width: '48%', // Uses a percentage
        alignItems: 'flex-end'
    },
    callViolenceLine: {
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderRadius: 14.5,
        height: 40,
        width: '100%', // Adapts to the box
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
        width: '100%', // Adapts to the box
    },
    // --- Icons and other elements ---
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
    flex: 1,  // ← without this, the child ScrollView has no room to expand
},Scroll: {
    flex: 1,
},
  
});