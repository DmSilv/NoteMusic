import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
import BackButton from '../Components/BackButton/BackButton';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import quizService from '../../../services/quizService';
import AppStyles, { AppColors, AppSpacing, AppTypography, AppButtonStyles, AppButtonTextStyles } from '../../../constants/AppStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface QuizResultsProps {
    navigation: StackNavigationProp<any>;
    route: any;
}

interface QuizAnswer {
    questionIndex: number;
    selectedAnswer: number;
    isCorrect: boolean;
    points: number;
}

const QuizResults: React.FC<QuizResultsProps> = ({ navigation, route }) => {
    const { user } = useAuth();
    const {
        totalQuestions = 0,
        correctAnswers = 0,
        wrongAnswers = 0,
        percentage = 0,
        totalScore = 0,
        timeSpent = 0,
        quizTitle = 'Quiz',
        answers = [],
        feedback = 'Quiz finalizado',
        quizId = '',
        moduleId = '',
        isDailyChallenge = false
    } = route.params || {};

    // Animações
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.8);
    const progressAnim = new Animated.Value(0);

    useEffect(() => {
        // Animação de entrada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Animação da barra de progresso
        setTimeout(() => {
            Animated.timing(progressAnim, {
                toValue: percentage / 100,
                duration: 1500,
                useNativeDriver: false,
            }).start();
        }, 300);

        // Submeter resultados para o backend se usuário autenticado
        if (user && quizId && answers.length > 0) {
            submitQuizResults();
        }
    }, []);

    const submitQuizResults = async () => {
        try {
            // Converter respostas para formato esperado pelo backend
            const formattedAnswers = answers.map((answer: QuizAnswer) => answer.selectedAnswer);
            
            await quizService.submitQuiz({
                quizId,
                answers: formattedAnswers,
                timeSpent
            });
        } catch (error) {
            console.log('Erro ao submeter resultados (não crítico):', error);
        }
    };

    const getPerformanceData = () => {
        if (percentage >= 90) {
            return {
                title: 'Excelente!',
                message: '🏆 Você demonstrou domínio excepcional do conteúdo!',
                color: '#4CAF50',
                emoji: '🎉',
                grade: 'A+'
            };
        } else if (percentage >= 80) {
            return {
                title: 'Muito Bom!',
                message: '⭐ Você tem uma boa compreensão do material.',
                color: '#4CAF50',
                emoji: '👏',
                grade: 'A'
            };
        } else if (percentage >= 70) {
            return {
                title: 'Bom!',
                message: '📚 Bom trabalho! Continue estudando para melhorar.',
                color: '#FF9800',
                emoji: '👍',
                grade: 'B'
            };
        } else if (percentage >= 50) {
            return {
                title: 'Satisfatório',
                message: '💪 Continue se esforçando! Você está no caminho certo.',
                color: '#FF5722',
                emoji: '📖',
                grade: 'C'
            };
        } else {
            return {
                title: 'Precisa Melhorar',
                message: '🔄 A prática leva à perfeição! Não desista.',
                color: '#F44336',
                emoji: '💪',
                grade: 'D'
            };
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const performance = getPerformanceData();

    // Funções de navegação melhoradas e consistentes
    const handleBackToHome = () => {
        console.log('🏠 Voltando ao menu principal');
        navigation.reset({
            index: 0,
            routes: [{ name: 'ProfileHome' }],
        });
    };

    const handleRetryQuiz = () => {
        console.log('🔄 Tentando novamente o quiz');
        navigation.goBack(); // Volta para a tela do quiz atual
    };

    const handleViewModules = () => {
        console.log('📚 Navegando para módulos');
        navigation.navigate('ModuleCategory');
    };

    const handleLibraryAccess = () => {
        console.log('📖 Acessando biblioteca de conteúdo');
        // Função adicional para acesso à biblioteca
        navigation.navigate('ModuleCategory');
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <BackButton onPress={() => navigation.navigate('ProfileHome')} />
                <Text style={styles.headerTitle}>Resultados do Quiz</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Card Principal de Resultado */}
                <Animated.View 
                    style={[
                        styles.mainResultCard,
                        { 
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    <Text style={styles.emoji}>{performance.emoji}</Text>
                    <Text style={[styles.gradeText, { color: performance.color }]}>
                        {performance.grade}
                    </Text>
                    <Text style={[styles.performanceTitle, { color: performance.color }]}>
                        {performance.title}
                    </Text>
                    <Text style={styles.percentageText}>
                        {percentage}%
                    </Text>
                    <Text style={styles.feedbackText}>
                        {performance.message}
                    </Text>
                </Animated.View>

                {/* Métricas Detalhadas */}
                <Animated.View style={[styles.metricsCard, { opacity: fadeAnim }]}>
                    <Text style={styles.metricsTitle}>📊 Métricas Detalhadas</Text>
                    
                    <View style={styles.metricRow}>
                        <View style={styles.metricItem}>
                            <Text style={styles.metricNumber}>{totalQuestions}</Text>
                            <Text style={styles.metricLabel}>Total de Questões</Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={[styles.metricNumber, { color: '#4CAF50' }]}>{correctAnswers}</Text>
                            <Text style={styles.metricLabel}>Acertos</Text>
                        </View>
                        <View style={styles.metricItem}>
                            <Text style={[styles.metricNumber, { color: '#F44336' }]}>{wrongAnswers}</Text>
                            <Text style={styles.metricLabel}>Erros</Text>
                        </View>
                    </View>

                    <View style={styles.additionalMetrics}>
                        <View style={styles.additionalMetricRow}>
                            <Text style={styles.additionalMetricLabel}>Pontuação Total:</Text>
                            <Text style={styles.additionalMetricValue}>{totalScore} pontos</Text>
                        </View>
                        <View style={styles.additionalMetricRow}>
                            <Text style={styles.additionalMetricLabel}>Tempo Gasto:</Text>
                            <Text style={styles.additionalMetricValue}>{formatTime(timeSpent)}</Text>
                        </View>
                        <View style={styles.additionalMetricRow}>
                            <Text style={styles.additionalMetricLabel}>Média de Tempo:</Text>
                            <Text style={styles.additionalMetricValue}>
                                {totalQuestions > 0 ? formatTime(Math.floor(timeSpent / totalQuestions)) : '0:00'} por questão
                            </Text>
                        </View>
                        {isDailyChallenge && (
                            <View style={styles.additionalMetricRow}>
                                <Text style={styles.additionalMetricLabel}>Tipo:</Text>
                                <Text style={[styles.additionalMetricValue, { color: '#007AFF' }]}>
                                    🌟 Desafio Diário
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Barra de Progresso Animada */}
                <Animated.View style={[styles.progressCard, { opacity: fadeAnim }]}>
                    <Text style={styles.progressTitle}>Desempenho Visual</Text>
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                            <Animated.View 
                                style={[
                                    styles.progressBar,
                                    {
                                        width: progressAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0%', '100%'],
                                        }),
                                        backgroundColor: performance.color
                                    }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>{percentage}%</Text>
                    </View>
                    
                    {/* Indicadores de Performance */}
                    <View style={styles.performanceIndicators}>
                        <View style={[styles.indicator, percentage >= 90 && styles.activeIndicator]}>
                            <Text style={styles.indicatorText}>90%+</Text>
                            <Text style={styles.indicatorLabel}>Excelente</Text>
                        </View>
                        <View style={[styles.indicator, percentage >= 70 && percentage < 90 && styles.activeIndicator]}>
                            <Text style={styles.indicatorText}>70%+</Text>
                            <Text style={styles.indicatorLabel}>Bom</Text>
                        </View>
                        <View style={[styles.indicator, percentage >= 50 && percentage < 70 && styles.activeIndicator]}>
                            <Text style={styles.indicatorText}>50%+</Text>
                            <Text style={styles.indicatorLabel}>Regular</Text>
                        </View>
                        <View style={[styles.indicator, percentage < 50 && styles.activeIndicator]}>
                            <Text style={styles.indicatorText}>0%+</Text>
                            <Text style={styles.indicatorLabel}>Melhorar</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Detalhes das Respostas */}
                {answers.length > 0 && (
                    <Animated.View style={[styles.answersCard, { opacity: fadeAnim }]}>
                        <Text style={styles.answersTitle}>📝 Detalhes das Respostas</Text>
                        {answers.map((answer: QuizAnswer, index: number) => (
                            <View key={index} style={styles.answerItem}>
                                <View style={styles.answerHeader}>
                                    <Text style={styles.questionNumber}>Questão {answer.questionIndex + 1}</Text>
                                    <View style={[
                                        styles.answerStatus,
                                        { backgroundColor: answer.isCorrect ? '#4CAF50' : '#F44336' }
                                    ]}>
                                        <Text style={styles.answerStatusText}>
                                            {answer.isCorrect ? '✓' : '✗'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.answerPoints}>
                                    +{answer.points} pontos
                                </Text>
                            </View>
                        ))}
                    </Animated.View>
                )}

                {/* Botões de Ação - Padronizados e Funcionais */}
                <Animated.View style={[styles.actionButtons, { opacity: fadeAnim }]}>
                    {/* Botão Principal - Voltar ao Menu */}
                    <TouchableOpacity 
                        style={[styles.button, styles.primaryButton]} 
                        onPress={handleBackToHome}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.primaryButtonText}>🏠 Voltar ao Menu</Text>
                    </TouchableOpacity>
                    
                    {/* Botão Secundário - Tentar Novamente */}
                    <TouchableOpacity 
                        style={[styles.button, styles.secondaryButton]} 
                        onPress={handleRetryQuiz}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.secondaryButtonText}>🔄 Tentar Novamente</Text>
                    </TouchableOpacity>

                    {/* Botão Terciário - Explorar Módulos */}
                    <TouchableOpacity 
                        style={[styles.button, styles.tertiaryButton]} 
                        onPress={handleViewModules}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.tertiaryButtonText}>📚 Explorar Módulos</Text>
                    </TouchableOpacity>

                    {/* Botão Adicional - Biblioteca (apenas para quiz de módulo) */}
                    {!isDailyChallenge && (
                        <TouchableOpacity 
                            style={[styles.button, styles.quaternaryButton]} 
                            onPress={handleLibraryAccess}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.quaternaryButtonText}>📖 Biblioteca de Conteúdo</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    // Layout usando Design System
    container: {
        ...AppStyles.Layout.container,
        backgroundColor: AppColors.backgroundSecondary,
    },
    header: {
        ...AppStyles.Layout.header,
    },
    headerTitle: {
        fontSize: AppTypography.size.xl,
        fontWeight: AppTypography.weight.bold,
        color: AppColors.textPrimary,
        marginLeft: AppSpacing.lg,
        fontFamily: AppTypography.family.bold,
    },
    content: {
        flex: 1,
    },
    mainResultCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 32,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    emoji: {
        fontSize: 60,
        marginBottom: 16,
    },
    gradeText: {
        fontSize: 48,
        fontWeight: 'bold',
        fontFamily: 'Roboto-Bold',
        marginBottom: 8,
    },
    performanceTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        fontFamily: 'Roboto-Bold',
    },
    percentageText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#131313',
        fontFamily: 'Roboto-Bold',
        marginBottom: 12,
    },
    feedbackText: {
        fontSize: 16,
        color: '#545454',
        textAlign: 'center',
        lineHeight: 22,
        fontFamily: 'Roboto-Regular',
    },
    metricsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    metricsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#131313',
        marginBottom: 20,
        fontFamily: 'Roboto-Bold',
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 24,
    },
    metricItem: {
        alignItems: 'center',
    },
    metricNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#131313',
        fontFamily: 'Roboto-Bold',
    },
    metricLabel: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
        fontFamily: 'Roboto-Regular',
    },
    additionalMetrics: {
        borderTopWidth: 1,
        borderTopColor: '#F1F1F1',
        paddingTop: 16,
    },
    additionalMetricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    additionalMetricLabel: {
        fontSize: 16,
        color: '#545454',
        fontFamily: 'Roboto-Regular',
    },
    additionalMetricValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#131313',
        fontFamily: 'Roboto-Medium',
    },
    progressCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#131313',
        marginBottom: 16,
        fontFamily: 'Roboto-Bold',
    },
    progressBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    progressBarBackground: {
        flex: 1,
        height: 12,
        backgroundColor: '#E9ECEF',
        borderRadius: 6,
        overflow: 'hidden',
        marginRight: 12,
    },
    progressBar: {
        height: '100%',
        borderRadius: 6,
    },
    progressText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#131313',
        fontFamily: 'Roboto-Bold',
        minWidth: 50,
    },
    performanceIndicators: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    indicator: {
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F8F9FA',
        flex: 1,
        marginHorizontal: 2,
    },
    activeIndicator: {
        backgroundColor: '#E3F2FD',
        borderWidth: 2,
        borderColor: '#2196F3',
    },
    indicatorText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#131313',
        fontFamily: 'Roboto-Bold',
    },
    indicatorLabel: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Roboto-Regular',
    },
    answersCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    answersTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#131313',
        marginBottom: 16,
        fontFamily: 'Roboto-Bold',
    },
    answerItem: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    answerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    questionNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#131313',
        fontFamily: 'Roboto-Medium',
    },
    answerStatus: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    answerStatusText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    answerPoints: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
        fontFamily: 'Roboto-Medium',
    },
    actionButtons: {
        gap: 12,
        marginBottom: 32,
    },
    // Botões usando o Design System padronizado
    button: {
        ...AppButtonStyles.primary,
        marginVertical: AppSpacing.sm,
    },
    primaryButton: {
        ...AppButtonStyles.primary,
    },
    primaryButtonText: {
        ...AppButtonTextStyles.primary,
    },
    secondaryButton: {
        ...AppButtonStyles.secondary,
    },
    secondaryButtonText: {
        ...AppButtonTextStyles.secondary,
    },
    tertiaryButton: {
        ...AppButtonStyles.outline,
    },
    tertiaryButtonText: {
        ...AppButtonTextStyles.outline,
    },
    quaternaryButton: {
        ...AppButtonStyles.ghost,
    },
    quaternaryButtonText: {
        ...AppButtonTextStyles.ghost,
    },
});

export default QuizResults;