import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import UserInfo from '../../Components/UserInfo/Userinfo';
import BackButton from '../../Components/BackButton/BackButton';
import { useAuth } from '../../../contexts/AuthContext';
import quizAttemptService, { QuizAttemptStatus } from '../../../../services/quizAttemptService';
import quizCompletionService from '../../../../services/quizCompletionService';
import moduleService from '../../../../services/moduleService';
import quizService from '../../../../services/quizService';
import { Module } from '../../../../services/api';
import { formatLevelDisplay } from '../../../../constants/LevelColors';

interface QuizIntroScreenProps {
    navigation: StackNavigationProp<any>;
    route: any;
}

interface QuizStatus {
    completed: boolean;
    canPlay: boolean;
    timeRemaining: string;
    attempts: {
        current: number;
        remaining: number;
        maxAttempts: number;
    };
    isOnCooldown: boolean;
}

const QuizIntroScreen: React.FC<QuizIntroScreenProps> = ({ navigation, route }) => {
    const { user } = useAuth();
    const moduleId = route.params?.moduleId;
    const quizTitle = route.params?.quizTitle || 'Quiz';
    
    const [quizStatus, setQuizStatus] = useState<QuizStatus>({
        completed: false,
        canPlay: true,
        timeRemaining: '',
        attempts: {
            current: 0,
            remaining: 2,
            maxAttempts: 2
        },
        isOnCooldown: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [moduleData, setModuleData] = useState<Module | null>(null);
    const [quizData, setQuizData] = useState<any>(null);
    const [showFullTheory, setShowFullTheory] = useState(false);

    useEffect(() => {
        if (moduleId) {
            loadQuizStatus();
            loadModuleData();
        }
    }, [moduleId]);

    const loadModuleData = async () => {
        try {
            if (moduleId) {
                console.log('🔍 [QuizIntro] Carregando dados do módulo:', moduleId);
                
                // Carregar módulo e quiz separadamente com tratamento de erro individual
                const module = await moduleService.getModuleById(moduleId);
                console.log('✅ [QuizIntro] Módulo carregado:', module?.title);
                setModuleData(module);
                
                // Tentar carregar quiz (pode falhar se não existir)
                try {
                    const quiz = await quizService.getQuiz(moduleId);
                    console.log('✅ [QuizIntro] Quiz carregado:', quiz?.title);
                    setQuizData(quiz);
                } catch (quizError) {
                    console.log('⚠️ [QuizIntro] Quiz não encontrado para este módulo');
                    setQuizData(null);
                }
            }
        } catch (error) {
            console.error('❌ [QuizIntro] Erro ao carregar dados do módulo:', error);
            Alert.alert(
                'Erro de Carregamento', 
                'Não foi possível carregar as informações do módulo. Verifique sua conexão e tente novamente.',
                [
                    { text: 'Voltar', onPress: () => navigation.goBack() },
                    { text: 'Tentar Novamente', onPress: () => loadModuleData() }
                ]
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Timer para atualizar status a cada minuto (como no desafio diário)
    useEffect(() => {
        const interval = setInterval(() => {
            if (quizStatus.isOnCooldown) {
                loadQuizStatus();
            }
        }, 60000); // Verificar a cada 1 minuto

        return () => clearInterval(interval);
    }, [quizStatus.isOnCooldown]);

    // Recarregar status quando a tela receber foco
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('🔄 QuizIntroScreen recebeu foco, atualizando status...');
            if (moduleId) {
                loadQuizStatus();
            }
        });

        return unsubscribe;
    }, [navigation, moduleId]);

    const loadQuizStatus = async () => {
        try {
            console.log('🔍 [QuizIntroScreen] Carregando status do quiz para módulo:', moduleId);

            // Verificar se o quiz foi completado
            const completionStatus = await quizCompletionService.checkQuizCompletion(moduleId);
            const isCompleted = completionStatus.isCompleted;
            console.log('🔍 [QuizIntroScreen] Status de conclusão:', completionStatus);

            if (isCompleted) {
                console.log('✅ [QuizIntroScreen] Quiz já foi completado');
                setQuizStatus({
                    completed: true,
                    canPlay: false,
                    timeRemaining: '',
                    attempts: {
                        current: 2,
                        remaining: 0,
                        maxAttempts: 2
                    },
                    isOnCooldown: false
                });
                setIsLoading(false);
                return;
            }

            // Verificar status de tentativas com IDs consistentes
            const attemptStatus = await quizAttemptService.canAttemptQuiz(moduleId, moduleId);
            console.log('🔍 [QuizIntroScreen] Status de tentativas:', attemptStatus);
            
            // Verificar se está em cooldown
            const cooldownInfo = await quizAttemptService.getCooldownInfo(moduleId, moduleId);
            console.log('🔍 [QuizIntroScreen] Info de cooldown:', cooldownInfo);
            
            const timeRemaining = cooldownInfo.isOnCooldown ? 
                `${cooldownInfo.timeRemaining.minutes}:${cooldownInfo.timeRemaining.seconds.toString().padStart(2, '0')}` : '';
            
            setQuizStatus({
                completed: false,
                canPlay: attemptStatus.canAttempt,
                timeRemaining: timeRemaining,
                attempts: attemptStatus.attempts,
                isOnCooldown: cooldownInfo.isOnCooldown
            });

            console.log('✅ [QuizIntroScreen] Status final do quiz:', {
                completed: isCompleted,
                canPlay: attemptStatus.canAttempt,
                timeRemaining: timeRemaining,
                attempts: attemptStatus.attempts,
                isOnCooldown: cooldownInfo.isOnCooldown,
                reason: attemptStatus.reason
            });

        } catch (error) {
            console.error('❌ [QuizIntroScreen] Erro ao carregar status do quiz:', error);
            // Em caso de erro, permitir tentar (mais amigável ao usuário)
            setQuizStatus({
                completed: false,
                canPlay: true,
                timeRemaining: '',
                attempts: {
                    current: 0,
                    remaining: 2,
                    maxAttempts: 2
                },
                isOnCooldown: false
            });
            
            // Não mostrar alert aqui, apenas logar o erro
            console.log('⚠️ [QuizIntroScreen] Usando configuração padrão devido ao erro');
        }
    };

    const handlePressQuizIntroScreen = async () => {
        // VALIDAÇÃO TRIPLA: Verificar status em tempo real antes de permitir acesso
        try {

            
            // 1. Verificar conclusão
            const completionStatus = await quizCompletionService.checkQuizCompletion(moduleId);
            if (completionStatus.isCompleted) {

                Alert.alert(
                    'Quiz Concluído',
                    'Este quiz já foi completado com sucesso! Você pode revisar o conteúdo ou explorar outros módulos.',
                    [{ text: 'OK', style: 'default' }]
                );
                return;
            }

            // 2. Verificar status de tentativas
            const currentStatus = await quizAttemptService.canAttemptQuiz(moduleId, moduleId);

            
            if (!currentStatus.canAttempt) {
                if (currentStatus.reason === 'cooldown') {
                    const cooldownInfo = await quizAttemptService.getCooldownInfo(moduleId, moduleId);
                    const timeStr = `${cooldownInfo.timeRemaining.minutes}:${cooldownInfo.timeRemaining.seconds.toString().padStart(2, '0')}`;
                    

                    Alert.alert(
                        'Quiz Bloqueado',
                        `Este quiz está bloqueado por ${timeStr} minutos.\n\nVocê esgotou suas tentativas. Aproveite para estudar e tente novamente em breve!`,
                        [{ text: 'OK', style: 'default' }]
                    );
                    return;
                } else if (currentStatus.reason === 'max_attempts_reached') {

                    Alert.alert(
                        'Tentativas Esgotadas',
                        'Você esgotou suas tentativas para este quiz. O quiz ficará bloqueado por 30 minutos.\n\nAproveite para estudar e tente novamente em breve!',
                        [{ text: 'OK', style: 'default' }]
                    );
                    return;
                } else {

                    Alert.alert(
                        'Quiz Indisponível',
                        'Este quiz não está disponível no momento. Tente novamente mais tarde.',
                        [{ text: 'OK', style: 'default' }]
                    );
                    return;
                }
            }

            // 3. Verificar cooldown específico
            const cooldownInfo = await quizAttemptService.getCooldownInfo(moduleId, moduleId);
            if (cooldownInfo.isOnCooldown) {
                const timeStr = `${cooldownInfo.timeRemaining.minutes}:${cooldownInfo.timeRemaining.seconds.toString().padStart(2, '0')}`;

                Alert.alert(
                    'Quiz Bloqueado',
                    `Este quiz está bloqueado por ${timeStr} minutos.\n\nVocê esgotou suas tentativas. Aproveite para estudar e tente novamente em breve!`,
                    [{ text: 'OK', style: 'default' }]
                );
                return;
            }

            // Se passou em todas as validações, permitir acesso

            navigation.navigate('Quiz', { 
                moduleId,
                attemptStatus: currentStatus
            });
            
        } catch (error) {

            Alert.alert(
                'Erro de Verificação',
                'Não foi possível verificar o status do quiz. Tente novamente mais tarde.',
                [{ text: 'OK', style: 'default' }]
            );
        }
    };

    const handlePressProfileHome = () => {
        navigation.goBack();
    };

    const getButtonText = () => {
        if (quizStatus.completed) {
            return 'Concluído';
        }
        
        if (quizStatus.isOnCooldown) {
            return quizStatus.timeRemaining;
        }
        
        return 'Iniciar';
    };

    const getButtonStyle = () => {
        if (quizStatus.completed) {
            return [styles.continueButton, styles.completedButton];
        }
        
        if (quizStatus.isOnCooldown) {
            return [styles.continueButton, styles.cooldownButton];
        }
        
        return styles.continueButton;
    };

    const getButtonTextStyle = () => {
        if (quizStatus.completed) {
            return [styles.continueButtonText, styles.completedButtonText];
        }
        
        if (quizStatus.isOnCooldown) {
            return [styles.continueButtonText, styles.cooldownButtonText];
        }
        
        return styles.continueButtonText;
    };

    const renderFormattedTheory = (theory: string) => {
        // Determinar quanto conteúdo mostrar
        const maxLength = showFullTheory ? theory.length : 400;
        const displayText = theory.length > maxLength ? theory.substring(0, maxLength) + '...' : theory;
        
        // Limpar e processar o texto
        const cleanedText = displayText
            .replace(/\t+/g, ' ')  // Substituir tabs por espaços
            .replace(/[ ]{2,}/g, ' ')  // Múltiplos espaços por um só
            .replace(/\n[ ]+/g, '\n')  // Remover espaços no início das linhas
            .trim();
        
        // Dividir o texto de forma mais inteligente
        const lines = cleanedText.split('\n');
        const processedSections = [];
        
        let currentSection = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line) {
                // Linha vazia - finalizar seção atual se houver
                if (currentSection.trim()) {
                    processedSections.push(currentSection.trim());
                    currentSection = '';
                }
                continue;
            }
            
            // Verificar se é um título (termina com : ou está em maiúscula)
            const isTitle = line.endsWith(':') || 
                           (line.length < 60 && line === line.toUpperCase() && line.length > 3);
            
            // Verificar se é item de lista
            const isListItem = /^[•\-\*\d+\.]/.test(line);
            
            if (isTitle) {
                // Finalizar seção anterior e começar nova
                if (currentSection.trim()) {
                    processedSections.push(currentSection.trim());
                }
                processedSections.push(line);
                currentSection = '';
            } else if (isListItem) {
                // Finalizar seção anterior se não for lista
                if (currentSection.trim() && !currentSection.includes('•') && !currentSection.includes('-')) {
                    processedSections.push(currentSection.trim());
                    currentSection = '';
                }
                processedSections.push(line);
            } else {
                // Texto normal - adicionar à seção atual
                currentSection += (currentSection ? ' ' : '') + line;
            }
        }
        
        // Adicionar última seção se houver
        if (currentSection.trim()) {
            processedSections.push(currentSection.trim());
        }
        
        return (
            <View style={styles.theoryContent}>
                {processedSections.map((section, index) => {
                    if (!section.trim()) return null;
                    
                    // Detectar tipo de conteúdo
                    const isTitle = section.endsWith(':') || 
                                  (section.length < 60 && section === section.toUpperCase() && section.length > 3);
                    const isListItem = /^[•\-\*]/.test(section) || /^\d+\./.test(section);
                    const isExample = section.toLowerCase().includes('exemplo') || 
                                    section.includes('Ex:') || 
                                    section.includes('Como:');
                    
                    if (isTitle) {
                        return (
                            <View key={index} style={styles.titleSection}>
                                <Text style={styles.theorySubtitle}>
                                    {section}
                                </Text>
                            </View>
                        );
                    } else if (isListItem) {
                        return (
                            <View key={index} style={styles.listSection}>
                                <Text style={styles.theoryListItem}>
                                    {section}
                                </Text>
                            </View>
                        );
                    } else if (isExample) {
                        return (
                            <View key={index} style={styles.exampleSection}>
                                <Text style={styles.theoryExample}>
                                    {section}
                                </Text>
                            </View>
                        );
                    } else {
                        return (
                            <View key={index} style={styles.paragraphSection}>
                                <Text style={styles.theoryParagraph}>
                                    {section}
                                </Text>
                            </View>
                        );
                    }
                })}
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.Header}>
                    <View style={styles.backButtoncontainer}>
                        <BackButton onPress={handlePressProfileHome} />
                    </View>
                    <UserInfo useRealTimeData={true} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0087D3" />
                    <Text style={styles.loadingText}>Carregando informações do quiz...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.Header}>
                <View style={styles.backButtoncontainer}>
                    <BackButton onPress={handlePressProfileHome} />
                </View>
                <UserInfo useRealTimeData={true} />
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.pageTitle}>{moduleData?.title || quizTitle}</Text>

                {/* Informações do Quiz */}
                <View style={styles.quizInfoContainer}>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="book-open-page-variant" size={16} color="#0087D3" />
                        <Text style={styles.infoText}>Nível: {formatLevelDisplay(moduleData?.level || 'aprendiz')}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#0087D3" />
                        <Text style={styles.infoText}>
                            Tempo: {quizData?.timeLimit ? `${Math.floor(quizData.timeLimit / 60)} minutos` : '5 minutos'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="help-circle-outline" size={16} color="#0087D3" />
                        <Text style={styles.infoText}>
                            Questões: {quizData?.totalQuestions || quizData?.questions?.length || '3'} perguntas
                        </Text>
                    </View>
                    {quizData?.passingScore && (
                        <View style={styles.infoRow}>
                            <MaterialCommunityIcons name="target" size={16} color="#0087D3" />
                            <Text style={styles.infoText}>Pontuação mínima: {quizData.passingScore}%</Text>
                        </View>
                    )}
                </View>

            {/* Conteúdo do Módulo */}
            <Text style={styles.sectionTitle}>Sobre este módulo:</Text>
            <Text style={styles.description}>
                {moduleData?.description || 'Este quiz testará seus conhecimentos sobre o tema abordado.'}
            </Text>
            
            {moduleData?.content?.theory && (
                <View style={styles.theoryContainer}>
                    <Text style={styles.theoryTitle}>📚 Conteúdo Teórico:</Text>
                    {renderFormattedTheory(moduleData.content.theory)}
                    {moduleData.content.theory.length > 400 && (
                        <TouchableOpacity 
                            style={styles.showMoreButton}
                            onPress={() => setShowFullTheory(!showFullTheory)}
                        >
                            <Text style={styles.showMoreText}>
                                {showFullTheory ? 'Ver menos' : 'Ver mais conteúdo'}
                            </Text>
                            <MaterialCommunityIcons 
                                name={showFullTheory ? "chevron-up" : "chevron-down"} 
                                size={16} 
                                color="#0087D3" 
                            />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Status do Quiz - Só aparece quando necessário */}
            {(quizStatus.completed || quizStatus.isOnCooldown) && (
                <View style={styles.quizStatusContainer}>
                    {quizStatus.completed ? (
                        <View style={styles.statusItem}>
                            <MaterialCommunityIcons name="check-circle" size={20} color="#43A047" />
                            <Text style={styles.statusText}>✅ Quiz Concluído com Sucesso!</Text>
                        </View>
                    ) : quizStatus.isOnCooldown ? (
                        <View style={styles.statusItem}>
                            <MaterialCommunityIcons name="clock-outline" size={20} color="#FF9800" />
                            <Text style={styles.statusText}>
                                ⏰ Quiz bloqueado por {quizStatus.timeRemaining} minutos
                            </Text>
                        </View>
                    ) : null}
                </View>
            )}

                <TouchableOpacity 
                    style={getButtonStyle()} 
                    onPress={handlePressQuizIntroScreen}
                    disabled={quizStatus.completed || quizStatus.isOnCooldown}
                >
                    <Text style={getButtonTextStyle()}>
                        {getButtonText()}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
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
    quizStatusContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        marginBottom: 10,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusText: {
        fontSize: 14,
        color: '#545454',
        fontWeight: '500',
    },
    continueButton: {
        backgroundColor: '#0087D3',
        paddingVertical: 15,
        borderRadius: 25,
        marginTop: 20,
        alignItems: 'center',
    },
    completedButton: {
        backgroundColor: '#43A047',
    },
    cooldownButton: {
        backgroundColor: '#FF9800',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    completedButtonText: {
        color: '#fff',
    },
    cooldownButtonText: {
        color: '#fff',
    },
    theoryContainer: {
        backgroundColor: '#F8F9FA',
        padding: 18,
        borderRadius: 12,
        marginVertical: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#0087D3',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    theoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0087D3',
        marginBottom: 8,
    },
    theoryText: {
        fontSize: 14,
        color: '#545454',
        lineHeight: 20,
    },
    theoryContent: {
        flex: 1,
    },
    titleSection: {
        marginTop: 15,
        marginBottom: 8,
    },
    paragraphSection: {
        marginBottom: 12,
    },
    listSection: {
        marginBottom: 6,
        paddingLeft: 8,
    },
    exampleSection: {
        marginVertical: 10,
        padding: 12,
        backgroundColor: '#F0F8FF',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#4CAF50',
    },
    theorySubtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0087D3',
        lineHeight: 24,
    },
    theoryParagraph: {
        fontSize: 14,
        color: '#545454',
        lineHeight: 22,
        textAlign: 'justify',
    },
    theoryListItem: {
        fontSize: 14,
        color: '#545454',
        lineHeight: 20,
    },
    theoryExample: {
        fontSize: 14,
        color: '#2E7D32',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        fontSize: 16,
        color: '#0087D3',
        marginTop: 10,
        textAlign: 'center',
    },
    quizInfoContainer: {
        backgroundColor: '#F0F8FF',
        padding: 15,
        borderRadius: 10,
        marginVertical: 15,
        borderWidth: 1,
        borderColor: '#E3F2FD',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#0087D3',
        marginLeft: 8,
        fontWeight: '500',
    },
    scrollContainer: {
        flex: 1,
        paddingBottom: 20,
    },
    showMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#E3F2FD',
        borderRadius: 25,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#B3E5FC',
    },
    showMoreText: {
        fontSize: 14,
        color: '#0087D3',
        fontWeight: '600',
        marginRight: 6,
    },
});

export default QuizIntroScreen;