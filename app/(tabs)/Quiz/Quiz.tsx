import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import UserInfo from '../Components/UserInfo/Userinfo';
import BackButton from '../Components/BackButton/BackButton';
import { StackNavigationProp } from '@react-navigation/stack';
type Option = {
    id: string;
    label: string;
    isCorrect: boolean;
};
interface ModuleCategoryProps {
    navigation: StackNavigationProp<any>;
}


const QuizScreen: React.FC<ModuleCategoryProps> = ({ navigation }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0); // Progresso inicial

    const options: Option[] = [
        { id: 'A', label: 'Frequência', isCorrect: false },
        { id: 'B', label: 'Timbre', isCorrect: false },
        { id: 'C', label: 'Intensidade', isCorrect: false },
        { id: 'D', label: 'Transparência', isCorrect: true },
    ];
    const handlePressProfileHome = () => {
        navigation.goBack();
    };
    const handleOptionSelect = (id: string) => {
        setSelectedOption(id);
        setShowFeedback(true);

        const selectedAnswer = options.find((opt) => opt.id === id);

        setTimeout(() => {
            setSelectedOption(null);
            setShowFeedback(false);

            if (selectedAnswer?.isCorrect) {
                setProgress((prev) => (prev + 0.1 > 1 ? 1 : prev + 0.1));
            }
        }, 1300);
    };

    const selectedAnswer = options.find((opt) => opt.id === selectedOption);

    return (
        <View style={styles.container}>
            <View style={styles.Header}>
                <View style={styles.backButtoncontainer}>
                    <BackButton onPress={handlePressProfileHome} />
                </View>
                <UserInfo userName="Danilo" userSubtitle="Aprendiz" />
            </View>
            {/* Barra de Progresso Personalizada */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>{`${Math.floor(progress * 100)}%`}</Text>
            </View>

            {/* Pergunta */}
            <Text style={styles.question}>
                Qual das seguintes opções não é uma propriedade fundamental do som?
            </Text>

            {/* Opções */}
            <View style={styles.optionsContainer}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[styles.optionButton,
                        selectedOption === option.id && (option.isCorrect ? styles.correctButton : styles.incorrectButton),
                        ]}
                        onPress={() => handleOptionSelect(option.id)}
                        disabled={showFeedback}
                    >
                        <Text style={styles.optionText}>{`${option.id}) ${option.label}`}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Feedback de resposta */}
            {showFeedback && selectedAnswer && (
                <View style={styles.resultContainer}>
                    {selectedAnswer.isCorrect ? (
                        <Text style={styles.correctResult}>Parabéns, você acertou!</Text>
                    ) : (
                        <Text style={styles.incorrectResult}>Resposta incorreta, tente novamente.</Text>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12,
        backgroundColor: '#fff',
        width: '100%'
    },
    Header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: 12,
        marginBottom: 24,
        width: '100%',
    },
    backButtoncontainer: {
        position: 'absolute',
        top: 'auto',
        left: 20,
        zIndex: 10,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        alignSelf:'center'
    },
    progressBarBackground: {
        height: 10,
        width: '80%', // Ajuste a largura da barra de progresso
        backgroundColor: '#C6E8FF',
        borderRadius: 5,
        overflow: 'hidden',
        shadowColor: '#000', // Cor da sombra
        shadowOffset: {
            width: 0, // deslocamento horizontal da sombra
            height: 2, // deslocamento vertical da sombra
        },
        shadowOpacity: 0.2, // Opacidade da sombra
        shadowRadius: 2, // Raio da sombra
        elevation: 6, // Sombra para Android
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#0087D3', // Cor da barra de progresso
    },
    progressText: {
        marginLeft: 10,
        fontWeight: 'bold',
        color: '#333',
    },
    question: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    optionsContainer: {
        marginBottom: 30,
    },
    optionButton: {
        backgroundColor: '#0087D3',
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
    },
    correctButton: {
        backgroundColor: '#4CAF50',
    },
    incorrectButton: {
        backgroundColor: '#F44336',
    },
    optionText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    resultContainer: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
    },
    correctResult: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 18,
    },
    incorrectResult: {
        color: '#F44336',
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default QuizScreen;
