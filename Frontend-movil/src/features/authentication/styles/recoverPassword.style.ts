import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
    MainContainer: {
        flex: 1,
        backgroundColor: 'rgb(202, 171, 222)', // Light purple background
    },
    ScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    // IMPROVED WHITE CARD
    container: {
        backgroundColor: '#FFF',
        borderRadius: 35, // Rounder, more elegant corners
        paddingHorizontal: 25,
        paddingVertical: 40,
        width: width * 0.88, // Takes 88% of the screen width
        // Shadows
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    LogoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    LogoImage: {
        width: 140, // Adjusted so it does not crowd the card
        height: 120,
        resizeMode: 'contain',
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#6B3FA0', 
        textAlign: 'center',
        marginBottom: 12,
        paddingHorizontal: 10,
    },
    subtitle: { 
        textAlign: 'center', 
        color: '#777', 
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 35,
        paddingHorizontal: 5,
    },
    inputContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#F8F9FA', 
        borderRadius: 15, 
        paddingHorizontal: 15,
        height: 60, 
        marginBottom: 30,
        borderWidth: 1.5,
        borderColor: '#EEE'
    },
    // Text inside the inputs with an icon (email and passwords)
    inputText: {
        flex: 1,
        height: 50,
        marginLeft: 10,
        color: '#333',
    },
    codeContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    boxInput: {
        width: 46,
        height: 56,
        borderWidth: 2, 
        borderColor: '#6B3FA0',
        borderRadius: 15, 
        textAlign: 'center', 
        fontSize: 26, 
        fontWeight: 'bold', 
        color: '#6B3FA0',
        backgroundColor: '#FDFDFF'
    },
    // Code boxes once the time ran out
    expiredBoxInput: {
        borderColor: '#9333EA',
        backgroundColor: '#F5F5F5',
        opacity: 0.6,
    },
    // Code timer (1:30)
    timerText: {
        textAlign: 'center',
        color: '#6B3FA0',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 25,
    },
    timerExpired: {
        color: '#9333EA',
    },
    primaryButton: {
        backgroundColor: '#6B3FA0', 
        height: 60, 
        borderRadius: 18, // Button with corners like the card
        justifyContent: 'center', 
        alignItems: 'center',
        width: '100%', 
        shadowColor: '#6B3FA0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: { 
        color: '#FFF', 
        fontSize: 18, 
        fontWeight: 'bold',
        letterSpacing: 0.5 
    },
    linkText: { 
        color: '#6B3FA0', 
        textAlign: 'center', 
        fontWeight: '600',
        fontSize: 15,
        marginTop: 25
    }
});