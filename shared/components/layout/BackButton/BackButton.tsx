import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TitleComponent from '@/shared/components/form/Title/Title';
import { getLevelColors } from '@/shared/constants/theme';

interface BackButtonProps {
    onPress: () => void;
    title?: string;
    /** Quando informado, usa cores do nível sobre fundo claro */
    level?: string | null;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress, title, level }) => {
    const levelColors = level != null ? getLevelColors(level) : null;
    const iconColor = levelColors?.primary ?? '#131313';
    const titleColor = levelColors?.text ?? '#131313';

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.buttonContent}>
                <Ionicons name="arrow-back-outline" size={24} color={iconColor} />
                {title && (
                    <TitleComponent
                        title={title}
                        fontFamily={'Roboto-Bold'}
                        color={titleColor}
                        fontSize={''}
                    />
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default BackButton;
