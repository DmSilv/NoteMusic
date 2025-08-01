import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Alert } from 'react-native';
import UserInfo from '../Components/UserInfo/Userinfo';
import BackButton from '../Components/BackButton/BackButton';
import { StackNavigationProp } from '@react-navigation/stack';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type Option = {
    id: string;
    label: string;
    isCorrect: boolean;
    explanation?: string;
};

interface QuizScreenProps {
    navigation: StackNavigationProp<any>;
}

interface Question {
    id: number;
    question: string;
    options: Option[];
    category: string;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ navigation }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState<boolean>(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
    const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutos

    // Banco de questões
    const questions: Question[] = [
        {
            id: 1,
            question: "Qual das seguintes opções NÃO é uma propriedade fundamental do som?",
            options: [
                { id: 'A', label: 'Frequência', isCorrect: false, explanation: 'A frequência é uma propriedade fundamental do som.' },
                { id: 'B', label: 'Timbre', isCorrect: false, explanation: 'O timbre é uma propriedade fundamental do som.' },
                { id: 'C', label: 'Intensidade', isCorrect: false, explanation: 'A intensidade é uma propriedade fundamental do som.' },
                { id: 'D', label: 'Transparência', isCorrect: true, explanation: 'Transparência não é uma propriedade do som.' }
            ],
            category: "Propriedades do Som"
        },
        {
            id: 2,
            question: "Qual é a nota musical que representa o som mais grave?",
            options: [
                { id: 'A', label: 'Dó', isCorrect: false, explanation: 'Dó não é a nota mais grave.' },
                { id: 'B', label: 'Ré', isCorrect: false, explanation: 'Ré não é a nota mais grave.' },
                { id: 'C', label: 'Mi', isCorrect: false, explanation: 'Mi não é a nota mais grave.' },
                { id: 'D', label: 'Lá', isCorrect: true, explanation: 'Lá é a nota mais grave do sistema musical.' }
            ],
            category: "Notas Musicais"
        },
        {
            id: 3,
            question: "Quantas linhas tem uma pauta musical?",
            options: [
                { id: 'A', label: '3 linhas', isCorrect: false, explanation: 'Uma pauta tem mais que 3 linhas.' },
                { id: 'B', label: '4 linhas', isCorrect: false, explanation: 'Uma pauta tem mais que 4 linhas.' },
                { id: 'C', label: '5 linhas', isCorrect: true, explanation: 'Uma pauta musical tem exatamente 5 linhas.' },
                { id: 'D', label: '6 linhas', isCorrect: false, explanation: 'Uma pauta tem menos que 6 linhas.' }
            ],
            category: "Pauta Musical"
        }
    ];

    const currentQuestion = questions[currentQuestionIndex];

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    finishQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (optionId: string) => {
        if (answeredQuestions.has(currentQuestionIndex)) return;

        setSelectedOption(optionId);
        setShowFeedback(true);

        const selectedAnswer = currentQuestion.options.find((opt) => opt.id === optionId);
        const isCorrect = selectedAnswer?.isCorrect || false;

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex]));

        setTimeout(() => {
            setSelectedOption(null);
            setShowFeedback(false);
            
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                finishQuiz();
            }
        }, 2000);
    };

    const finishQuiz = () => {
        const percentage = (score / questions.length) * 100;
        let message = '';
        
        if (percentage >= 80) {
            message = 'Excelente! Você demonstrou um conhecimento sólido!';
        } else if (percentage >= 60) {
            message = 'Bom trabalho! Continue estudando para melhorar ainda mais!';
        } else {
            message = 'Continue praticando! A teoria musical requer dedicação.';
        }

        Alert.alert(
            'Quiz Finalizado!',
            `Pontuação: ${score}/${questions.length} (${percentage.toFixed(0)}%)\n\n${message}`,
            [
                {
                    text: 'Ver Resultados',
                    onPress: () => navigation.navigate('QuizResults', { score, total: questions.length })
                },
                {
                    text: 'Voltar ao Menu',
                    onPress: () => navigation.navigate('ProfileHome')
                }
            ]
        );
    };

    const handlePressProfileHome = () => {
        Alert.alert(
            'Sair do Quiz?',
            'Tem certeza que deseja sair? Seu progresso será perdido.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Sair', onPress: () => navigation.goBack() }
            ]
        );
    };

    const progress = (currentQuestionIndex + 1) / questions.length;
    const selectedAnswer = currentQuestion.options.find((opt) => opt.id === selectedOption);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.backButtoncontainer}>
                    <BackButton onPress={handlePressProfileHome} />
                </View>
                <UserInfo userName="Danilo" userSubtitle="Aprendiz" />
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>Tempo: {formatTime(timeLeft)}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>{`${currentQuestionIndex + 1}/${questions.length}`}</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Category */}
                <Text style={styles.categoryText}>{currentQuestion.category}</Text>

                {/* Question */}
                <Text style={styles.question}>
                    {currentQuestion.question}
                </Text>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.optionButton,
                                selectedOption === option.id && (
                                    option.isCorrect ? styles.correctButton : styles.incorrectButton
                                ),
                                answeredQuestions.has(currentQuestionIndex) && option.isCorrect && styles.correctButton
                            ]}
                            onPress={() => handleOptionSelect(option.id)}
                            disabled={answeredQuestions.has(currentQuestionIndex) || showFeedback}
                        >
                            <Text style={[
                                styles.optionText,
                                selectedOption === option.id && styles.optionTextSelected
                            ]}>
                                {`${option.id}) ${option.label}`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Feedback */}
                {showFeedback && selectedAnswer && (
                    <View style={styles.resultContainer}>
                        <Text style={[
                            styles.resultText,
                            selectedAnswer.isCorrect ? styles.correctResult : styles.incorrectResult
                        ]}>
                            {selectedAnswer.isCorrect ? '✅ Correto!' : '❌ Incorreto'}
                        </Text>
                        {selectedAnswer.explanation && (
                            <Text style={styles.explanationText}>
                                {selectedAnswer.explanation}
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: Math.max(16, screenWidth * 0.04),
    },
    header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingVertical: Math.max(12, screenHeight * 0.015),
        marginBottom: Math.max(16, screenHeight * 0.02),
        width: '100%',
    },
    backButtoncontainer: {
        position: 'absolute',
        top: 'auto',
        left: 20,
        zIndex: 10,
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: Math.max(16, screenHeight * 0.02),
    },
    timerText: {
        fontSize: Math.max(16, screenWidth * 0.04),
        fontWeight: 'bold',
        color: '#E5944A',
        fontFamily: 'Roboto-Medium',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Math.max(24, screenHeight * 0.03),
        alignSelf: 'center',
    },
    progressBarBackground: {
        height: Math.max(8, screenHeight * 0.01),
        width: '70%',
        backgroundColor: '#C6E8FF',
        borderRadius: 5,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 6,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#0087D3',
    },
    progressText: {
        marginLeft: Math.max(10, screenWidth * 0.025),
        fontWeight: 'bold',
        color: '#333',
        fontSize: Math.max(14, screenWidth * 0.035),
    },
    content: {
        flex: 1,
    },
    categoryText: {
        fontSize: Math.max(14, screenWidth * 0.035),
        color: '#0A8CD6',
        fontWeight: '600',
        marginBottom: Math.max(8, screenHeight * 0.01),
        fontFamily: 'Roboto-Medium',
    },
    question: {
        fontSize: Math.max(18, screenWidth * 0.045),
        fontWeight: 'bold',
        marginBottom: Math.max(24, screenHeight * 0.03),
        color: '#131313',
        lineHeight: Math.max(24, screenHeight * 0.03),
        fontFamily: 'Roboto-Bold',
    },
    optionsContainer: {
        marginBottom: Math.max(30, screenHeight * 0.04),
    },
    optionButton: {
        backgroundColor: '#0087D3',
        padding: Math.max(16, screenHeight * 0.02),
        borderRadius: Math.max(10, screenWidth * 0.025),
        marginVertical: Math.max(6, screenHeight * 0.008),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    correctButton: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    incorrectButton: {
        backgroundColor: '#F44336',
        borderColor: '#F44336',
    },
    optionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: Math.max(16, screenWidth * 0.04),
        fontFamily: 'Roboto-Medium',
    },
    optionTextSelected: {
        color: '#FFFFFF',
    },
    resultContainer: {
        marginTop: Math.max(20, screenHeight * 0.025),
        padding: Math.max(16, screenWidth * 0.04),
        backgroundColor: '#F8F9FA',
        borderRadius: Math.max(10, screenWidth * 0.025),
        borderLeftWidth: 4,
        borderLeftColor: '#0A8CD6',
    },
    resultText: {
        fontWeight: 'bold',
        fontSize: Math.max(18, screenWidth * 0.045),
        marginBottom: Math.max(8, screenHeight * 0.01),
        fontFamily: 'Roboto-Bold',
    },
    correctResult: {
        color: '#4CAF50',
    },
    incorrectResult: {
        color: '#F44336',
    },
    explanationText: {
        fontSize: Math.max(14, screenWidth * 0.035),
        color: '#545454',
        lineHeight: Math.max(20, screenHeight * 0.025),
        fontFamily: 'Roboto-Regular',
    },
});

export default QuizScreen;
