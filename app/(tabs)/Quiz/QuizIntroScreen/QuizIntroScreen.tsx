import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import UserInfo from '../../Components/UserInfo/Userinfo';
import BackButton from '../../Components/BackButton/BackButton';

interface QuizIntroScreenProps {
    navigation: StackNavigationProp<any>;
}

const QuizIntroScreen: React.FC<QuizIntroScreenProps> = ({ navigation }) => {
    const handlePressQuizIntroScreen = () => {
        navigation.navigate('Quiz');
    };


    const handlePressProfileHome = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <View style={styles.Header}>
                <View style={styles.backButtoncontainer}>
                    <BackButton onPress={handlePressProfileHome} />
                </View>
                <UserInfo userName="Danilo" userSubtitle="Aprendiz" />
            </View>

            <Text style={styles.greetingText}>Olá, Vamos Testar Seus Conhecimentos Musicais!</Text>

            <Text style={styles.pageTitle}>Propriedades do som</Text>

            <Text style={styles.sectionTitle}>Desafie Seus Conhecimentos Musicais</Text>
            <Text style={styles.description}>
                Neste módulo do quiz, você será desafiado com perguntas sobre diversos temas musicais.
                Prepare-se para testar seus conhecimentos em:
            </Text>
            <Text style={styles.bulletPoint}>• Propriedades do som</Text>
            <Text style={styles.bulletPoint}>• Instrumentos musicais</Text>
            <Text style={styles.bulletPoint}>• Compositores clássicos</Text>
            <Text style={styles.bulletPoint}>• Teoria musical</Text>
            <Text style={styles.description}>Boa sorte e divirta-se!</Text>

            <TouchableOpacity style={styles.continueButton} onPress={handlePressQuizIntroScreen}>
                <Text style={styles.continueButtonText}>Confirmar e Continuar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    Header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingBottom: 20,
    },
    backButtoncontainer: {
        position: 'absolute',
        left: 20,
        zIndex: 10,
    },
    greetingText: {
        fontSize: 16,
        color: '#888',
        marginBottom: 10,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0087D3',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    bulletPoint: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
        marginBottom: 5,
    },
    continueButton: {
        backgroundColor: '#0087D3',
        paddingVertical: 15,
        borderRadius: 25,
        marginTop: 30,
        alignItems: 'center',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default QuizIntroScreen;
