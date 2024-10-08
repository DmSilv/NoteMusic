import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    button: {
        height: 53,
        borderRadius: 100,
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        elevation: 3, // Sombra para Android
        shadowColor: '#000', // Cor da sombra para iOS
        shadowOffset: { width: 0, height: 2 }, // Deslocamento da sombra
        shadowOpacity: 0.3, // Opacidade da sombra
        shadowRadius: 2, // Difusão da sombra
    },
    buttonText: {
        fontSize: 16,
        textAlign: 'center',
        color: 'black',
    },
});

export default styles;
