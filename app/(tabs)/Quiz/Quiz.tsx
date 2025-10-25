import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserInfo from '../Components/UserInfo/Userinfo';
import BackButton from '../Components/BackButton/BackButton';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import quizService from '../../../services/quizService';
import quizAttemptService from '../../../services/quizAttemptService';
import { Quiz, QuizQuestion, QuestionValidationResult } from '../../../services/api';
import AppStyles, { AppColors, AppSpacing, AppTypography } from '../../../constants/AppStyles';
import { getLevelColors, formatLevelDisplay } from '../../../constants/LevelColors';

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
    isAnswering: boolean;
    retryCount: number; // Adicionado para controlar tentativas
    nextQuestionCountdown: number; // Countdown para próxima questão
    showCountdown: boolean; // Se deve mostrar o countdown
}

const QuizScreen: React.FC<QuizScreenProps> = ({ navigation, route }) => {
    const { user } = useAuth();
    
    // Obter cores baseadas no nível do usuário
    const userLevel = user?.level || 'aprendiz';
    const levelColors = getLevelColors(userLevel);
    
    const [startTime] = useState<Date>(new Date());
    const moduleId = route.params?.moduleId;
    const isRetry = route.params?.isRetry || false;
    const passedAttemptStatus = route.params?.attemptStatus;
    
    // ✅ REFERÊNCIA para garantir acesso ao estado mais recente
    const stateRef = useRef<QuizState>({
        quiz: null,
        currentQuestionIndex: 0,
        selectedOption: null,
        showFeedback: false,
        feedbackData: null,
        answers: [],
        totalScore: 0,
        timeLeft: 300,
        isLoading: true,
        isAnswering: false,
        retryCount: 0,
        nextQuestionCountdown: 0,
        showCountdown: false
    });
    
    // Estado centralizado do quiz
    const [state, setState] = useState<QuizState>(() => {
        const initialState = {
            quiz: null,
            currentQuestionIndex: 0,
            selectedOption: null,
            showFeedback: false,
            feedbackData: null,
            answers: [],
            totalScore: 0,
            timeLeft: 300,
            isLoading: true,
            isAnswering: false,
            retryCount: 0,
            nextQuestionCountdown: 0,
            showCountdown: false
        };
        
        // ✅ Atualizar a referência sempre que o estado mudar
        stateRef.current = initialState;
        return initialState;
    });

    // ✅ Effect para manter a referência sincronizada
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Questão atual
    const currentQuestion = state.quiz?.questions[state.currentQuestionIndex];

    // Função para carregar o quiz com limitação de tentativas
    const loadQuiz = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));
            let quizData: Quiz | null = null;

            if (moduleId === 'daily' || moduleId === 'daily-challenge' || moduleId === 'daily-challenge-mock') {
                const daily = await quizService.getDailyChallenge();
                quizData = { ...daily, id: daily.id || 'daily-challenge-mock' } as Quiz;
            } else {
                quizData = await quizService.getQuiz(moduleId);
            }

            if (quizData && Array.isArray(quizData.questions) && quizData.questions.length > 0) {
                // Verificar se as perguntas estão sendo carregadas corretamente
                console.log(`📊 Quiz carregado: ${quizData.title} com ${quizData.questions.length} perguntas`);
                quizData.questions.forEach((q, i) => {
                    console.log(`   Pergunta ${i + 1}: ${q.question?.substring(0, 30)}... (${q.options.length} opções)`);
                });
                
                // ✅ IMPORTANTE: NÃO embaralhar perguntas - manter ordem original
                // O backend não envia isCorrect nas opções por segurança
                // A validação é feita no backend usando o índice da pergunta
                // Embaralhar as perguntas quebraria a correspondência de índices
                
                console.log(`📊 Total de perguntas recebidas: ${quizData.questions.length}`);
                
                // Usar as perguntas na ordem original para manter sincronização com backend
                const questions = quizData.questions.map((question, idx) => {
                   console.log(`   Pergunta ${idx}: "${question.question?.substring(0, 40)}..." - ${question.options.length} opções`);
                   return { ...question };
                });
                
                setState(prev => ({
                    ...prev,
                    quiz: {...quizData, questions: questions},
                    isLoading: false,
                    timeLeft: (quizData?.timeLimit) || 300,
                    answers: [],
                    retryCount: 0 // ✅ Resetar contador de tentativas em caso de sucesso
                }));
            } else {
                throw new Error('Dados do quiz inválidos ou vazios');
            }
        } catch (error) {
            console.error('Erro ao carregar quiz:', error);
            
            // ✅ Verificar se ainda há tentativas disponíveis e mostrar alerta apropriado
            setState(prev => {
                const newRetryCount = prev.retryCount + 1;
                
                // ✅ Mostrar alerta apropriado baseado no número de tentativas
                if (newRetryCount <= 1) {
                    // ✅ Primeira tentativa - permitir tentar novamente
                    setTimeout(() => {
                        Alert.alert(
                            'Erro ao Carregar Quiz',
                            'Não foi possível carregar o quiz. Verifique sua conexão e tente novamente.',
                            [
                                { text: 'Tentar Novamente', onPress: loadQuiz },
                                { text: 'Voltar', onPress: () => navigation.goBack() }
                            ]
                        );
                    }, 0);
                } else {
                    // ✅ Sem mais tentativas - apenas voltar
                    setTimeout(() => {
                        Alert.alert(
                            'Erro ao Carregar Quiz',
                            'Não foi possível carregar o quiz após várias tentativas. Verifique sua conexão e tente novamente mais tarde.',
                            [
                                { text: 'Voltar', onPress: () => navigation.goBack() }
                            ]
                        );
                    }, 0);
                }
                
                return { 
                    ...prev, 
                    isLoading: false,
                    retryCount: newRetryCount
                };
            });
        }
    }, [moduleId, navigation]);

    // Effect para validação inicial e carregamento com guard de cooldown
    useEffect(() => {
        (async () => {
            if (!moduleId || moduleId === 'default') {
                setTimeout(() => {
                    Alert.alert('Erro', 'ID do módulo inválido. Volte e tente novamente.');
                    navigation.goBack();
                }, 0);
                return;
            }

            // Guard imediato via params
            if (passedAttemptStatus) {
                if (passedAttemptStatus.reason === 'completed') {
                    Alert.alert('Quiz Concluído', 'Este quiz já foi completado com sucesso!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
                    return;
                }
                if (passedAttemptStatus.attempts?.cooldownUntil) {
                    const cooldownEnd = new Date(passedAttemptStatus.attempts.cooldownUntil);
                    if (Date.now() < cooldownEnd.getTime()) {
                        const minutes = Math.ceil((cooldownEnd.getTime() - Date.now()) / 60000);
                        Alert.alert('⏰ Quiz em Cooldown', `Aguarde ${minutes} minuto(s) para tentar novamente.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
                        return;
                    }
                }
            }

            // Checagem local de cooldown
            try {
                const cooldownInfo = await quizAttemptService.getCooldownInfo(moduleId, moduleId);
                if (cooldownInfo.isOnCooldown) {
                    const timeStr = `${cooldownInfo.timeRemaining.minutes}:${cooldownInfo.timeRemaining.seconds.toString().padStart(2, '0')}`;
                    Alert.alert('⏰ Quiz em Cooldown', `Este quiz está bloqueado por ${timeStr} minutos.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
                    return;
                }
            } catch {}

            // ✅ VERIFICAR TENTATIVAS NO BACKEND se for retry
            if (isRetry && moduleId !== 'daily-challenge' && moduleId !== 'daily-challenge-mock') {
                checkBackendAttempts();
            } else {
                loadQuiz();
            }
        })();
    }, [loadQuiz, isRetry, moduleId, passedAttemptStatus, navigation]);

    // ✅ FUNÇÃO PARA VERIFICAR TENTATIVAS NO BACKEND (COOLDOWN ESPECÍFICO POR QUIZ)
    const checkBackendAttempts = async () => {
        try {
            console.log('🔍 Verificando tentativas no backend para quiz específico...');
            
            // Primeiro verificamos localmente o status de cooldown
            try {
                const status = await quizAttemptService.canAttemptQuiz(moduleId, moduleId);
                console.log('✅ Status obtido do serviço:', status);
                
                // Se não pode tentar e está em cooldown, mostrar timer
                if (!status.canAttempt && status.reason === 'cooldown') {
                    const cooldownInfo = await quizAttemptService.getCooldownInfo(moduleId, moduleId);
                    const timeStr = `${cooldownInfo.timeRemaining.minutes}:${cooldownInfo.timeRemaining.seconds.toString().padStart(2, '0')}`;
                    
                    Alert.alert(
                        '⏰ Quiz em Cooldown',
                        `Este quiz está bloqueado temporariamente.\n\nTempo restante: ${timeStr}\n\n💡 Outros quizzes não são afetados!`,
                        [{ text: 'Voltar', onPress: () => navigation.goBack() }]
                    );
                    return;
                }
            } catch (statusError) {
                console.log('⚠️ Erro ao verificar status local:', statusError);
                // Continuar com a verificação dos parâmetros
            }
            
            // ✅ VERIFICAÇÃO ESPECÍFICA POR QUIZ - não afeta outros quizzes
            const attemptsFromParams = route.params?.attemptStatus?.attempts;
            if (attemptsFromParams?.cooldownUntil) {
                const cooldownEnd = new Date(attemptsFromParams.cooldownUntil);
                const now = new Date();
                
                if (now < cooldownEnd) {
                    // ✅ COOLDOWN ATIVO APENAS PARA ESTE QUIZ - Mostrar timer e bloquear
                    const timeRemaining = Math.ceil((cooldownEnd.getTime() - now.getTime()) / (1000 * 60));
                    
                    Alert.alert(
                        '⏰ Quiz em Cooldown',
                        `Este quiz específico está em suspensão temporária.\n\nAguarde ${timeRemaining} minutos antes de tentar novamente.\n\n💡 Outros quizzes não são afetados!`,
                        [
                            { 
                                text: 'Voltar ao Menu', 
                                onPress: () => navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'ProfileHome' }]
                                })
                            }
                        ]
                    );
                    return;
                }
            }
            
            // ✅ COOLDOWN EXPIRADO PARA ESTE QUIZ - Permitir carregar quiz
            console.log('✅ Cooldown expirado para este quiz específico - carregando quiz...');
            loadQuiz();
            
        } catch (error) {
            console.error('❌ Erro ao verificar tentativas:', error);
            
            // Mostrar alerta com informação mais detalhada
            Alert.alert(
                'Erro ao verificar quiz',
                'Não foi possível verificar se você pode iniciar este quiz. Vamos tentar carregá-lo mesmo assim.',
                [
                    { text: 'Continuar', onPress: () => loadQuiz() },
                    { text: 'Voltar', onPress: () => navigation.goBack() }
                ]
            );
        }
    };

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
     * 🎯 Função otimizada para processar seleção de opção
     * Resolve problemas de timing e sincronização
     */
    const handleOptionSelect = useCallback(async (optionIndex: number) => {
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

        // ⏳ Marcar como processando
        setState(prev => ({
            ...prev,
            selectedOption: optionIndex,
            isAnswering: true
        }));

        try {
            // 🔍 Validar resposta no backend
            const validation = await quizService.validateQuestion(
                state.quiz!.id,
                state.currentQuestionIndex,
                optionIndex
            );

            console.log(`${validation.isCorrect ? '✅' : '❌'} Resposta ${validation.isCorrect ? 'correta' : 'incorreta'}: +${validation.points} pontos`);

            // 📊 Atualizar estado com nova resposta
            setState(prev => {
                const newAnswers = [
                    ...prev.answers,
                    {
                        questionIndex: prev.currentQuestionIndex,
                        selectedAnswer: optionIndex,
                        isCorrect: validation.isCorrect,
                        points: validation.points
                    }
                ];
                
                console.log('🔍 Estado atualizado:');
                console.log('  Questão atual:', prev.currentQuestionIndex + 1);
                console.log('  Resposta selecionada:', optionIndex);
                console.log('  Validação:', validation.isCorrect);
                console.log('  Total de respostas:', newAnswers.length);
                console.log('  Respostas corretas:', newAnswers.filter(a => a.isCorrect).length);
                console.log('  Todas as respostas:', newAnswers);
                
                // 🔍 Verificar se é a última questão
                const isLastQuestion = prev.currentQuestionIndex >= (prev.quiz?.questions.length || 0) - 1;
                console.log(`  É a última questão? ${isLastQuestion}`);
                console.log(`  Questão atual: ${prev.currentQuestionIndex + 1}/${prev.quiz?.questions.length}`);
                
                // Se for a última questão, finalizar com delay maior e countdown
                if (isLastQuestion) {
                    console.log('🎯 Última questão - finalizando quiz...');
                    // ✅ DELAY MAIOR + COUNTDOWN para última questão
                    const finalDelay = 4; // 4 segundos
                    startCountdown(finalDelay, () => {
                        const currentState = stateRef.current;
                        console.log('🔍 Estado final antes de finalizar:', currentState.answers);
                        finishQuiz();
                    });
                } else {
                    // ✅ DELAY MAIOR + COUNTDOWN entre questões
                    const betweenDelay = 4; // 4 segundos
                    startCountdown(betweenDelay, () => {
                        proceedToNextQuestion();
                    });
                }
                
                return {
                    ...prev,
                    showFeedback: true,
                    feedbackData: validation,
                    totalScore: prev.totalScore + validation.points,
                    answers: newAnswers
                };
            });

        } catch (error) {
            console.error('❌ Erro ao validar questão:', error);
            
            // 🛡️ Fallback para erro
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

            setTimeout(() => {
                proceedToNextQuestion();
            }, 2000);
        }
    }, [currentQuestion, state.isAnswering, state.selectedOption, state.quiz, state.currentQuestionIndex]);

    // ✅ Função para iniciar countdown visual
    const startCountdown = useCallback((seconds: number, callback: () => void) => {
        setState(prev => ({
            ...prev,
            showCountdown: true,
            nextQuestionCountdown: seconds
        }));

        let remaining = seconds;
        const countdownInterval = setInterval(() => {
            remaining -= 1;
            
            if (remaining > 0) {
                setState(prev => ({
                    ...prev,
                    nextQuestionCountdown: remaining
                }));
            } else {
                clearInterval(countdownInterval);
                setState(prev => ({
                    ...prev,
                    showCountdown: false,
                    nextQuestionCountdown: 0
                }));
                callback();
            }
        }, 1000);
    }, []);

    // ✅ Função otimizada para avançar para próxima questão
    const proceedToNextQuestion = useCallback(() => {
        setState(prev => {
            const isLastQuestion = prev.currentQuestionIndex >= (prev.quiz?.questions.length || 0) - 1;
            
            if (isLastQuestion) {
                console.log('⚠️ proceedToNextQuestion chamado para última questão - finalizando quiz');
                // Se for a última questão, finalizar o quiz em vez de tentar avançar
                setTimeout(() => {
                    finishQuiz();
                }, 300);
                return prev;
            } else {
                console.log('✅ Avançando para próxima questão');
                return {
                    ...prev,
                    currentQuestionIndex: prev.currentQuestionIndex + 1,
                    selectedOption: null,
                    showFeedback: false,
                    feedbackData: null,
                    isAnswering: false,
                    showCountdown: false,
                    nextQuestionCountdown: 0
                };
            }
        });
    }, [finishQuiz]);

    // ✅ Função otimizada para finalizar quiz
    const finishQuiz = useCallback(() => {
        const currentState = stateRef.current;
        if (!currentState.quiz) return;

        const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        const totalQuestions = currentState.quiz.questions.length;
        
        // ✅ CONTAGEM CORRETA: Contar respostas corretas e erradas individualmente
        const correctAnswers = currentState.answers.filter(answer => answer.isCorrect).length;
        const wrongAnswers = currentState.answers.filter(answer => !answer.isCorrect).length;
        
        // ✅ CÁLCULO CORRETO: Garantir que 100% dos acertos = 100%
        const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        
        // ✅ USAR PASSING SCORE DO QUIZ (flexível por nível)
        const requiredScore = currentState.quiz?.passingScore || 70;
        const passed = percentage >= requiredScore;
        console.log(`📊 Nota necessária: ${requiredScore}% | Obtida: ${percentage}% | Passou: ${passed}`);
        
        // Gerar feedback baseado no desempenho
        let performanceFeedback = '';
        if (percentage >= 90) {
            performanceFeedback = '🏆 Excelente! Você demonstrou domínio excepcional do conteúdo!';
        } else if (percentage >= requiredScore) {
            performanceFeedback = `⭐ Muito bom! Você atingiu a meta de ${requiredScore}%!`;
        } else if (percentage >= 50) {
            performanceFeedback = `📚 Bom esforço! Você precisa de ${requiredScore}% para passar.`;
        } else {
            performanceFeedback = `💪 Continue estudando! Meta: ${requiredScore}%`;
        }

        // ✅ VERIFICAR SE É DESAFIO DIÁRIO E CHAMAR CALLBACK
        const isDailyChallenge = moduleId === 'daily' || moduleId === 'daily-challenge' || moduleId === 'daily-challenge-mock';
        
        // Se for desafio diário e tiver callback, chamar imediatamente
        if (isDailyChallenge && route.params?.onComplete) {
            route.params.onComplete();
        }

        // Navegar para tela de resultados
        setTimeout(() => {
            navigation.replace('QuizResults', {
                totalQuestions,
                correctAnswers,
                wrongAnswers,
                percentage,
                totalScore: currentState.totalScore,
                timeSpent,
                quizTitle: currentState.quiz!.title,
                answers: currentState.answers,
                feedback: performanceFeedback,
                quizId: currentState.quiz!.id,
                moduleId: moduleId,
                isDailyChallenge,
                passed,
                requiredScore, // ✅ Nota mínima necessária
                quizLevel: currentState.quiz?.level || 'aprendiz', // ✅ Nível do quiz
                fromQuiz: true
            });
        }, 0);
    }, [startTime, moduleId, navigation]);

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
                    <UserInfo userName={user?.name || "Usuário"} userSubtitle={formatLevelDisplay(user?.level || "aprendiz")} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={levelColors.primary} />
                    <Text style={styles.loadingText}>Carregando quiz...</Text>
                    {state.retryCount > 0 && (
                        <Text style={styles.retryText}>
                            Tentativa {state.retryCount + 1}/2
                        </Text>
                    )}
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
                    <UserInfo userName={user?.name || "Usuário"} userSubtitle={formatLevelDisplay(user?.level || "aprendiz")} />
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
        <>
            <StatusBar 
                barStyle="light-content" 
                backgroundColor="#0087D3" 
                translucent={false}
                animated={true}
            />
            <SafeAreaView style={{ flex: 1, backgroundColor: '#0087D3' }}>
            <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.backButtoncontainer}>
                    <BackButton onPress={handlePressProfileHome} />
                </View>
                <UserInfo useRealTimeData={true} />
            </View>

            {/* Timer e Info do Quiz */}
            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>⏱️ {formatTime(state.timeLeft)}</Text>
                <Text style={[styles.scoreText, { color: levelColors.primary }]}>Pontos: {state.totalScore}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: levelColors.primary }]} />
                </View>
                <Text style={styles.progressText}>
                    {`${state.currentQuestionIndex + 1}/${state.quiz?.questions.length || 0}`}
                </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Category */}
                <Text style={styles.categoryText}>{state.quiz.category}</Text>

                {/* Question */}
                <Text style={styles.question} key={`question_${state.currentQuestionIndex}`}>
                    {/* Adicionando key para forçar re-render quando muda a questão */}
                    {currentQuestion.question || currentQuestion.questionText}
                </Text>

                {/* Options */}
                <View style={styles.optionsContainer} key={`options_${state.currentQuestionIndex}`}>
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
                                    { backgroundColor: levelColors.primary },
                                    isSelected && { backgroundColor: levelColors.accent, borderColor: levelColors.accent },
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
                            <Text style={[styles.feedbackPoints, { color: levelColors.primary }]}>
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
                        <ActivityIndicator size="small" color={levelColors.primary} />
                        <Text style={styles.validatingText}>Validando resposta...</Text>
                    </View>
                )}

                {/* ✨ COUNTDOWN VISUAL para próxima questão */}
                {state.showCountdown && state.nextQuestionCountdown > 0 && (
                    <View style={styles.countdownContainer}>
                        <View style={styles.countdownCircle}>
                            <Text style={[styles.countdownNumber, { color: levelColors.primary }]}>
                                {state.nextQuestionCountdown}
                            </Text>
                        </View>
                        <Text style={styles.countdownText}>
                            {state.currentQuestionIndex >= (state.quiz?.questions.length || 0) - 1
                                ? 'Mostrando resultados em...'
                                : 'Próxima questão em...'}
                        </Text>
                    </View>
                )}
            </ScrollView>
            </View>
        </SafeAreaView>
        </>
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
    retryText: {
        marginTop: 8,
        fontSize: 14,
        color: '#999',
        fontFamily: 'Roboto-Regular',
        fontStyle: 'italic',
    },
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
    // ✨ Estilos para Countdown
    countdownContainer: {
        marginTop: 24,
        padding: 20,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#C6E8FF',
    },
    countdownCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 3,
        borderColor: '#0087D3',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    countdownNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0087D3',
        fontFamily: 'Roboto-Bold',
    },
    countdownText: {
        fontSize: 14,
        color: '#545454',
        fontFamily: 'Roboto-Medium',
        textAlign: 'center',
    },
});

export default QuizScreen;
