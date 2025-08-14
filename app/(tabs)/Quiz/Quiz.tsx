import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Alert, ActivityIndicator } from 'react-native';
import UserInfo from '../Components/UserInfo/Userinfo';
import BackButton from '../Components/BackButton/BackButton';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import quizService from '../../../services/quizService';
import { Quiz, QuizQuestion, QuestionValidationResult } from '../../../services/api';
import AppStyles, { AppColors, AppSpacing, AppTypography } from '../../../constants/AppStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type Option = {
    id: string;
    label: string;
    isCorrect: boolean;
    explanation?: string;
};

interface QuizScreenProps {
    navigation: StackNavigationProp<any>;
    route: any;
}

interface Question {
    id: number;
    question: string;
    options: Option[];
    category: string;
}

// Estados para gerenciar o quiz
interface QuizState {
    quiz: Quiz | null;
    currentQuestionIndex: number;
    selectedOption: number | null;
    showFeedback: boolean;
    feedbackData: QuestionValidationResult | null;
    answers: Array<{
        questionIndex: number;
        selectedAnswer: number;
        isCorrect: boolean;
        points: number;
    }>;
    totalScore: number;
    timeLeft: number;
    isLoading: boolean;
    isAnswering: boolean; // Para prevenir múltiplas submissões
}

const QuizScreen: React.FC<QuizScreenProps> = ({ navigation, route }) => {
    const { user } = useAuth();
    const [startTime] = useState<Date>(new Date());
    const moduleId = route.params?.moduleId;
    
    // Estado centralizado do quiz
    const [state, setState] = useState<QuizState>({
        quiz: null,
        currentQuestionIndex: 0,
        selectedOption: null,
        showFeedback: false,
        feedbackData: null,
        answers: [],
        totalScore: 0,
        timeLeft: 300, // 5 minutos
        isLoading: true,
        isAnswering: false
    });

    // Questão atual
    const currentQuestion = state.quiz?.questions[state.currentQuestionIndex];

    // Função para carregar o quiz
    const loadQuiz = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));
            let quizData: Quiz | null = null;

            // Determinar tipo de quiz e carregar dados apropriados
            if (moduleId === 'daily' || moduleId === 'daily-challenge' || moduleId === 'daily-challenge-mock') {
                // Quiz de exercício diário
                const daily = await quizService.getDailyChallenge();
                quizData = { ...daily, id: daily.id || 'daily-challenge-mock' } as Quiz;
            } else {
                // Quiz de módulo regular
                quizData = await quizService.getQuiz(moduleId);
            }

            if (quizData && Array.isArray(quizData.questions) && quizData.questions.length > 0) {
                setState(prev => ({
                    ...prev,
                    quiz: quizData,
                    isLoading: false,
                    timeLeft: quizData.timeLimit || 300,
                    answers: []
                }));
            } else {
                throw new Error('Dados do quiz inválidos ou vazios');
            }
        } catch (error) {
            console.error('Erro ao carregar quiz:', error);
            setState(prev => ({ ...prev, isLoading: false }));
            Alert.alert(
                'Erro ao Carregar Quiz',
                'Não foi possível carregar o quiz. Verifique sua conexão e tente novamente.',
                [
                    { text: 'Tentar Novamente', onPress: loadQuiz },
                    { text: 'Voltar', onPress: () => navigation.goBack() }
                ]
            );
        }
    }, [moduleId, navigation]);

    // Effect para validação inicial e carregamento
    useEffect(() => {
        if (!moduleId || moduleId === 'default') {
            setTimeout(() => {
                Alert.alert('Erro', 'ID do módulo inválido. Volte e tente novamente.');
                navigation.goBack();
            }, 0);
            return;
        }
        loadQuiz();
    }, [loadQuiz]);

    // Timer do quiz
    useEffect(() => {
        if (state.quiz && !state.isLoading) {
            const timer = setInterval(() => {
                setState(prev => {
                    if (prev.timeLeft <= 1) {
                        clearInterval(timer);
                        finishQuiz();
                        return { ...prev, timeLeft: 0 };
                    }
                    return { ...prev, timeLeft: prev.timeLeft - 1 };
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [state.quiz, state.isLoading]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    /**
     * 📝 Processa a seleção de uma opção pelo usuário
     * Implementa feedback instantâneo com validação no backend
     * @param optionIndex Índice da opção selecionada (0-3)
     */
    const handleOptionSelect = async (optionIndex: number) => {
        // ✅ Validações de segurança
        if (!currentQuestion || state.isAnswering || state.selectedOption !== null) {
            console.log('⚠️ Seleção de opção bloqueada:', {
                hasQuestion: !!currentQuestion,
                isAnswering: state.isAnswering,
                hasSelection: state.selectedOption !== null
            });
            return;
        }

        console.log(`🎯 Processando seleção da opção ${optionIndex} para questão ${state.currentQuestionIndex + 1}`);

        // ⏳ Marcar como processando para evitar duplas seleções
        setState(prev => ({
            ...prev,
            selectedOption: optionIndex,
            isAnswering: true
        }));

        try {
            // 🔍 Validar resposta no backend para feedback instantâneo
            const validation = await quizService.validateQuestion(
                state.quiz!.id,
                state.currentQuestionIndex,
                optionIndex
            );

            console.log(`${validation.isCorrect ? '✅' : '❌'} Resposta ${validation.isCorrect ? 'correta' : 'incorreta'}: +${validation.points} pontos`);

            // 📊 Atualizar estado com feedback e pontuação
            setState(prev => ({
                ...prev,
                showFeedback: true,
                feedbackData: validation,
                totalScore: prev.totalScore + validation.points,
                answers: [
                    ...prev.answers,
                    {
                        questionIndex: prev.currentQuestionIndex,
                        selectedAnswer: optionIndex,
                        isCorrect: validation.isCorrect,
                        points: validation.points
                    }
                ]
            }));

            // ⏰ Tempo para o usuário ler o feedback (3s para explicação)
            setTimeout(() => {
                proceedToNextQuestion();
            }, 3000);

        } catch (error) {
            console.error('❌ Erro ao validar questão:', error);
            
            // 🛡️ Fallback: Continuar mesmo com erro para não travar o quiz
            const fallbackAnswer = {
                questionIndex: state.currentQuestionIndex,
                selectedAnswer: optionIndex,
                isCorrect: false,
                points: 0
            };

            setState(prev => ({
                ...prev,
                showFeedback: true,
                feedbackData: {
                    isCorrect: false,
                    selectedAnswer: {
                        index: optionIndex,
                        text: currentQuestion.options[optionIndex].label,
                        isCorrect: false
                    },
                    correctAnswer: {
                        index: 0,
                        text: 'Erro na validação'
                    },
                    explanation: 'Erro ao validar resposta. Tente novamente.',
                    points: 0
                },
                answers: [...prev.answers, fallbackAnswer]
            }));

            // ⏰ Tempo menor para erro (2s)
            setTimeout(() => {
                proceedToNextQuestion();
            }, 2000);
        }
    };

    // Função para avançar para próxima questão
    const proceedToNextQuestion = () => {
        setState(prev => {
            const isLastQuestion = prev.currentQuestionIndex >= (prev.quiz?.questions.length || 0) - 1;
            
            if (isLastQuestion) {
                // Finalizar quiz
                finishQuiz();
                return prev;
            } else {
                // Próxima questão
                return {
                    ...prev,
                    currentQuestionIndex: prev.currentQuestionIndex + 1,
                    selectedOption: null,
                    showFeedback: false,
                    feedbackData: null,
                    isAnswering: false
                };
            }
        });
    };

    // Função para finalizar quiz com métricas claras e cálculo correto
    const finishQuiz = () => {
        if (!state.quiz) return;

        const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        const totalQuestions = state.quiz.questions.length;
        const correctAnswers = state.answers.filter(answer => answer.isCorrect).length;
        const wrongAnswers = totalQuestions - correctAnswers;
        
        // ✅ CÁLCULO CORRETO: Garantir que 100% dos acertos = 100%
        const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        console.log(`📊 Cálculo de percentual:
        - Total de questões: ${totalQuestions}
        - Respostas corretas: ${correctAnswers}  
        - Respostas erradas: ${wrongAnswers}
        - Percentual calculado: ${percentage}%`);
        
        // Verificação de consistência
        if (correctAnswers === totalQuestions && percentage !== 100) {
            console.error('⚠️ ERRO: Todas as respostas corretas mas percentual não é 100%');
        }
        
        // Gerar feedback baseado no desempenho
        let performanceFeedback = '';
        if (percentage >= 90) {
            performanceFeedback = '🏆 Excelente! Você demonstrou domínio excepcional do conteúdo!';
        } else if (percentage >= 70) {
            performanceFeedback = '⭐ Muito bom! Você tem uma boa compreensão do material.';
        } else if (percentage >= 50) {
            performanceFeedback = '📚 Bom trabalho! Continue estudando para melhorar ainda mais.';
        } else {
            performanceFeedback = '💪 Continue se esforçando! A prática leva à perfeição.';
        }

        // Navegar para tela de resultados com dados completos
        setTimeout(() => {
            navigation.navigate('QuizResults', {
                // Métricas principais
                totalQuestions,
                correctAnswers,
                wrongAnswers,
                percentage,
                totalScore: state.totalScore,
                timeSpent,
                
                // Dados detalhados
                quizTitle: state.quiz!.title,
                answers: state.answers,
                feedback: performanceFeedback,
                
                // Informações do quiz
                quizId: state.quiz!.id,
                moduleId: moduleId,
                isDailyChallenge: moduleId === 'daily' || moduleId === 'daily-challenge' || moduleId === 'daily-challenge-mock'
            });
        }, 0);
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

    // Tela de carregamento
    if (state.isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.backButtoncontainer}>
                        <BackButton onPress={handlePressProfileHome} />
                    </View>
                    <UserInfo userName={user?.name || "Usuário"} userSubtitle="Aprendiz" />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Carregando quiz...</Text>
                </View>
            </View>
        );
    }

    // Verificação se quiz foi carregado
    if (!state.quiz || !currentQuestion) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.backButtoncontainer}>
                        <BackButton onPress={handlePressProfileHome} />
                    </View>
                    <UserInfo userName={user?.name || "Usuário"} userSubtitle="Aprendiz" />
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Quiz não encontrado</Text>
                </View>
            </View>
        );
    }

    // Cálculos para a interface
    const progress = (state.currentQuestionIndex + 1) / state.quiz.questions.length;
    const isAnswerSelected = state.selectedOption !== null;
    const isShowingFeedback = state.showFeedback && state.feedbackData;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.backButtoncontainer}>
                    <BackButton onPress={handlePressProfileHome} />
                </View>
                <UserInfo userName={user?.name || "Usuário"} userSubtitle="Aprendiz" />
            </View>

            {/* Timer e Info do Quiz */}
            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>⏱️ {formatTime(state.timeLeft)}</Text>
                <Text style={styles.scoreText}>Pontos: {state.totalScore}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
                    {`${state.currentQuestionIndex + 1}/${state.quiz?.questions.length || 0}`}
                </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Category */}
                <Text style={styles.categoryText}>{state.quiz.category}</Text>

                {/* Question */}
                <Text style={styles.question}>
                    {currentQuestion.question || currentQuestion.questionText}
                </Text>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = state.selectedOption === index;
                        const isCorrectOption = isShowingFeedback && state.feedbackData!.correctAnswer.index === index;
                        const isSelectedAndCorrect = isSelected && isShowingFeedback && state.feedbackData!.isCorrect;
                        const isSelectedAndWrong = isSelected && isShowingFeedback && !state.feedbackData!.isCorrect;

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionButton,
                                    isSelected && styles.selectedButton,
                                    isSelectedAndCorrect && styles.correctButton,
                                    isSelectedAndWrong && styles.incorrectButton,
                                    isCorrectOption && !isSelected && styles.correctAnswerButton
                                ]}
                                onPress={() => handleOptionSelect(index)}
                                disabled={state.isAnswering || isAnswerSelected}
                            >
                                <Text style={[
                                    styles.optionText,
                                    (isSelected || isCorrectOption) && styles.selectedOptionText
                                ]}>
                                    {`${String.fromCharCode(65 + index)}) ${option.label || option.optionText}`}
                                </Text>
                                {isShowingFeedback && isCorrectOption && (
                                    <Text style={styles.correctMark}>✓</Text>
                                )}
                                {isShowingFeedback && isSelectedAndWrong && (
                                    <Text style={styles.wrongMark}>✗</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Feedback Instantâneo */}
                {isShowingFeedback && state.feedbackData && (
                    <View style={styles.feedbackContainer}>
                        <View style={[
                            styles.feedbackHeader,
                            state.feedbackData.isCorrect ? styles.correctFeedback : styles.incorrectFeedback
                        ]}>
                            <Text style={styles.feedbackTitle}>
                                {state.feedbackData.isCorrect ? '🎉 Correto!' : '❌ Incorreto'}
                            </Text>
                            <Text style={styles.feedbackPoints}>
                                +{state.feedbackData.points} pontos
                            </Text>
                        </View>
                        
                        {state.feedbackData.explanation && (
                            <Text style={styles.explanationText}>
                                {state.feedbackData.explanation}
                            </Text>
                        )}
                        
                        {!state.feedbackData.isCorrect && (
                            <Text style={styles.correctAnswerText}>
                                Resposta correta: {state.feedbackData.correctAnswer.text}
                            </Text>
                        )}
                    </View>
                )}

                {/* Loading durante validação */}
                {state.isAnswering && !isShowingFeedback && (
                    <View style={styles.validatingContainer}>
                        <ActivityIndicator size="small" color="#007AFF" />
                        <Text style={styles.validatingText}>Validando resposta...</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8F9FA',
        marginHorizontal: 0,
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    timerText: {
        fontSize: Math.max(16, screenWidth * 0.04),
        fontWeight: '600',
        color: '#E5944A',
        fontFamily: 'Roboto-Medium',
    },
    scoreText: {
        fontSize: Math.max(16, screenWidth * 0.04),
        fontWeight: '600',
        color: '#007AFF',
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
    selectedButton: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
        transform: [{ scale: 1.02 }],
    },
    correctButton: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    incorrectButton: {
        backgroundColor: '#F44336',
        borderColor: '#F44336',
    },
    correctAnswerButton: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        opacity: 0.8,
    },
    correctMark: {
        position: 'absolute',
        right: 16,
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    wrongMark: {
        position: 'absolute',
        right: 16,
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    optionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: Math.max(16, screenWidth * 0.04),
        fontFamily: 'Roboto-Medium',
    },
    selectedOptionText: {
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

    explanationText: {
        fontSize: Math.max(14, screenWidth * 0.035),
        color: '#545454',
        lineHeight: Math.max(20, screenHeight * 0.025),
        fontFamily: 'Roboto-Regular',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
        fontFamily: 'Poppins-Regular',
    },
    // Estilos para feedback instantâneo
    feedbackContainer: {
        marginTop: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    feedbackHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        padding: 12,
        borderRadius: 8,
    },
    correctFeedback: {
        backgroundColor: '#E8F5E8',
    },
    incorrectFeedback: {
        backgroundColor: '#FFEBEE',
    },
    feedbackTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Roboto-Bold',
    },
    feedbackPoints: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
        fontFamily: 'Roboto-Medium',
    },
    explanationText: {
        fontSize: 14,
        color: '#545454',
        lineHeight: 20,
        marginBottom: 8,
        fontFamily: 'Roboto-Regular',
        fontStyle: 'italic',
    },
    correctAnswerText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
        fontFamily: 'Roboto-Medium',
    },
    validatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
    },
    validatingText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#666',
        fontFamily: 'Roboto-Regular',
    },
});

export default QuizScreen;
