import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import quizService from '../../../services/quizService';
import quizAttemptService, { QuizAttemptStatus } from '../../../services/quizAttemptService';
import quizCompletionService from '../../../services/quizCompletionService';

const { width: screenWidth } = Dimensions.get('window');

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
        isDailyChallenge = false,
        attempts = { current: 1, remaining: 2, maxAttempts: 3, cooldownUntil: null },
        passed = false
    } = route.params || {};

    // Estados para gerenciar tentativas
    const [currentAttemptStatus, setCurrentAttemptStatus] = useState<QuizAttemptStatus | null>(null);
    const [isLastAttempt, setIsLastAttempt] = useState(false);

    useEffect(() => {
        // Submeter resultados para o backend se usuário autenticado
        if (user && quizId && answers.length > 0) {
            submitQuizResults();
        }

        // Registrar tentativa e verificar status
        if (!isDailyChallenge && quizId && moduleId) {
            registerQuizAttempt();
        }

        // Otimista: se passou, marcar como concluído no cache local para refletir na lista
        if (!isDailyChallenge && moduleId && passed) {
            try {
                quizCompletionService.markQuizAsCompleted(moduleId, {
                    quizId: moduleId,
                    score: correctAnswers,
                    percentage,
                    passed: true,
                    completedAt: new Date().toISOString()
                });
            } catch {}
        }
    }, []);

    const submitQuizResults = async () => {
        try {
            const formattedAnswers = answers.map((answer: QuizAnswer) => answer.selectedAnswer);
            
            await quizService.submitQuiz({
                quizId,
                answers: formattedAnswers,
                timeSpent
            });
        } catch (error) {
            // Falha silenciosa
        }
    };

    const registerQuizAttempt = async () => {
        try {
            // Padronizar IDs: para quizzes por módulo, usar SEMPRE moduleId para ambos
            const uniqueQuizId = moduleId;
            const uniqueModuleId = moduleId;
            
            const attemptStatus = await quizAttemptService.registerQuizAttempt(
                uniqueQuizId, 
                uniqueModuleId, 
                passed
            );
            
            setCurrentAttemptStatus(attemptStatus);
            
            // Se passou no quiz, não é "última tentativa" - é sucesso!
            const isLast = attemptStatus.attempts.current >= attemptStatus.attempts.maxAttempts && !passed;
            setIsLastAttempt(isLast);
            
        } catch (error) {
            setIsLastAttempt(true);
        }
    };

    const getPerformanceData = () => {
        if (percentage >= 90) {
            return {
                title: 'Excelente!',
                message: 'Você demonstrou domínio excepcional do conteúdo!',
                color: '#43A047', // Verde - sucesso
                emoji: '🎉',
                grade: 'A+',
                icon: 'trophy' as keyof typeof MaterialCommunityIcons.glyphMap,
                bgColor: '#E8F5E8'
            };
        } else if (percentage >= 80) {
            return {
                title: 'Muito Bom!',
                message: 'Você tem uma boa compreensão do material.',
                color: '#42A5F5', // Azul - confiança
                emoji: '👏',
                grade: 'A',
                icon: 'star' as keyof typeof MaterialCommunityIcons.glyphMap,
                bgColor: '#E3F2FD'
            };
        } else if (percentage >= 70) {
            return {
                title: 'Bom!',
                message: 'Bom trabalho! Continue estudando para melhorar.',
                color: '#0087D3', // Azul principal do app
                emoji: '👍',
                grade: 'B',
                icon: 'thumb-up' as keyof typeof MaterialCommunityIcons.glyphMap,
                bgColor: '#E3F2FD'
            };
        } else if (percentage >= 50) {
            return {
                title: 'Satisfatório',
                message: 'Continue se esforçando! Você está no caminho certo.',
                color: '#FF9800', // Laranja - motivação
                emoji: '📖',
                grade: 'C',
                icon: 'book-open' as keyof typeof MaterialCommunityIcons.glyphMap,
                bgColor: '#FFF3E0'
            };
        } else {
            return {
                title: 'Precisa Melhorar',
                message: 'A prática leva à perfeição! Não desista.',
                color: '#FF9800', // Laranja - encorajamento, não punição
                emoji: '💪',
                grade: 'D',
                icon: 'school' as keyof typeof MaterialCommunityIcons.glyphMap,
                bgColor: '#FFF3E0'
            };
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const performance = getPerformanceData();

    // Funções de navegação
    const handleBackToHome = () => {
        console.log('🏠 Voltando ao menu principal');
        navigation.reset({
            index: 0,
            routes: [{ name: 'ProfileHome' }],
        });
    };

    const handleFinalize = () => {
        console.log('✅ Finalizando quiz...');
        handleBackToHome();
    };

    const handleRetryQuiz = () => {
        console.log('🔄 Tentando novamente o quiz');
        
        if (isLastAttempt) {
            Alert.alert(
                '⚠️ Última Tentativa!',
                'Esta é sua última tentativa para este quiz. Após falhar, você terá que aguardar 30 minutos antes de tentar novamente. Deseja continuar?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                        text: 'Sim, Tentar Novamente', 
                        style: 'destructive',
                        onPress: () => proceedWithRetry()
                    }
                ]
            );
        } else {
            Alert.alert(
                '🔄 Tentar Novamente',
                'Você tem 2 tentativas para este quiz. Deseja tentar novamente agora?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                        text: 'Sim, Tentar Novamente', 
                        onPress: () => proceedWithRetry()
                    }
                ]
            );
        }
    };

    const proceedWithRetry = () => {
        console.log('🔄 Executando retry do quiz...');
        
        navigation.reset({
            index: 1,
            routes: [
                { name: 'ProfileHome' },
                { 
                    name: 'Quiz', 
                    params: { 
                        moduleId, 
                        isRetry: true,
                        attemptStatus: currentAttemptStatus,
                        timestamp: Date.now()
                    } 
                }
            ],
        });
    };

    const handleViewModules = () => {
        console.log('📚 Navegando para módulos');
        navigation.reset({
            index: 1,
            routes: [
                { name: 'ProfileHome' },
                { name: 'ModuleCategory' }
            ],
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollView} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header com ícone e título */}
                <View style={styles.header}>
                    <View style={styles.headerIconContainer}>
                        <MaterialCommunityIcons 
                            name="clipboard-check" 
                            size={28} 
                            color="#0087D3" 
                        />
                    </View>
                    <Text style={styles.headerTitle}>Resultados do Quiz</Text>
                    <Text style={styles.headerSubtitle}>{quizTitle}</Text>
                </View>

                {/* Card Principal de Resultado */}
                <View style={[styles.mainResultCard, { backgroundColor: performance.bgColor }]}>
                    <View style={styles.performanceIconContainer}>
                        <MaterialCommunityIcons 
                            name={performance.icon} 
                            size={40} 
                            color={performance.color} 
                        />
                    </View>
                    
                    <View style={styles.performanceContent}>
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
                    </View>
                </View>

                {/* Seção de Estatísticas - Organizada como ProfileHome */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>📊 Estatísticas do Quiz</Text>
                    
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons name="help-circle" size={20} color="#0087D3" />
                            <Text style={styles.statValue}>{totalQuestions}</Text>
                            <Text style={styles.statLabel}>Questões</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons name="check-circle" size={20} color="#43A047" />
                            <Text style={[styles.statValue, { color: '#43A047' }]}>{correctAnswers}</Text>
                            <Text style={styles.statLabel}>Acertos</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons name="close-circle" size={20} color="#FF9800" />
                            <Text style={[styles.statValue, { color: '#FF9800' }]}>{wrongAnswers}</Text>
                            <Text style={styles.statLabel}>Erros</Text>
                        </View>
                    </View>
                </View>

                {/* Seção de Detalhes - Organizada como ProfileHome */}
                <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>📋 Detalhes do Desempenho</Text>
                    
                    <View style={styles.detailCard}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <MaterialCommunityIcons name="trophy" size={18} color="#FF8C00" />
                                <Text style={styles.detailLabel}>Pontuação Total</Text>
                                <Text style={styles.detailValue}>{totalScore} pontos</Text>
                            </View>
                            
                            <View style={styles.detailItem}>
                                <MaterialCommunityIcons name="clock" size={18} color="#0087D3" />
                                <Text style={styles.detailLabel}>Tempo Gasto</Text>
                                <Text style={styles.detailValue}>{formatTime(timeSpent)}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <MaterialCommunityIcons name="timer" size={18} color="#42A5F5" />
                                <Text style={styles.detailLabel}>Média por Questão</Text>
                                <Text style={styles.detailValue}>
                                    {totalQuestions > 0 ? formatTime(Math.floor(timeSpent / totalQuestions)) : '0:00'}
                                </Text>
                            </View>
                            
                            <View style={styles.detailItem}>
                                <MaterialCommunityIcons name="percent" size={18} color="#43A047" />
                                <Text style={styles.detailLabel}>Taxa de Acerto</Text>
                                <Text style={styles.detailValue}>
                                    {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                                </Text>
                            </View>
                        </View>
                        
                        {/* Informações sobre tentativas e tipo de quiz - mais claras */}
                        <View style={styles.quizInfoContainer}>
                            {isDailyChallenge ? (
                                <View style={styles.quizInfoItem}>
                                    <MaterialCommunityIcons name="star" size={16} color="#FF8C00" />
                                    <Text style={styles.quizInfoText}>🌟 Desafio Diário Completo</Text>
                                </View>
                            ) : (
                                <View style={styles.quizInfoItem}>
                                    <MaterialCommunityIcons name="repeat" size={16} color="#0087D3" />
                                    <Text style={styles.quizInfoText}>
                                        🔄 Tentativa {attempts?.current || 1} de {attempts?.maxAttempts || 2}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Seção de Respostas - Organizada como ProfileHome */}
                {answers.length > 0 && (
                    <View style={styles.answersSection}>
                        <Text style={styles.sectionTitle}>📝 Respostas Detalhadas</Text>
                        
                        <View style={styles.answersCard}>
                            {answers.map((answer: QuizAnswer, index: number) => (
                                <View key={index} style={styles.answerItem}>
                                    <View style={styles.answerHeader}>
                                        <Text style={styles.questionNumber}>Questão {answer.questionIndex + 1}</Text>
                                        <View style={[
                                            styles.answerStatus,
                                            { backgroundColor: answer.isCorrect ? '#43A047' : '#FF9800' }
                                        ]}>
                                            <MaterialCommunityIcons 
                                                name={answer.isCorrect ? "check" : "close"} 
                                                size={14} 
                                                color="#FFFFFF" 
                                            />
                                        </View>
                                    </View>
                                    <Text style={styles.answerPoints}>
                                        +{answer.points} pontos
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Seção de Ações */}
                <View style={styles.actionsSection}>
                    <View style={styles.actionButtons}>
                        {/* Botão Principal - Finalizar */}
                        <TouchableOpacity 
                            style={[styles.button, styles.primaryButton]} 
                            onPress={handleFinalize}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
                            <Text style={styles.primaryButtonText}>Finalizar</Text>
                        </TouchableOpacity>
                        
                        {/* Botão Secundário - Tentar Novamente (apenas se disponível) */}
                        {!isLastAttempt && !passed && (
                            <TouchableOpacity 
                                style={[styles.button, styles.secondaryButton]} 
                                onPress={handleRetryQuiz}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
                                <Text style={styles.secondaryButtonText}>Tentar Novamente</Text>
                            </TouchableOpacity>
                        )}

                        {/* Mensagem quando não pode tentar - APENAS se não passou */}
                        {isLastAttempt && !passed && (
                            <View style={styles.statusMessage}>
                                <MaterialCommunityIcons name="alert-circle" size={18} color="#FF9800" />
                                <View style={styles.statusMessageContent}>
                                    <Text style={styles.statusMessageText}>
                                        Você esgotou suas tentativas para este quiz
                                    </Text>
                                    <Text style={styles.statusMessageSubtext}>
                                        O quiz ficará bloqueado por 30 minutos. Aproveite para estudar!
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Botão Terciário - Explorar Módulos */}
                        <TouchableOpacity 
                            style={[styles.button, styles.tertiaryButton]} 
                            onPress={handleViewModules}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="book-open" size={18} color="#0087D3" />
                            <Text style={styles.tertiaryButtonText}>Explorar Módulos</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 32,
    },
    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    headerIconContainer: {
        backgroundColor: '#C6E8FF',
        padding: 12,
        borderRadius: 50,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0087D3',
        textAlign: 'center',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
    mainResultCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        alignItems: 'center',
        elevation: 2,
        shadowOpacity: 0.07,
        shadowRadius: 6,
    },
    performanceIconContainer: {
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 50,
        marginBottom: 16,
        elevation: 1,
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    performanceContent: {
        alignItems: 'center',
    },
    gradeText: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    performanceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    percentageText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0087D3',
        marginBottom: 12,
    },
    feedbackText: {
        fontSize: 14,
        color: '#545454',
        textAlign: 'center',
        lineHeight: 20,
    },
    statsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0087D3',
        marginBottom: 16,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    statCard: {
        flex: 1,
        maxWidth: 120,
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        elevation: 2,
        shadowOpacity: 0.07,
        shadowRadius: 6,
        minWidth: 100,
    },
    statValue: {
        fontSize: 18,
        color: '#0087D3',
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#545454',
        textAlign: 'center',
    },
    detailsSection: {
        marginBottom: 24,
    },
    detailCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        elevation: 2,
        shadowOpacity: 0.07,
        shadowRadius: 6,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailItem: {
        flex: 1,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 12,
        color: '#545454',
        marginTop: 6,
        marginBottom: 4,
        textAlign: 'center',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0087D3',
        textAlign: 'center',
    },
    quizInfoContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F1F1',
    },
    quizInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    quizInfoText: {
        fontSize: 14,
        color: '#545454',
        fontWeight: '500',
    },
    answersSection: {
        marginBottom: 24,
    },
    answersCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowOpacity: 0.07,
        shadowRadius: 6,
    },
    answerItem: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    answerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    questionNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0087D3',
        marginRight: 8,
    },
    answerStatus: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    answerPoints: {
        fontSize: 12,
        color: '#43A047',
        fontWeight: '600',
    },
    actionsSection: {
        marginBottom: 20,
    },
    actionButtons: {
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        elevation: 2,
        gap: 8,
    },
    primaryButton: {
        backgroundColor: '#0087D3',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: '#43A047',
    },
    secondaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    tertiaryButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#0087D3',
    },
    tertiaryButtonText: {
        color: '#0087D3',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusMessage: {
        flexDirection: 'row',
        backgroundColor: '#FFF3E0',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
        alignItems: 'center',
        gap: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    statusMessageContent: {
        flex: 1,
    },
    statusMessageText: {
        fontSize: 14,
        color: '#E65100',
        fontWeight: '600',
    },
    statusMessageSubtext: {
        fontSize: 12,
        color: '#E65100',
        marginTop: 2,
    },
});

export default QuizResults;