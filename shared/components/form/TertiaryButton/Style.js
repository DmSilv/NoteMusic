import { StyleSheet } from 'react-native';
import { MIN_TOUCH_TARGET } from '@/shared/constants/responsive';

const styles = StyleSheet.create({
    button: {
        minHeight: MIN_TOUCH_TARGET,
        borderRadius: 100,
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: '#222222',
        paddingHorizontal: 16,
        flexShrink: 1,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    buttonText: {
        fontSize: 16,
        textAlign: 'center',
        color: 'white',
    },
});

export default styles;
