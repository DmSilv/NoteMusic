import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TitleComponent from '../Title/Title'; // Ajuste o caminho conforme necessário

// Definindo os tipos de props para o componente
interface BackButtonProps {
    onPress: () => void; // Função que será chamada ao pressionar o botão
    title?: string; // Título opcional para exibir ao lado do ícone
}

const BackButton: React.FC<BackButtonProps> = ({ onPress, title }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.buttonContent}>
                <Ionicons name="arrow-back-outline" size={24} color="#000" />
                {title && <TitleComponent title={title} fontFamily={'Roboto-Bold'} color={'#000'} fontSize={''}/>}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10, // Adiciona um pouco de espaço em torno do botão
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default BackButton;
