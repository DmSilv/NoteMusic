import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        height: Math.max(48, screenHeight * 0.06),
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: Math.max(32, screenHeight * 0.04),
        marginBottom: Math.max(12, screenHeight * 0.015),
        backgroundColor: '#0A8CD6',
        paddingHorizontal: Math.max(24, screenWidth * 0.06),
        minWidth: Math.max(120, screenWidth * 0.3),
        // Sombra para iOS
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        // Elevação para Android
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#A3A3A3',
        opacity: 0.6,
    },
    buttonText: {
        fontSize: Math.max(16, screenWidth * 0.04),
        textAlign: 'center',
        color: 'white',
        fontFamily: 'Roboto-Medium',
        fontWeight: '600',
    },
    buttonTextDisabled: {
        color: '#FFFFFF',
        opacity: 0.8,
    },
});

export default styles;
