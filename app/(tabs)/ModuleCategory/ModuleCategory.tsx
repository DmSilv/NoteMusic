import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TitleComponent from '../Components/Title/Title';
import SubTitleComponent from '../Components/SubTitle/SubTitle';
import UserInfo from '../Components/UserInfo/Userinfo';
import BackButton from '../Components/BackButton/BackButton';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import moduleService, { ModuleCategory as ModuleCategoryType } from '../../../services/moduleService';
import apiService from '../../../services/api';
import { getLevelColors, getLevelIcon } from '../../../constants/LevelColors';
import quizCompletionService from '../../../services/quizCompletionService';

const { width } = Dimensions.get('window');

// Definindo os tipos de props para o componente
interface ModuleCategoryProps {
    navigation: StackNavigationProp<any>;
}

const ModuleCategory: React.FC<ModuleCategoryProps> = ({ navigation }) => {
    const { user } = useAuth();
    const [categories, setCategories] = useState<ModuleCategoryType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState<string>(''); // Será definido como nível do usuário após carregar dados
    const [categoryCompletion, setCategoryCompletion] = useState<any>(null);
    const [userStats, setUserStats] = useState<any>(null);
    
    // Estados para busca e filtros
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<ModuleCategoryType[]>([]);
    
    // Estados para validação real de conclusão de quizzes
    const [quizCompletionStatus, setQuizCompletionStatus] = useState<Map<string, boolean>>(new Map());
    const [isValidatingQuizzes, setIsValidatingQuizzes] = useState<boolean>(false);
    const [validationSuccess, setValidationSuccess] = useState<boolean>(false);
    
    // Estado para controlar títulos expandidos
    const [expandedTitles, setExpandedTitles] = useState<Set<string>>(new Set());
    
    // Cache para evitar recarregamentos desnecessários
    const [lastLoadTime, setLastLoadTime] = useState<number>(0);
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
    
    // Hook para debounce da busca
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                performSearch(searchQuery.trim());
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        }, 300); // 300ms de delay

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);
    
    // Definir nível inicial baseado no usuário
    useEffect(() => {
        if (userStats && !selectedLevel) {
            const userLevel = userStats.level || user?.level || 'aprendiz';
            console.log(`🎯 Definindo nível inicial: ${userLevel}`);
            setSelectedLevel(userLevel);
        }
    }, [userStats, user, selectedLevel]);

    // Log quando selectedLevel muda e recarregar conclusão
    useEffect(() => {
        console.log(`🔄 ESTADO selectedLevel MUDOU: "${selectedLevel}"`);
        if (user) {
            loadCategoryCompletion();
        }
    }, [selectedLevel]);
    
    // Mapear níveis do usuário para verificar acesso
    const userLevelHierarchy = {
        'aprendiz': 1,
        'virtuoso': 2,
        'maestro': 3,
        'Aprendiz': 1,
        'Virtuoso': 2,
        'Maestro': 3
    };
    
    // Usar userStats.level se disponível, senão usar user.level
    const currentUserLevel = userStats?.level || user?.level;
    const userLevelValue = userLevelHierarchy[currentUserLevel as keyof typeof userLevelHierarchy] || 1;
    
    console.log('🔍 Nível do usuário:', {
        userLevel: user?.level,
        statsLevel: userStats?.level,
        currentLevel: currentUserLevel,
        value: userLevelValue
    });

    useEffect(() => {
        loadUserData();
        loadCategories();
    }, []);

    const loadUserData = async () => {
        try {
            if (user) {
                const stats = await apiService.getUserStats();
                console.log('📊 Stats carregadas no ModuleCategory:', stats);
                setUserStats(stats);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar stats do usuário:', error);
        }
    };

    const loadCategories = async () => {
        try {
            // Verificar cache antes de carregar
            const now = Date.now();
            if (categories.length > 0 && (now - lastLoadTime) < CACHE_DURATION) {
                console.log('📦 Usando categorias do cache');
                return;
            }

            setIsLoading(true);
            
            // ⚠️ TEMPORÁRIO: Não passar nível (filtro desabilitado no service)
            console.log(`🔍 Carregando TODAS as categorias`);
            
            const moduleCategories = await moduleService.getModulesByCategory();
            console.log('📚 CATEGORIAS CARREGADAS NO FRONTEND:');
            console.log('Total:', moduleCategories?.length || 0);
            
            if (moduleCategories) {
                moduleCategories.forEach((category, index) => {
                    console.log(`${index + 1}. ${category.name}`);
                    console.log(`   Módulos: ${category.modules?.length || 0}`);
                    if (category.modules) {
                        category.modules.forEach(module => {
                            console.log(`     - ${module.title} (${module.level})`);
                        });
                    }
                });
            }
            
            setCategories(moduleCategories || []);
            setLastLoadTime(now);
            
            // Carregar conclusão de categorias
            await loadCategoryCompletion();
            
            // Validar conclusão real de cada quiz individual
            if (moduleCategories && moduleCategories.length > 0) {
                await validateIndividualQuizCompletion(moduleCategories);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar categorias:', error);
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Função para verificar se um nível está bloqueado
    const isLevelLocked = (level: string): boolean => {
        const levelValue = userLevelHierarchy[level as keyof typeof userLevelHierarchy] || 1;
        return levelValue > userLevelValue;
    };

    // Função para obter primeira palavra do título
    const getFirstWord = (title: string): string => {
        if (title.includes('-')) {
            return title.split('-')[0];
        }
        if (title.includes(' ')) {
            return title.split(' ')[0];
        }
        return title;
    };

    // Função para alternar título expandido
    const toggleTitleExpansion = (categoryName: string) => {
        setExpandedTitles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryName)) {
                newSet.delete(categoryName);
            } else {
                newSet.add(categoryName);
            }
            return newSet;
        });
    };

    // Função de busca otimizada
    const performSearch = useCallback((query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        
        const filtered = categories.filter(category => {
            // Buscar por nome da categoria
            const categoryMatch = category.name.toLowerCase().includes(query.toLowerCase());
            
            // Buscar por módulos dentro da categoria (apenas do nível desbloqueado)
            const moduleMatch = category.modules?.some(module => {
                const isModuleUnlocked = !isLevelLocked(module.level);
                const matchesSearch = module.title.toLowerCase().includes(query.toLowerCase()) ||
                                    module.description.toLowerCase().includes(query.toLowerCase());
                return isModuleUnlocked && matchesSearch;
            });
            
            return categoryMatch || moduleMatch;
        });

        // Filtrar apenas categorias que tenham módulos desbloqueados
        const filteredWithUnlockedModules = filtered.filter(category => {
            return category.modules?.some(module => !isLevelLocked(module.level));
        });

        setSearchResults(filteredWithUnlockedModules);
        setIsSearching(false);
    }, [categories, isLevelLocked]);

    const loadCategoryCompletion = async () => {
        try {
            if (user) {
                const completion = await apiService.getCategoryCompletion(selectedLevel || undefined);
                console.log('📂 Conclusão de categorias carregada:', completion);
                setCategoryCompletion(completion);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar conclusão de categorias:', error);
        }
    };

    // Função para validar conclusão real de cada quiz individual
    const validateIndividualQuizCompletion = async (categories: ModuleCategoryType[]) => {
        if (!user || categories.length === 0) {
            return;
        }

        setIsValidatingQuizzes(true);
        console.log('🔍 Iniciando validação real de conclusão de quizzes...');

        try {
            const completionMap = new Map<string, boolean>();
            
            // Coletar todos os IDs de módulos/quizzes de todas as categorias
            const allModuleIds: string[] = [];
            categories.forEach(category => {
                if (category.modules) {
                    category.modules.forEach(module => {
                        if (module.id) {
                            allModuleIds.push(module.id);
                        }
                    });
                }
            });

            console.log(`📊 Validando ${allModuleIds.length} quizzes individuais...`);

            // Verificar conclusão de todos os quizzes em paralelo
            const completionStatuses = await quizCompletionService.checkMultipleQuizCompletions(allModuleIds);
            
            // Processar resultados
            completionStatuses.forEach((status, moduleId) => {
                completionMap.set(moduleId, status.isCompleted);
                console.log(`✅ Quiz ${moduleId}: ${status.isCompleted ? 'CONCLUÍDO' : 'NÃO CONCLUÍDO'}`);
            });

            setQuizCompletionStatus(completionMap);
            console.log('✅ Validação de quizzes concluída:', completionMap.size, 'quizzes verificados');
            
            // Mostrar feedback de sucesso
            setValidationSuccess(true);
            setTimeout(() => setValidationSuccess(false), 2000); // Esconder após 2 segundos
            
        } catch (error) {
            console.error('❌ Erro ao validar conclusão de quizzes:', error);
            Alert.alert(
                'Erro na Validação',
                'Não foi possível validar o status dos quizzes. Tente novamente.',
                [{ text: 'OK', style: 'default' }]
            );
        } finally {
            setIsValidatingQuizzes(false);
        }
    };

    const handlePressProfileHome = () => {
        navigation.navigate('ProfileHome');
    };

    const handlePressContentListCategory = (category: ModuleCategoryType) => {
        navigation.navigate('ContentListCategory', { category });
    };

    const showCategoryInfo = (category: ModuleCategoryType) => {
        const moduleCount = category.modules?.length || 0;
        const completedCount = category.modules?.filter(module => 
            quizCompletionStatus.get(module.id) || false
        ).length || 0;
        const progress = moduleCount > 0 ? Math.round((completedCount / moduleCount) * 100) : 0;
        
        Alert.alert(
            category.name,
            `📚 Módulos: ${moduleCount}\n✅ Concluídos: ${completedCount}\n📊 Progresso: ${progress}%\n\n${category.modules?.[0]?.description || 'Categoria de estudos musicais.'}`,
            [{ text: 'OK' }]
        );
    };
    
    // Função auxiliar para determinar nível da categoria (memoizada)
    const getCategoryLevel = useCallback((category: ModuleCategoryType): string => {
        if (!category?.modules || category.modules.length === 0) {
            return 'aprendiz';
        }
        
        const levelCounts = {
            'aprendiz': 0,
            'virtuoso': 0,
            'maestro': 0
        };
        
        category.modules.forEach((module) => {
            if (module?.level) {
                levelCounts[module.level as keyof typeof levelCounts]++;
            }
        });
        
        // Determinar nível dominante
        if (levelCounts.maestro > levelCounts.virtuoso && levelCounts.maestro > levelCounts.aprendiz) {
            return 'maestro';
        } else if (levelCounts.virtuoso > levelCounts.aprendiz) {
            return 'virtuoso';
        }
        
        return 'aprendiz';
    }, []);

    // Função para filtrar categorias por nível (otimizada com useMemo)
    const getFilteredCategories = useMemo(() => {
        console.log(`\n🔍 ===== FILTRO DE CATEGORIAS =====`);
        console.log(`🎯 Filtro selecionado: "${selectedLevel}"`);
        console.log(`📚 Total de categorias disponíveis: ${categories.length}`);
        
        if (!selectedLevel || selectedLevel === '') {
            // Por padrão, mostrar apenas categorias do nível atual do usuário
            const userLevel = currentUserLevel || 'aprendiz';
            console.log(`📋 Mostrando categorias do nível atual do usuário: ${userLevel}`);
            
            const filteredByUserLevel = categories.filter((category) => {
                if (!category || !category.modules || category.modules.length === 0) {
                    return false;
                }
                
                const categoryLevel = getCategoryLevel(category);
                return categoryLevel === userLevel;
            });
            
            console.log(`📊 Categorias do nível ${userLevel}: ${filteredByUserLevel.length}`);
            return filteredByUserLevel;
        }
        
        console.log(`\n🔍 Processando filtro para nível: ${selectedLevel}`);
        
        // NOVA LÓGICA: Filtrar módulos por nível e depois agrupar por categoria
        const filteredCategories: ModuleCategoryType[] = [];
        const categoryMap = new Map<string, ModuleCategoryType>();
        
        categories.forEach((category) => {
            if (!category || !category.modules || category.modules.length === 0) {
                return;
            }
            
            // Filtrar módulos do nível selecionado
            const modulesOfLevel = category.modules.filter((module) => {
                return module.level === selectedLevel;
            });
            
            if (modulesOfLevel.length > 0) {
                // Se já existe uma categoria com esse nome, adicionar os módulos
                if (categoryMap.has(category.name)) {
                    const existingCategory = categoryMap.get(category.name)!;
                    existingCategory.modules = [...existingCategory.modules, ...modulesOfLevel];
                } else {
                    // Criar nova categoria com apenas os módulos do nível selecionado
                    categoryMap.set(category.name, {
                        name: category.name,
                        modules: modulesOfLevel
                    });
                }
            }
        });
        
        // Converter Map para array
        const filtered = Array.from(categoryMap.values());
        
        console.log(`\n📋 ===== RESULTADO FINAL =====`);
        console.log(`🎯 Filtro: ${selectedLevel}`);
        console.log(`📊 Categorias encontradas: ${filtered.length}`);
        
        // Log detalhado das categorias encontradas
        filtered.forEach((category, index) => {
            console.log(`\n${index + 1}. ${category.name}`);
            console.log(`   Módulos: ${category.modules.length}`);
            category.modules.forEach((module, moduleIndex) => {
                console.log(`     ${moduleIndex + 1}. ${module.title} (${module.level})`);
            });
        });
        
        return filtered;
    }, [categories, selectedLevel, currentUserLevel, getCategoryLevel]);

    // Categorias finais para exibição (com busca)
    const displayCategories = useMemo(() => {
        if (searchQuery.trim()) {
            return searchResults;
        }
        return getFilteredCategories;
    }, [searchQuery, searchResults, getFilteredCategories]);



    // Função para verificar se uma categoria está realmente concluída
    const isCategoryReallyCompleted = useCallback((category: ModuleCategoryType): boolean => {
        if (!category.modules || category.modules.length === 0) {
            return false;
        }

        // Verificar se TODOS os quizzes da categoria foram concluídos
        const allQuizzesCompleted = category.modules.every(module => {
            const isCompleted = quizCompletionStatus.get(module.id) || false;
            console.log(`🔍 Quiz "${module.title}" (${module.id}): ${isCompleted ? 'CONCLUÍDO' : 'NÃO CONCLUÍDO'}`);
            return isCompleted;
        });

        console.log(`📊 Categoria "${category.name}": ${allQuizzesCompleted ? 'TOTALMENTE CONCLUÍDA' : 'NÃO CONCLUÍDA'} (${category.modules.length} quizzes)`);
        return allQuizzesCompleted;
    }, [quizCompletionStatus]);

    // Função para obter a cor da coroa baseada no nível (usando sistema padronizado)
    const getCrownColor = (level: string): string => {
        return getLevelColors(level).primary;
    };


    // Mapeamento de nomes de categorias por nível (usando IDs que vêm do backend)
    const getCategoryNameByLevel = useCallback((categoryName: string, level: string): string => {
        const nameMapping: Record<string, Record<string, string>> = {
            'propriedades-som': {
                'aprendiz': 'Fundamentos do Som',
                'virtuoso': 'Propriedades Sonoras',
                'maestro': 'Acústica Avançada'
            },
            'intervalos-musicais': {
                'aprendiz': 'Iniciação aos Intervalos',
                'virtuoso': 'Intervalos e Harmonia',
                'maestro': 'Harmonia Complexa'
            },
            'figuras-musicais': {
                'aprendiz': 'Notação Básica',
                'virtuoso': 'Leitura Musical',
                'maestro': 'Notação Avançada'
            },
            'ritmo-ternarios': {
                'aprendiz': 'Tempo e Pulsação',
                'virtuoso': 'Ritmos Complexos',
                'maestro': 'Polirritmia'
            },
            'compasso-simples': {
                'aprendiz': 'Compassos Básicos',
                'virtuoso': 'Compassos Aplicados',
                'maestro': 'Métricas Complexas'
            },
            'escalas-maiores': {
                'aprendiz': 'Escalas Iniciais',
                'virtuoso': 'Escalas e Tonalidades',
                'maestro': 'Sistema Tonal'
            },
            'compasso-composto': {
                'aprendiz': 'Introdução aos Compostos',
                'virtuoso': 'Compassos Compostos',
                'maestro': 'Métricas Irregulares'
            }
        };
        
        return nameMapping[categoryName]?.[level] || categoryName;
    }, []);

    const renderCard = useCallback((category: ModuleCategoryType) => {
        if (!category || !category.name) {
            return null;
        }
        
        // Usar função memoizada para determinar nível da categoria
        const categoryLevel = getCategoryLevel(category);
        const crownColor = getCrownColor(categoryLevel);
        const displayName = getCategoryNameByLevel(category.name, categoryLevel);
        
        // Verificar se a categoria está realmente concluída (validação real)
        const isCategoryCompleted = isCategoryReallyCompleted(category);
        
        // Contar quantos quizzes foram concluídos para exibir progresso
        const completedQuizzes = category.modules?.filter(module => 
            quizCompletionStatus.get(module.id) || false
        ).length || 0;
        const totalQuizzes = category.modules?.length || 0;
        
        return (
            <View style={[styles.card, isCategoryCompleted && styles.cardCompleted]}>
                <TouchableOpacity 
                    style={styles.containerCard} 
                    onPress={() => handlePressContentListCategory(category)}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.topRow}>
                            {/* Ícone da nota alinhado com a seta */}
                            {!isCategoryCompleted && (
                                <View style={styles.containerNoteIcon}>
                                    <Image
                                        source={require('../../../assets/images/music-note.png')}
                                        style={[styles.image, styles.Note]}
                                    />
                                </View>
                            )}
                            {/* Botão de informações da categoria */}
                            <TouchableOpacity 
                                style={styles.infoButton}
                                onPress={() => showCategoryInfo(category)}
                                activeOpacity={0.7}
                            >
                                <MaterialCommunityIcons 
                                    name="information-outline" 
                                    size={14} 
                                    color="#4A90E2" 
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.titleContainer}>
                            <Text 
                                style={styles.cardText}
                                numberOfLines={2}
                                ellipsizeMode="clip"
                            >
                                {displayName}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.cardFooter}>
                        <View style={styles.timeAndCrownContainer}>
                            <View style={styles.timeContainer}>
                                {isCategoryCompleted ? (
                                    <Text style={styles.completedTextMinimal}>Concluído</Text>
                                ) : (
                                    <View style={styles.containerModuleTime}>
                                        <Image
                                            source={require('../../../assets/images/clock.png')}
                                            style={[styles.image, styles.clock]}
                                        />
                                        <Text 
                                            style={styles.progressText}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {completedQuizzes > 0 
                                                ? `${completedQuizzes}/${totalQuizzes}`
                                                : `${totalQuizzes} módulos`
                                            }
                                        </Text>
                                    </View>
                                )}
                            </View>
                            {/* Coroa com cor baseada no nível da categoria */}
                            <View style={styles.crownContainer}>
                                <MaterialCommunityIcons 
                                    name="crown" 
                                    size={20} 
                                    color={crownColor} 
                                />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }, [getCategoryLevel, getCategoryNameByLevel, isCategoryReallyCompleted, quizCompletionStatus, handlePressContentListCategory]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
            <View style={styles.container}>
            <ScrollView>
                {/* Barra Superior */}
                <View style={styles.header}>
                    <UserInfo useRealTimeData={true} />
                    <View style={styles.backButtoncontainer}>
                        <BackButton onPress={handlePressProfileHome} />
                    </View>
                </View>

                {/* Título e Saudação */}
                <View style={styles.intro}>
                    <SubTitleComponent fontFamily={'Roboto-Medium'} subtitle={'Olá seja bem-vindo,'} color={''} marginRight={''} marginTop={''} />
                    <TitleComponent title={'Comece sua Jornada'} fontFamily={'Roboto-Bold'} color={''} fontSize={''} truncate={false} />
                </View>

                {/* Barra de Busca */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <MaterialCommunityIcons 
                            name="magnify" 
                            size={20} 
                            color="#666" 
                            style={styles.searchIcon}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar categorias ou módulos..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity 
                                onPress={() => setSearchQuery('')}
                                style={styles.clearButton}
                            >
                                <MaterialCommunityIcons 
                                    name="close-circle" 
                                    size={20} 
                                    color="#999" 
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Categorias */}
                <View style={styles.categories}>
                    <View style={styles.categoryHeader}>
                        <View style={styles.categoryTitleContainer}>
                            <Text style={styles.categoryText}>
                                {searchQuery.trim() ? 'Resultados da Busca' : 'Categorias'}
                            </Text>
                            {!searchQuery.trim() && (
                                <TouchableOpacity 
                                    onPress={() => validateIndividualQuizCompletion(categories)}
                                    style={[
                                        styles.refreshButton,
                                        isValidatingQuizzes && styles.refreshButtonDisabled,
                                        validationSuccess && styles.refreshButtonSuccess
                                    ]}
                                    disabled={isValidatingQuizzes}
                                >
                                    <MaterialCommunityIcons 
                                        name={
                                            isValidatingQuizzes ? "loading" : 
                                            validationSuccess ? "check-circle" : 
                                            "refresh"
                                        } 
                                        size={18} 
                                        color={
                                            isValidatingQuizzes ? "#999" : 
                                            validationSuccess ? "#4CAF50" : 
                                            "#007AFF"
                                        } 
                                        style={isValidatingQuizzes && styles.rotatingIcon}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.categorySubtitle}>
                            {searchQuery.trim() 
                                ? `${searchResults.length} resultado(s) encontrado(s)`
                                : 'Escolha seu nível de conhecimento'
                            }
                        </Text>
                    </View>
                    
                    <View style={styles.levelContainer}>
                        {/* Nível Aprendiz */}
                        <TouchableOpacity 
                            style={[
                                styles.levelCard,
                                selectedLevel === 'aprendiz' && styles.levelCardSelected
                            ]}
                            onPress={() => {
                                const newLevel = selectedLevel === 'aprendiz' ? '' : 'aprendiz';
                                console.log(`🎯 CLIQUE APRENDIZ: ${selectedLevel} → ${newLevel}`);
                                setSelectedLevel(newLevel);
                            }}
                        >
                            {/* Indicador de seleção lúdico */}
                            <View style={styles.levelSelectionIndicator}>
                                <View style={[
                                    styles.selectionDot,
                                    selectedLevel === 'aprendiz' && styles.selectionDotActive,
                                    { backgroundColor: selectedLevel === 'aprendiz' ? getLevelColors('aprendiz').primary : '#E0E0E0' }
                                ]} />
                            </View>
                            
                            <View style={styles.levelIconContainer}>
                                <MaterialCommunityIcons 
                                    name="crown" 
                                    size={28} 
                                    color={getLevelColors('aprendiz').primary} 
                                />
                            </View>
                            <View style={styles.levelInfo}>
                                <Text style={[styles.levelTitle, selectedLevel === 'aprendiz' && styles.levelTitleActive]}>Aprendiz</Text>
                                <Text style={styles.levelDescription}>Nível inicial</Text>
                            </View>
                        </TouchableOpacity>
                        
                        {/* Nível Virtuoso */}
                        <TouchableOpacity 
                            style={[
                                styles.levelCard,
                                selectedLevel === 'virtuoso' && styles.levelCardSelected,
                                isLevelLocked('virtuoso') && styles.levelCardLocked
                            ]}
                            onPress={() => {
                                if (!isLevelLocked('virtuoso')) {
                                    const newLevel = selectedLevel === 'virtuoso' ? '' : 'virtuoso';
                                    console.log(`🎯 CLIQUE VIRTUOSO: ${selectedLevel} → ${newLevel}`);
                                    setSelectedLevel(newLevel);
                                } else {
                                    console.log(`🔒 VIRTUOSO BLOQUEADO - Usuário nível: ${currentUserLevel}`);
                                }
                            }}
                            disabled={isLevelLocked('virtuoso')}
                        >
                            {/* Indicador de seleção lúdico */}
                            <View style={styles.levelSelectionIndicator}>
                                {isLevelLocked('virtuoso') ? (
                                    <MaterialCommunityIcons 
                                        name="lock" 
                                        size={16} 
                                        color="#999" 
                                    />
                                ) : (
                                    <View style={[
                                        styles.selectionDot,
                                        selectedLevel === 'virtuoso' && styles.selectionDotActive,
                                        { backgroundColor: selectedLevel === 'virtuoso' ? getLevelColors('virtuoso').primary : '#E0E0E0' }
                                    ]} />
                                )}
                            </View>
                            
                            <View style={[styles.levelIconContainer, isLevelLocked('virtuoso') && styles.iconLocked]}>
                                <MaterialCommunityIcons 
                                    name="crown" 
                                    size={28} 
                                    color={isLevelLocked('virtuoso') ? "#CCC" : getLevelColors('virtuoso').primary} 
                                />
                            </View>
                            <View style={styles.levelInfo}>
                                <Text style={[styles.levelTitle, isLevelLocked('virtuoso') && styles.textLocked]}>Virtuoso</Text>
                                <Text style={[styles.levelDescription, isLevelLocked('virtuoso') && styles.textLocked]}>
                                    {isLevelLocked('virtuoso') ? 'Bloqueado' : 'Nível intermediário'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        
                        {/* Nível Maestro */}
                        <TouchableOpacity 
                            style={[
                                styles.levelCard,
                                styles.lastLevelCard,
                                selectedLevel === 'maestro' && styles.levelCardSelected,
                                isLevelLocked('maestro') && styles.levelCardLocked
                            ]}
                            onPress={() => {
                                if (!isLevelLocked('maestro')) {
                                    const newLevel = selectedLevel === 'maestro' ? '' : 'maestro';
                                    console.log(`🎯 CLIQUE MAESTRO: ${selectedLevel} → ${newLevel}`);
                                    setSelectedLevel(newLevel);
                                } else {
                                    console.log(`🔒 MAESTRO BLOQUEADO - Usuário nível: ${currentUserLevel}`);
                                }
                            }}
                            disabled={isLevelLocked('maestro')}
                        >
                            {/* Indicador de seleção lúdico */}
                            <View style={styles.levelSelectionIndicator}>
                                {isLevelLocked('maestro') ? (
                                    <MaterialCommunityIcons 
                                        name="lock" 
                                        size={16} 
                                        color="#999" 
                                    />
                                ) : (
                                    <View style={[
                                        styles.selectionDot,
                                        selectedLevel === 'maestro' && styles.selectionDotActive,
                                        { backgroundColor: selectedLevel === 'maestro' ? getLevelColors('maestro').primary : '#E0E0E0' }
                                    ]} />
                                )}
                            </View>
                            
                            <View style={[styles.levelIconContainer, isLevelLocked('maestro') && styles.iconLocked]}>
                                <MaterialCommunityIcons 
                                    name="crown" 
                                    size={28} 
                                    color={isLevelLocked('maestro') ? "#CCC" : getLevelColors('maestro').primary} 
                                />
                            </View>
                            <View style={styles.levelInfo}>
                                <Text style={[styles.levelTitle, isLevelLocked('maestro') && styles.textLocked]}>Maestro</Text>
                                <Text style={[styles.levelDescription, isLevelLocked('maestro') && styles.textLocked]}>
                                    {isLevelLocked('maestro') ? 'Bloqueado' : 'Nível avançado'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>



                {/* Cartões */}
                <View style={styles.cardGrid}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Carregando categorias...</Text>
                        </View>
                    ) : isValidatingQuizzes ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Validando conclusão de quizzes...</Text>
                        </View>
                    ) : isSearching ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Buscando...</Text>
                        </View>
                    ) : displayCategories.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons 
                                name={searchQuery.trim() ? "magnify" : "folder-open-outline"} 
                                size={48} 
                                color="#CCC" 
                            />
                            <Text style={styles.emptyText}>
                                {searchQuery.trim() 
                                    ? 'Nenhum resultado encontrado'
                                    : 'Nenhuma categoria disponível'
                                }
                            </Text>
                            {searchQuery.trim() && (
                                <TouchableOpacity 
                                    onPress={() => setSearchQuery('')}
                                    style={styles.clearSearchButton}
                                >
                                    <Text style={styles.clearSearchText}>Limpar busca</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        displayCategories.filter(category => category && category.name).map((category, index) => (
                            <View key={`category-${category.name}-${index}`} style={styles.cardWrapper}>
                                {renderCard(category)}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
            </View>
        </SafeAreaView>
    );
}

// ... Estilos e exportação do componente ...

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: 35,
    },
    header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: 20,
        width: '100%',
    },
    backButtoncontainer: {
        position: 'absolute',
        top: 'auto',
        left: 20,
        zIndex: 10,
    },
    intro: {
        paddingLeft: 20,
    },
    categories: {
        paddingLeft: 20,
        marginTop: 20,
    },
    categoryHeader: {
        marginBottom: 20,
    },
    categoryTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'Poppins-SemiBold',
        flex: 1,
    },
    categorySubtitle: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Poppins-Regular',
    },
    refreshButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F8FF',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#007AFF',
        marginLeft: 12,
        marginRight: 20,
        minWidth: 40,
        height: 36,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    refreshButtonDisabled: {
        backgroundColor: '#F5F5F5',
        borderColor: '#DDD',
        opacity: 0.7,
    },
    refreshButtonSuccess: {
        backgroundColor: '#E8F5E8',
        borderColor: '#4CAF50',
    },
    rotatingIcon: {
        transform: [{ rotate: '360deg' }],
    },
    levelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingRight: 20,
    },
    levelCard: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 12,
        marginRight: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        position: 'relative',
    },
    levelCardSelected: {
        backgroundColor: '#E8F4FD',
        borderColor: '#007AFF',
        borderWidth: 2,
    },
    levelCardLocked: {
        backgroundColor: '#F5F5F5',
        opacity: 0.7,
    },
    levelSelectionIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectionDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#E0E0E0',
    },
    selectionDotActive: {
        width: 16,
        height: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    iconLocked: {
        opacity: 0.5,
    },
    textLocked: {
        color: '#999',
    },
    levelTitleActive: {
        color: '#007AFF',
    },
    levelInfo: {
        alignItems: 'center',
    },
    levelTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 2,
    },
    levelDescription: {
        fontSize: 11,
        color: '#666',
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
    },
    lastLevelCard: {
        marginRight: 0,
    },
    cardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cardWrapper: {
        width: '47%',
        marginBottom: 15,
    },
    containerCard: {
        marginTop: -5,
    },
    card: {
        backgroundColor: '#F7FCFF',
        borderRadius: 10,
        padding: 18,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
        width: '100%',
        minHeight: 130,
    },
    cardText: {
        fontSize: width < 400 ? 12 : 14,
        fontWeight: '600',
        lineHeight: 18,
        textAlign: 'left',
        color: '#333',
        minHeight: 36,
        marginTop: 2,
        marginBottom: 4,
    },
    cardHeader: {
        flexDirection: 'column',
        marginBottom: 8,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    titleContainer: {
        flex: 1,
    },
    titleContainerExpanded: {
        marginLeft: 0,
    },
    infoButton: {
        padding: 4,
        borderRadius: 6,
        backgroundColor: '#F0F8FF',
        shadowColor: '#4A90E2',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    containerNoteIcon: {
        backgroundColor: '#C6E8FF',
        padding: 4,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
    },
    image: {
        resizeMode: 'contain',
    },
    Note: {
        height: 14,
        width: 14,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    timeAndCrownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        minHeight: 28,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        maxWidth: '70%',
    },
    containerModuleTime: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 2,
        flex: 1,
    },
    clock: {
        width: 16,
        height: 16,
        marginRight: 4,
    },
    progressText: {
        fontSize: 10,
        color: '#666',
        fontWeight: '500',
        flexShrink: 1,
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
    levelIconContainer: {
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    crownContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 28,
        flexShrink: 0,
    },
    cardCompleted: {
        borderColor: '#4CAF50',
        borderWidth: 1,
        backgroundColor: '#F8F9FA',
    },
    completionIcon: {
        marginLeft: 'auto',
    },
    completedTextMinimal: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '500',
        fontStyle: 'italic',
    },
    // Estilos para busca
    searchContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Poppins-Regular',
    },
    clearButton: {
        marginLeft: 8,
        padding: 4,
    },
    // Estilos para estado vazio
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 20,
    },
    clearSearchButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    clearSearchText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
});

export default ModuleCategory;


