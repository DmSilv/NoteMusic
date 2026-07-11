import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator, LayoutAnimation, UIManager, Platform, ScrollView } from 'react-native';
import { appAlert } from '@/shared/utils/appAlert';
import LevelScreenShell from '@/shared/components/layout/LevelScreenShell';
import ChromeNavHeader from '@/shared/components/layout/ChromeNavHeader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import UserInfo from '@/shared/components/layout/UserInfo/Userinfo';
import BackButton from '@/shared/components/layout/BackButton/BackButton';
import SubTitleComponent from '@/shared/components/form/SubTitle/SubTitle';
import TitleComponent from '@/shared/components/form/Title/Title';
import { useAuth } from '@/contexts/AuthContext';
import { getLevelColors, formatLevelDisplay } from '@/shared/constants/theme';
import { getLevelTheme } from '@/shared/constants/levelTheme';
import { getCategoryDisplayName } from '@/shared/constants/CategoryNames';
import MusicNoteIconBadge from '@/shared/components/ui/MusicNoteIconBadge';
import moduleService from '@/services/moduleService';
import { Module } from '@/services/api';
import quizCompletionService from '@/services/quizCompletionService';
import quizAttemptService, { QuizAttemptStatus } from '@/services/quizAttemptService';
import quizService from '@/services/quizService';

// Tipos de props
interface ContentListCategoryProps {
    navigation: NativeStackNavigationProp<any>;
    route: any;
}

const ModuleCategoryScreen: React.FC<ContentListCategoryProps> = ({ navigation, route }) => {
    const { user } = useAuth();
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [category, setCategory] = useState<any>(null);
    const [completionStatus, setCompletionStatus] = useState<Map<string, boolean>>(new Map());
    const [attemptStatus, setAttemptStatus] = useState<Map<string, QuizAttemptStatus>>(new Map());
    const [cooldownTimers, setCooldownTimers] = useState<Map<string, { minutes: number; seconds: number }>>(new Map());
    
    // Obter cores baseadas no nível do usuário
    const userLevel = user?.level || 'aprendiz';
    const levelColors = getLevelColors(userLevel);
    const chrome = getLevelTheme(userLevel);

    useEffect(() => {
        loadModules();
    }, []);

    // Habilitar animações de layout no Android
    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    // Timer para atualizar cooldowns a cada segundo (como no desafio diário)
    useEffect(() => {
        const interval = setInterval(() => {
            updateCooldownTimers();
        }, 1000);

        return () => clearInterval(interval);
    }, [attemptStatus]);

    // Timer automático para desbloquear quizzes (como no desafio diário)
    useEffect(() => {
        const interval = setInterval(() => {
            // Verificar se algum quiz deve ser desbloqueado
            modules.forEach(async (module) => {
                const currentAttemptStatus = attemptStatus.get(module.id);
                if (currentAttemptStatus && !currentAttemptStatus.canAttempt && currentAttemptStatus.reason === 'cooldown') {
                    const cooldownInfo = await quizAttemptService.getCooldownInfo(module.id, module.id);
                    if (!cooldownInfo.isOnCooldown) {
                        console.log('🕐 Cooldown expirado! Desbloqueando quiz:', module.id);
                        loadAttemptStatus(modules); // Recarregar status
                    }
                }
            });
        }, 60000); // Verificar a cada 1 minuto

        return () => clearInterval(interval);
    }, [modules, attemptStatus]);

    // Recarregar status quando a tela receber foco
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('🔄 Tela de módulos recebeu foco, atualizando status...');
            if (modules.length > 0) {
                loadCompletionStatus(modules, true);
                loadAttemptStatus(modules);
            }
        });

        return unsubscribe;
    }, [navigation, modules]);

    // Recarregar status quando route.params indicar que houve atualização
    useEffect(() => {
        if (route.params?.refreshStatus && modules.length > 0) {
            console.log('🔄 Atualizando status após conclusão de quiz...');
            loadCompletionStatus(modules, true);
            loadAttemptStatus(modules);
            
            // Limpar parâmetro para não recarregar repetidamente
            navigation.setParams({ 
                ...route.params, 
                refreshStatus: undefined,
                forceProgressRefresh: undefined,
            });
        }
    }, [route.params?.refreshStatus, modules]);

    const loadModules = async () => {
        try {
            setIsLoading(true);
            const categoryData = route.params?.category;
            setCategory(categoryData);
            
            let moduleList: Module[] = [];
            
            if (categoryData?.modules) {
                moduleList = categoryData.modules;
                
                // ✅ Buscar quizTimeLimit para cada módulo se não tiver
                for (let i = 0; i < moduleList.length; i++) {
                    if (!moduleList[i].quizTimeLimit) {
                        try {
                            const quiz = await quizService.getQuiz(moduleList[i].id);
                            if (quiz && quiz.timeLimit) {
                                moduleList[i].quizTimeLimit = quiz.timeLimit;
                            }
                        } catch (error) {
                            console.log('⚠️ Quiz não encontrado para módulo:', moduleList[i].id);
                        }
                    }
                }
            } else {
                // Fallback: carregar todos os módulos
                 const allModules = await moduleService.getAllModules();
                 // Garantir que id venha preenchido
                 moduleList = (allModules || []).map((m: any) => ({
                    ...m,
                    id: m.id || m._id
                 }));
            }
            
            setModules(moduleList);
            
            // Carregar status de conclusão dos quizzes para usuários autenticados
            if (user && moduleList.length > 0) {
                await loadCompletionStatus(moduleList);
                await loadAttemptStatus(moduleList);
            }
        } catch (error) {
            console.error('Erro ao carregar módulos:', error);
            setModules([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCompletionStatus = async (moduleList: Module[], forceRefresh = false) => {
        try {
            const moduleIds = moduleList.map(m => m.id);
            const statusMap = await quizCompletionService.checkMultipleQuizCompletions(moduleIds, forceRefresh);
            
            const completionMap = new Map<string, boolean>();
            statusMap.forEach((status, moduleId) => {
                completionMap.set(moduleId, status.isCompleted);
            });
            
            setCompletionStatus(completionMap);
        } catch (error) {
            console.error('Erro ao carregar status de conclusão:', error);
        }
    };

    const loadAttemptStatus = async (moduleList: Module[]) => {
        try {
            const attemptMap = new Map<string, QuizAttemptStatus>();
            
            for (const module of moduleList) {
                if (module.id) {
                    const isCompleted = completionStatus.get(module.id) || false;
                    
                    // Se o quiz foi completado (via backend), não permitir mais tentativas
                    if (isCompleted) {
                        attemptMap.set(module.id, {
                            quizId: module.id,
                            moduleId: module.id,
                            attempts: {
                                current: 2,
                                remaining: 0,
                                maxAttempts: 2,
                                lastAttemptAt: new Date().toISOString(),
                                cooldownUntil: null
                            },
                            canAttempt: false,
                            reason: 'completed',
                            message: 'Quiz já foi completado com sucesso'
                        });
                    } else {
                        // Verificar status local (inclui quizzes concluídos localmente)
                        const status = await quizAttemptService.canAttemptQuiz(module.id, module.id);
                        attemptMap.set(module.id, status);
                    }
                }
            }
            
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setAttemptStatus(attemptMap);
        } catch (error) {
            // Falha silenciosa
        }
    };

    const updateCooldownTimers = async () => {
        try {
            const newTimers = new Map<string, { minutes: number; seconds: number }>();
            const updatedAttemptStatus = new Map(attemptStatus);
            let needsUpdate = false;
            
            for (const [moduleId, status] of attemptStatus) {
                if (status.attempts.cooldownUntil) {
                    const cooldownInfo = await quizAttemptService.getCooldownInfo(moduleId, moduleId);
                    
                    if (cooldownInfo.isOnCooldown) {
                        // Ainda em cooldown, atualizar timer
                        newTimers.set(moduleId, {
                            minutes: cooldownInfo.timeRemaining.minutes,
                            seconds: cooldownInfo.timeRemaining.seconds
                        });
                    } else {
                        // Cooldown expirado, desbloquear quiz
                        const newStatus = await quizAttemptService.canAttemptQuiz(moduleId, moduleId);
                        updatedAttemptStatus.set(moduleId, newStatus);
                        needsUpdate = true;
                        newTimers.delete(moduleId);
                    }
                }
            }
            
            // Animar transição entre botão e indicador
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setCooldownTimers(newTimers);
            
            if (needsUpdate) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setAttemptStatus(updatedAttemptStatus);
            }
            
        } catch (error) {
            // Falha silenciosa
        }
    };

    const handlePressProfileHome = () => {
        navigation.navigate('ModuleCategory');
    };



    const handlePressQuizIntroScreen = async (moduleId: string) => {
        try {
            // 1. Verificar se o quiz foi completado
            const isCompleted = completionStatus.get(moduleId) || false;
            
            if (isCompleted) {
                appAlert(
                    'Quiz Concluído',
                    'Este quiz já foi completado com sucesso! Você pode revisar o conteúdo ou explorar outros módulos.',
                    [{ text: 'OK', style: 'default' }]
                );
                return;
            }
            
            // 2. Verificação REMOTA no backend (isolar por quiz/módulo)
            const quizId = moduleId;
            let remoteStatus: any | null = null;
            try {
                remoteStatus = await quizService.canStartQuiz(quizId, moduleId);
            } catch (e) {
                remoteStatus = null; // fallback para verificação local abaixo
            }

            // 3. Verificar status atual das tentativas (local)
            const currentStatus = await quizAttemptService.canAttemptQuiz(quizId, moduleId);
            
            // 4. Verificar cooldown específico (local)
            const cooldownInfo = await quizAttemptService.getCooldownInfo(quizId, moduleId);
            
            // VALIDAÇÃO RIGOROSA: Se não pode tentar, mostrar alert e bloquear
            const remoteBlocks = remoteStatus && remoteStatus.canAttempt === false;
            if (remoteBlocks || !currentStatus.canAttempt || cooldownInfo.isOnCooldown) {
                if (currentStatus.reason === 'completed') {
                    appAlert(
                        'Quiz Concluído',
                        'Este quiz já foi concluído com sucesso! Você pode revisar o conteúdo ou explorar outros módulos.',
                        [{ text: 'OK', style: 'default' }]
                    );
                    return;
                } else if (cooldownInfo.isOnCooldown || (remoteStatus?.attempts?.cooldownUntil)) {
                    // Preferir tempo local (preciso); se vier do backend, calcular estimativa
                    let timeStr = `${cooldownInfo.timeRemaining.minutes}:${cooldownInfo.timeRemaining.seconds.toString().padStart(2, '0')}`;
                    if (!cooldownInfo.isOnCooldown && remoteStatus?.attempts?.cooldownUntil) {
                        const end = new Date(remoteStatus.attempts.cooldownUntil).getTime();
                        const rem = Math.max(0, end - Date.now());
                        const m = Math.floor(rem / 60000);
                        const s = Math.floor((rem % 60000) / 1000);
                        timeStr = `${m}:${s.toString().padStart(2, '0')}`;
                    }
                    
                    appAlert(
                        'Quiz Bloqueado',
                        `Este quiz está bloqueado por ${timeStr} minutos.\n\nVocê esgotou suas tentativas. Aproveite para estudar e tente novamente em breve!`,
                        [{ text: 'OK', style: 'default' }]
                    );
                    return;
                } else if (currentStatus.reason === 'max_attempts_reached' || remoteStatus?.reason === 'max_attempts_reached') {
                    appAlert(
                        'Tentativas Esgotadas',
                        'Você esgotou suas tentativas para este quiz. O quiz ficará bloqueado por 30 minutos.\n\nAproveite para estudar e tente novamente em breve!',
                        [{ text: 'OK', style: 'default' }]
                    );
                    return;
                } else {
                    appAlert(
                        'Quiz Indisponível',
                        remoteStatus?.message || 'Este quiz não está disponível no momento. Tente novamente mais tarde.',
                        [{ text: 'OK', style: 'default' }]
                    );
                    return;
                }
            }
            
            // 5. Se passou em todas as validações, permitir acesso
            const selectedModule = modules.find(m => m.id === moduleId);
            navigation.navigate('QuizIntroScreen', { 
                moduleId,
                quizId: moduleId,
                quizTitle: selectedModule?.title || 'Quiz',
                level: selectedModule?.level,
                attemptStatus: remoteStatus || currentStatus
            });
            
        } catch (error) {
            appAlert(
                'Erro de Verificação',
                'Não foi possível verificar o status do quiz. Tente novamente mais tarde.',
                [{ text: 'OK', style: 'default' }]
            );
        }
    };

    // Função para obter o motivo do bloqueio
    const getLockReason = (moduleLevel?: string): string => {
        const userLevel = user?.level || 'aprendiz';
        const moduleLevelLower = moduleLevel?.toLowerCase() || 'aprendiz';
        
        if (userLevel === 'aprendiz') {
            if (moduleLevelLower === 'maestro') {
                return 'Nível Maestro';
            } else if (moduleLevelLower === 'virtuoso') {
                return 'Nível Virtuoso';
            }
        }
        
        return 'Bloqueado';
    };

    // Função para verificar se um módulo está disponível
    const isModuleAvailable = (index: number, isCompleted: boolean, moduleLevel?: string): boolean => {
        const userLevel = user?.level || 'aprendiz';
        const moduleLevelLower = moduleLevel?.toLowerCase() || 'aprendiz';
        
        // Hierarquia de níveis
        const levelHierarchy: { [key: string]: number } = {
            'aprendiz': 1,
            'virtuoso': 2,
            'maestro': 3
        };
        
        const userLevelValue = levelHierarchy[userLevel.toLowerCase()] || 1;
        const moduleLevelValue = levelHierarchy[moduleLevelLower] || 1;
        
        // ✅ BLOQUEIO POR NÍVEL:
        // Usuário só pode acessar módulos do seu nível ou inferiores
        // Aprendiz (1): acessa apenas Aprendiz
        // Virtuoso (2): acessa Aprendiz e Virtuoso
        // Maestro (3): acessa todos
        if (moduleLevelValue > userLevelValue) {
            console.log(`🔒 Módulo "${moduleLevel}" bloqueado para usuário "${userLevel}"`);
            return false;
        }
        
        // ✅ Todos os módulos do mesmo nível ou inferior estão disponíveis
        return true;
    };

    const renderLesson = ({ item, index }: { item: Module; index: number }) => {
        const isCompleted = completionStatus.get(item.id) || false;
        const attemptStatusForModule = attemptStatus.get(item.id);
        const isCompletedLocally = attemptStatusForModule?.reason === 'completed';
        const isQuizCompleted = isCompleted || isCompletedLocally;
        
        const isAvailable = isModuleAvailable(index, isQuizCompleted, item.level);
        const isLocked = !isAvailable && !isQuizCompleted;
        const cooldownTimer = cooldownTimers.get(item.id);
        const isOnCooldown = attemptStatusForModule?.attempts.cooldownUntil && cooldownTimer;
        const remainingAttempts = attemptStatusForModule?.attempts.remaining || 2;
        const hasStatus = !!attemptStatusForModule;
        // ✅ Só mostrar badge de tentativas se NÃO estiver em cooldown
        const shouldShowAttemptsBadge = hasStatus && !isQuizCompleted && !isLocked && !isOnCooldown;
        
        return (
            <View style={[
                styles.lessonContainer,
                isQuizCompleted && { backgroundColor: levelColors.secondary },
                isLocked && { backgroundColor: '#F5F5F5', opacity: 0.7 }
            ]}>
                <View style={styles.headerlessonContainer}>
                    <MusicNoteIconBadge style={styles.lessonNoteBadge} />
                    <View style={{ flex: 1 }}>
                        <Text style={[
                            styles.lessonTitle,
                            isQuizCompleted && { color: levelColors.primary },
                            isLocked && { color: '#666' }
                        ]}>
                            {item.title}
                        </Text>

                    </View>
                </View>
                <Text style={[
                    styles.lessonDescription,
                    isLocked && { color: '#999' }
                ]}>
                    {item.description}
                </Text>
                <View style={styles.lessonFooter}>
                    <View style={styles.lessonFooterLeft}>
                        <View style={styles.timeContainer}>
                            <View style={styles.containerModuleTime}>
                                <Image
                                    source={require('@/assets/images/clock.png')}
                                    style={[styles.image, styles.clock]}
                                />
                            </View>
                                            <Text style={styles.lessonTime}>
                                {(() => {
                                    // Calcular baseado no quiz se não tiver quizTimeLimit
                                    const timeLimit = item.quizTimeLimit || (item.quiz?.timeLimit) || ((item.quizzes && item.quizzes[0]?.timeLimit)) || null;
                                    return timeLimit ? `${Math.floor(timeLimit / 60)} min` : '5 min';
                                })()}
                            </Text>
                        </View>
                        {shouldShowAttemptsBadge && (
                            <View style={[
                                styles.attemptsBadge,
                                remainingAttempts === 0 && styles.attemptsBadgeWarning,
                                remainingAttempts === 1 && styles.attemptsBadgeLast
                            ]}>
                                <MaterialCommunityIcons 
                                    name={remainingAttempts === 0 ? "alert-circle" : "reload"} 
                                    size={12} 
                                    color={remainingAttempts === 0 ? "#F44336" : levelColors.primary} 
                                />
                                <Text style={[
                                    styles.attemptsText,
                                    remainingAttempts === 0 && styles.attemptsTextWarning,
                                    remainingAttempts === 1 && styles.attemptsTextLast
                                ]}>
                                    {remainingAttempts}/{attemptStatusForModule?.attempts.maxAttempts || 2} tent.
                                </Text>
                            </View>
                        )}
                        {isOnCooldown && cooldownTimer && (
                            <View style={styles.cooldownBadge}>
                                <MaterialCommunityIcons name="clock-outline" size={12} color="#FF9800" />
                                <Text style={styles.cooldownText}>
                                    {cooldownTimer.minutes}:{cooldownTimer.seconds.toString().padStart(2, '0')}
                                </Text>
                            </View>
                        )}
                    </View>
                    {hasStatus && (!isOnCooldown && !isQuizCompleted) && (
                        <TouchableOpacity 
                            style={[
                                styles.startButton,
                                { backgroundColor: levelColors.primary },
                                isLocked && { backgroundColor: '#CCC' }
                            ]}
                            onPress={() => {
                                if (isLocked) return;
                                handlePressQuizIntroScreen(item.id);
                            }}
                            disabled={isLocked}
                        >
                            <Text style={[
                                styles.startButtonText,
                                isLocked && { color: '#666' }
                            ]}>
                                {isLocked ? getLockReason(item.level) : 'Iniciar'}
                            </Text>
                        </TouchableOpacity>
                    )}
                    
                    {/* Indicador visual de status - apenas para quiz completado */}
                    {hasStatus && isQuizCompleted && (
                        <View style={[
                            styles.statusIndicator,
                            { backgroundColor: '#E8F5E8', borderLeftWidth: 4, borderLeftColor: '#4CAF50' }
                        ]}>
                            <Text style={[styles.statusIndicatorText, { color: '#4CAF50' }]}>
                                ✅ Quiz concluído com sucesso
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <LevelScreenShell level={userLevel}>
            <ChromeNavHeader>
                <View style={styles.backButtoncontainer}>
                    <BackButton onPress={handlePressProfileHome} level={userLevel} />
                </View>
                <UserInfo useRealTimeData={true} />
            </ChromeNavHeader>
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={levelColors.primary} />
                    <Text style={styles.loadingText}>Carregando módulos...</Text>
                </View>
            </View>
            </LevelScreenShell>
        );
    }

    return (
        <LevelScreenShell level={userLevel}>
            <ChromeNavHeader>
                <View style={styles.backButtoncontainer}>
                    <BackButton onPress={handlePressProfileHome} level={userLevel} />
                </View>
                <UserInfo userName={user?.name || "Usuário"} userSubtitle={formatLevelDisplay(user?.level || "aprendiz")} />
            </ChromeNavHeader>
            <View style={styles.container}>

            {/* Título e Informações da Categoria */}
            <View style={styles.intro}>
                <TitleComponent 
                    title={getCategoryDisplayName(category?.name || "Módulos")} 
                    fontFamily={'Roboto-Bold'} 
                    color={''} 
                    fontSize={''} 
                    truncate={false} 
                />
                <SubTitleComponent 
                    fontFamily={'Roboto-Light'} 
                    subtitle={`${category?.modules?.length || modules?.length || 0} módulos disponíveis para estudo`} 
                    color={''} 
                    marginRight={0} 
                    marginTop={6} 
                />
            </View>

            <FlatList
                data={(modules || []).filter(Boolean)}
                renderItem={renderLesson}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                extraData={modules?.length}
            />
            </View>
        </LevelScreenShell>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    Header: {
        marginBottom: 16,
    },
    backButtoncontainer: {
        position: 'absolute',
        left: 16,
        zIndex: 10,
    },
    intro: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        marginBottom: 8,
    },
    lessonContainer: {
        backgroundColor: '#F7FCFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginTop: 12
    },
    headerlessonContainer: {
        flexDirection: 'row',
    },
    lessonNoteBadge: {
        marginBottom: 20,
    },
    image: {
        resizeMode: 'contain',
    },
    lessonTitle: {
        fontSize: 18,
        marginLeft: 10,
        fontWeight: 'light',
        flexShrink: 1,
        marginBottom: 12,
    },
    lessonDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    lessonFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lessonFooterLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    attemptsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F4FD',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    attemptsText: {
        fontSize: 11,
        color: '#0087D3',
        fontWeight: '600',
    },
    attemptsBadgeWarning: {
        backgroundColor: '#FFEBEE',
        borderColor: '#F44336',
        borderWidth: 1,
    },
    attemptsTextWarning: {
        color: '#F44336',
    },
    attemptsBadgeLast: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FF9800',
        borderWidth: 1,
    },
    attemptsTextLast: {
        color: '#FF9800',
    },
    cooldownBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        borderWidth: 1,
        borderColor: '#FF9800',
    },
    cooldownText: {
        fontSize: 11,
        color: '#FF9800',
        fontWeight: '600',
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    lessonTime: {
        fontSize: 12,
        color: '#666',
    },
    startButton: {
        backgroundColor: '#0087D3',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    startButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    badge: {
        marginLeft: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeCooldown: {
        backgroundColor: '#FFF1E0',
        borderWidth: 1,
        borderColor: '#FF9800',
    },
    badgeCompleted: {
        backgroundColor: '#E8F5E8',
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    badgeText: {
        fontSize: 12,
        color: '#545454',
        fontWeight: '600',
    },
    statusIndicator: {
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        alignSelf: 'center',
    },
    statusIndicatorText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        textAlign: 'center',
    },
    bottomMenu: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        backgroundColor: '#0087D3',
    },
    menuItem: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    containerModuleTime: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 1,
    },
    clock: {
        width: 16,
        height: 16,
        marginRight: 4,
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
});

export default ModuleCategoryScreen;
