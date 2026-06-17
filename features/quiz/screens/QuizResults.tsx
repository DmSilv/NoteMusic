import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import quizService from '@/services/quizService';
import quizAttemptService, { QuizAttemptStatus } from '@/services/quizAttemptService';
import quizCompletionService from '@/services/quizCompletionService';

const { width: screenWidth } = Dimensions.get('window');

interface QuizResultsProps {
    navigation: NativeStackNavigationProp<any>;
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
        passed = false,
        requiredScore = 70, // ✅ Nota mínima necessária (vem do quiz)
        quizLevel = 'aprendiz' // ✅ Nível do quiz
    } = route.params || {};

    // Estados para gerenciar tentativas
    const [currentAttemptStatus, setCurrentAttemptStatus] = useState<QuizAttemptStatus | null>(null);
    const [isLastAttempt, setIsLastAttempt] = useState(false);

    // Estado para rastrear operações de envio
    const [submissionStatus, setSubmissionStatus] = useState({
        submitted: false,
        registered: false,
        error: false,
        errorMessage: ''
    });

    useEffect(() => {
        const handleSubmissions = async () => {
            try {
                // Submeter resultados para o backend se usuário autenticado
                if (user && quizId && answers.length > 0) {
                    await submitQuizResults();
                    setSubmissionStatus(prev => ({ ...prev, submitted: true }));
                }

                // Registrar tentativa e verificar status
                if (!isDailyChallenge && quizId && moduleId) {
                    await registerQuizAttempt();
                    setSubmissionStatus(prev => ({ ...prev, registered: true }));
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
                        console.log('✅ Quiz marcado como concluído no cache local:', moduleId);
                    } catch (err) {
                        console.log('⚠️ Erro ao marcar quiz como concluído no cache:', err instanceof Error ? err.message : String(err));
                    }
                }
            } catch (err) {
                console.error('❌ Erro ao processar submissões do quiz:', err);
                setSubmissionStatus(prev => ({ 
                    ...prev, 
                    error: true, 
                    errorMessage: err instanceof Error ? err.message : 'Erro desconhecido ao processar resultados'
                }));
            }
        };

        handleSubmissions();
    }, []);

    const submitQuizResults = async () => {
        try {
            console.log('📝 Submetendo resultados do quiz ao backend:', { quizId, answersCount: answers.length });
            const formattedAnswers = answers.map((answer: QuizAnswer) => answer.selectedAnswer);
            
            const result = await quizService.submitQuiz({
                quizId,
                answers: formattedAnswers,
                timeSpent
            });
            
            console.log('✅ Quiz submetido com sucesso:', result);
            return result;
        } catch (error) {
            console.error('❌ Erro ao submeter quiz:', error);
            throw error; // Propagar erro para ser tratado no useEffect
        }
    };

    const registerQuizAttempt = async () => {
        try {
            // Padronizar IDs: para quizzes por módulo, usar SEMPRE moduleId para ambos
            const uniqueQuizId = moduleId;
            const uniqueModuleId = moduleId;
            
            console.log('📊 Registrando tentativa do quiz:', { 
                quizId: uniqueQuizId, 
                moduleId: uniqueModuleId, 
                passed 
            });
            
            const attemptStatus = await quizAttemptService.registerQuizAttempt(
                uniqueQuizId, 
                uniqueModuleId, 
                passed
            );
            
            console.log('✅ Status da tentativa registrado:', attemptStatus);
            setCurrentAttemptStatus(attemptStatus);
            
            // Se passou no quiz, não é "última tentativa" - é sucesso!
            const isLast = attemptStatus.attempts.current >= attemptStatus.attempts.maxAttempts && !passed;
            setIsLastAttempt(isLast);
            
            return attemptStatus;
        } catch (error) {
            console.error('❌ Erro ao registrar tentativa do quiz:', error);
            setIsLastAttempt(true);
            throw error; // Propagar erro para ser tratado no useEffect
        }
    };

    // ✅ FUNÇÃO ESPECÍFICA PARA DESAFIO DIÁRIO
    const getPerformanceDataForDailyChallenge = () => {
        // 🏆 EXCELENTE - 90%+
        if (percentage >= 90) {
            return {
                title: 'Desempenho Excepcional!',
                message: '🌟 Você dominou o desafio de hoje! Bônus máximo conquistado!',
                color: '#FF8C00',
                emoji: '⚡',
                grade: 'S',
                icon: 'lightning-bolt' as keyof typeof MaterialCommunityIcons.glyphMap,
                bgColor: '#FFF4E6'
            };
        }
        // ✅ BOM - 70%+ (passou)
        else if (percentage >= 70) {
            return {
                title: 'Desafio Completado!',
                message: `✅ Você conquistou ${percentage}% no desafio de hoje! Volte amanhã para um novo desafio!`,
                color: '#43A047',
                emoji: '🎯',
                grade: 'A',
                icon: 'check-decagram' as keyof typeof MaterialCommunityIcons.glyphMap,
                bgColor: '#E8F5E8'
            };
        }
        // ⚠️ ABAIXO DE 70% (não passou, mas desafio é único)
        else {
            return {
                title: 'Desafio Tentado',
                message: `💪 Você conseguiu ${percentage}%. Continue praticando nos módulos e volte amanhã para um novo desafio!`,
                color: '#FF9800',
                emoji: '📚',
                grade: 'B',
                icon: 'book-open-variant' as keyof typeof MaterialCommunityIcons.glyphMap,
                bgColor: '#FFF3E0'
            };
        }
    };

    const getPerformanceData = () => {
        // ✅ SE FOR DESAFIO DIÁRIO, usar função específica
        if (isDailyChallenge) {
            return getPerformanceDataForDailyChallenge();
        }

        // ✅ EXCELENTE - 90%+ (Bônus de pontos)
        if (percentage >= 90) {
            return {
                title: 'Excelente!',
                message: '🏆 Domínio excepcional! Você ganhou bônus de pontos!',
                color: '#43A047',
                emoji: '🎉',
                grade: 'A+',
                icon: 'trophy' as keyof typeof MaterialCommunityIcons.glyphMap,
                bgColor: '#E8F5E8'
            };
        } 
        // ✅ PASSOU - Acima da meta
        else if (passed && percentage >= requiredScore) {
            return {
                title: 'Parabéns!',
                message: `✅ Você atingiu a meta de ${requiredScore}%! Módulo completado!`,
                color: '#42A5F5',
                emoji: '🎯',
                grade: 'A',
                icon: 'check-circle' as keyof typeof MaterialCommunityIcons.glyphMap,
                bgColor: '#E3F2FD'
            };
        } 
        // ⚠️ QUASE LÁ - 5% abaixo da meta
        else if (percentage >= requiredScore - 5 && percentage < requiredScore) {
            return {
                title: 'Quase Lá!',
                message: `📚 Você precisa de ${requiredScore}%. Faltou pouco!`,
                color: '#FF9800',
                emoji: '💪',
                grade: 'B',
                icon: 'book-open' as keyof typeof MaterialCommunityIcons.glyphMap,
                bgColor: '#FFF3E0'
            };
        } 
        // ⚠️ PRECISA ESTUDAR - Abaixo da meta
        else {
            return {
                title: 'Continue Estudando',
                message: `📖 Meta: ${requiredScore}%. A prática leva à perfeição!`,
                color: '#FF9800',
                emoji: '📚',
                grade: 'C',
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
        
        // Verificar se houve erro na sincronização
        if (submissionStatus.error) {
            Alert.alert(
                'Atenção',
                'Houve problemas na sincronização dos seus resultados com o servidor. Seus resultados serão enviados automaticamente quando a conexão for restabelecida.',
                [{ text: 'Entendi' }]
            );
        }
        
        // ✅ Se passou no quiz, sinalizar para atualizar status dos módulos
        // Isso permite que o próximo módulo seja desbloqueado automaticamente
        if (passed && moduleId) {
            console.log('✅ Quiz passou! Sinalizando atualização de status...');
            // Tentar navegar de volta para a lista de módulos com sinal de refresh
            try {
                navigation.navigate('ContentListCategory', {
                    refreshStatus: true,
                    completedModuleId: moduleId
                });
                return;
            } catch (error) {
                console.log('⚠️ Não foi possível voltar para ContentListCategory, voltando para Home');
            }
        }
        
        // Fallback: voltar para home
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
        <>
            <StatusBar 
                barStyle="light-content" 
                backgroundColor="#0087D3" 
                translucent={false}
                animated={true}
            />
            <SafeAreaView style={{ flex: 1, backgroundColor: '#0087D3' }}>
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
                                <MaterialCommunityIcons name="clock" size={18} color="#0087D3" />
                                <Text style={styles.detailLabel}>Tempo Gasto</Text>
                                <Text style={styles.detailValue}>{formatTime(timeSpent)}</Text>
                            </View>
                            
                            <View style={styles.detailItem}>
                                <MaterialCommunityIcons name="percent" size={18} color="#FF9800" />
                                <Text style={styles.detailLabel}>Desempenho</Text>
                                <Text style={styles.detailValue}>{percentage}%</Text>
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
                                <MaterialCommunityIcons name="star" size={18} color="#FF8C00" />
                                <Text style={styles.detailLabel}>Meta Necessária</Text>
                                <Text style={styles.detailValue}>{requiredScore}%</Text>
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
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Seção de Ações */}
                <View style={styles.actionsSection}>
                    {/* 🌟 CASO ESPECIAL: DESAFIO DIÁRIO */}
                    {isDailyChallenge ? (
                        <View style={styles.actionButtons}>
                            {/* Badge do Desafio Diário */}
                            <View style={[styles.dailyChallengeBadge, { borderColor: performance.color }]}>
                                <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FF8C00" />
                                <View style={styles.dailyChallengeContent}>
                                    <Text style={styles.dailyChallengeTitle}>
                                        {percentage >= 70 ? '✅ Desafio Concluído!' : '💪 Desafio Tentado'}
                                    </Text>
                                    <Text style={styles.dailyChallengeSubtext}>
                                        {percentage >= 70 
                                            ? `Você completou o desafio! Continue estudando para avançar de nível!`
                                            : 'Volte amanhã para um novo desafio!'}
                                    </Text>
                                </View>
                            </View>

                            {/* Informação sobre Próximo Desafio */}
                            {percentage >= 70 && (
                                <View style={styles.dailyPointsInfo}>
                                    <MaterialCommunityIcons name="calendar-clock" size={20} color="#FF8C00" />
                                    <Text style={styles.dailyPointsText}>
                                        ✅ Desafio concluído • Próximo desafio amanhã
                                    </Text>
                                </View>
                            )}

                            {/* Botão Principal - Voltar ao Menu */}
                            <TouchableOpacity 
                                style={[styles.button, styles.dailyChallengeButton]} 
                                onPress={handleBackToHome}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="home" size={20} color="#FFFFFF" />
                                <Text style={styles.primaryButtonText}>Voltar ao Menu</Text>
                            </TouchableOpacity>

                            {/* Botão Secundário - Explorar Módulos */}
                            <TouchableOpacity 
                                style={[styles.button, styles.tertiaryButton]} 
                                onPress={handleViewModules}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="book-open-variant" size={18} color="#0087D3" />
                                <Text style={styles.tertiaryButtonText}>Praticar nos Módulos</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {/* ✅ CASO 1: PASSOU NO QUIZ */}
                            {passed && (
                                <View style={styles.actionButtons}>
                                    {/* Badge de Sucesso */}
                                    <View style={styles.successBadge}>
                                        <MaterialCommunityIcons name="check-decagram" size={24} color="#43A047" />
                                        <Text style={styles.successBadgeText}>✅ Módulo Completado!</Text>
                                    </View>

                                    {/* Botão Principal - Continuar */}
                                    <TouchableOpacity 
                                        style={[styles.button, styles.successButton]} 
                                        onPress={handleFinalize}
                                        activeOpacity={0.8}
                                    >
                                        <MaterialCommunityIcons name="arrow-right-circle" size={20} color="#FFFFFF" />
                                        <Text style={styles.primaryButtonText}>Continuar Aprendendo</Text>
                                    </TouchableOpacity>

                                    {/* Botão Secundário - Explorar */}
                                    <TouchableOpacity 
                                        style={[styles.button, styles.tertiaryButton]} 
                                        onPress={handleViewModules}
                                        activeOpacity={0.8}
                                    >
                                        <MaterialCommunityIcons name="book-open-variant" size={18} color="#0087D3" />
                                        <Text style={styles.tertiaryButtonText}>Explorar Mais Módulos</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* ❌ CASO 2: NÃO PASSOU MAS TEM TENTATIVAS */}
                            {!passed && !isLastAttempt && (
                        <View style={styles.actionButtons}>
                            {/* Mensagem Motivadora */}
                            <View style={styles.motivationMessage}>
                                <MaterialCommunityIcons name="target" size={22} color="#FF9800" />
                                <View style={styles.motivationContent}>
                                    <Text style={styles.motivationTitle}>
                                        Você precisa de {requiredScore}% para passar
                                    </Text>
                                    <Text style={styles.motivationSubtext}>
                                        Tentativa {attempts?.current || 1} de {attempts?.maxAttempts || 3} • Você consegue!
                                    </Text>
                                </View>
                            </View>

                            {/* Botão Principal - Tentar Novamente (DESTAQUE) */}
                            <TouchableOpacity 
                                style={[styles.button, styles.retryButton]} 
                                onPress={handleRetryQuiz}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="refresh-circle" size={20} color="#FFFFFF" />
                                <Text style={styles.primaryButtonText}>🔄 Tentar Novamente</Text>
                            </TouchableOpacity>

                            {/* Botão Secundário - Estudar Mais */}
                            <TouchableOpacity 
                                style={[styles.button, styles.tertiaryButton]} 
                                onPress={handleViewModules}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons name="book-open" size={18} color="#0087D3" />
                                <Text style={styles.tertiaryButtonText}>📚 Estudar Mais</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                            {/* ⚠️ CASO 3: ESGOTOU TENTATIVAS */}
                            {!passed && isLastAttempt && (
                                <View style={styles.actionButtons}>
                                    {/* Mensagem de Cooldown */}
                                    <View style={styles.cooldownMessage}>
                                        <MaterialCommunityIcons name="clock-alert" size={24} color="#E65100" />
                                        <View style={styles.cooldownContent}>
                                            <Text style={styles.cooldownTitle}>
                                                ⏱️ Tentativas Esgotadas
                                            </Text>
                                            <Text style={styles.cooldownSubtext}>
                                                O quiz ficará bloqueado por 3 horas.
                                            </Text>
                                            <Text style={styles.cooldownSubtext}>
                                                💡 Aproveite este tempo para revisar o conteúdo!
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Botão Principal - Voltar */}
                                    <TouchableOpacity 
                                        style={[styles.button, styles.primaryButton]} 
                                        onPress={handleViewModules}
                                        activeOpacity={0.8}
                                    >
                                        <MaterialCommunityIcons name="arrow-left-circle" size={20} color="#FFFFFF" />
                                        <Text style={styles.primaryButtonText}>Voltar aos Módulos</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>
            </View>
        </SafeAreaView>
        </>
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
    successButton: {
        backgroundColor: '#43A047',
    },
    retryButton: {
        backgroundColor: '#FF9800',
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
    // ✅ Badge de Sucesso
    successBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F5E8',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        gap: 12,
        borderWidth: 2,
        borderColor: '#43A047',
    },
    successBadgeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#43A047',
    },
    // 💪 Mensagem Motivadora
    motivationMessage: {
        flexDirection: 'row',
        backgroundColor: '#FFF3E0',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
        gap: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    motivationContent: {
        flex: 1,
    },
    motivationTitle: {
        fontSize: 15,
        color: '#E65100',
        fontWeight: '700',
        marginBottom: 4,
    },
    motivationSubtext: {
        fontSize: 13,
        color: '#F57C00',
        fontWeight: '500',
    },
    // ⏱️ Mensagem de Cooldown
    cooldownMessage: {
        flexDirection: 'row',
        backgroundColor: '#FFF3E0',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'flex-start',
        gap: 12,
        borderWidth: 2,
        borderColor: '#FF9800',
    },
    cooldownContent: {
        flex: 1,
    },
    cooldownTitle: {
        fontSize: 16,
        color: '#E65100',
        fontWeight: '700',
        marginBottom: 8,
    },
    cooldownSubtext: {
        fontSize: 14,
        color: '#F57C00',
        marginTop: 4,
        lineHeight: 20,
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
    // 🌟 Estilos específicos para Desafio Diário
    dailyChallengeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF4E6',
        padding: 18,
        borderRadius: 12,
        marginBottom: 16,
        gap: 14,
        borderWidth: 3,
        borderLeftWidth: 6,
    },
    dailyChallengeContent: {
        flex: 1,
    },
    dailyChallengeTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#E65100',
        marginBottom: 4,
    },
    dailyChallengeSubtext: {
        fontSize: 14,
        color: '#F57C00',
        fontWeight: '500',
    },
    dailyPointsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF4E6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    dailyPointsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E65100',
    },
    dailyChallengeButton: {
        backgroundColor: '#FF8C00',
    },
});

export default QuizResults;