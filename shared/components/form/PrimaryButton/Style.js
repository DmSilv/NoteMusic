import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#0A8CD6',
        paddingHorizontal: 24,
        minWidth: 120,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#A3A3A3',
        opacity: 0.6,
    },
    buttonText: {
        fontSize: 16,
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
