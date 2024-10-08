import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    button: {
        height: 53,
        borderRadius: 100,
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: 32,
        marginBottom:12,
        backgroundColor: '#0A8CD6',
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
    buttonText: {
        fontSize: 16,
        textAlign: 'center',
        color: 'white',
    },
});

export default styles;
