import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import UserInfo from '../../Components/UserInfo/Userinfo';
import BackButton from '../../Components/BackButton/BackButton';
import { useAuth } from '../../../contexts/AuthContext';
import moduleService, { Module } from '../../../../services/moduleService';

// Tipos de props
interface ContentListCategoryProps {
    navigation: StackNavigationProp<any>;
    route: any;
}

const ModuleCategoryScreen: React.FC<ContentListCategoryProps> = ({ navigation, route }) => {
    const { user } = useAuth();
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [category, setCategory] = useState<any>(null);

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        try {
            setIsLoading(true);
            const categoryData = route.params?.category;
            setCategory(categoryData);
            
            if (categoryData?.modules) {
                setModules(categoryData.modules);
            } else {
                // Fallback: carregar todos os módulos
                 const allModules = await moduleService.getAllModules();
                 // Garantir que id venha preenchido
                 const normalized = (allModules || []).map((m: any) => ({
                    ...m,
                    id: m.id || m._id
                 }));
                 setModules(normalized);
            }
        } catch (error) {
            console.error('Erro ao carregar módulos:', error);
            setModules([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePressProfileHome = () => {
        navigation.navigate('ModuleCategory');
    };

    const handlePressQuizIntroScreen = (moduleId: string) => {
        navigation.navigate('Quiz', { moduleId });
    };

    const renderLesson = ({ item }: { item: Module }) => (
        <View style={styles.lessonContainer}>
            <View style={styles.headerlessonContainer}>
                <View style={styles.containerNoteIcon}>
                    <Image
                        source={require('../../../../assets/images/music-note.png')}
                        style={[styles.image, styles.Note]}
                    />
                </View>
                <Text style={styles.lessonTitle}>{item.title}</Text>
            </View>
            <Text style={styles.lessonDescription}>{item.description}</Text>
            <View style={styles.lessonFooter}>
                <View style={styles.timeContainer}>
                    <View style={styles.containerModuleTime}>
                        <Image
                            source={require('../../../../assets/images/clock.png')}
                            style={[styles.image, styles.clock]}
                        />
                    </View>
                    <Text style={styles.lessonTime}>5 min</Text>
                </View>
                <TouchableOpacity 
                    style={styles.startButton} 
                    onPress={() => handlePressQuizIntroScreen(item.id)}
                >
                    <Text style={styles.startButtonText}>Iniciar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.Header}>
                    <View style={styles.backButtoncontainer}>
                        <BackButton onPress={handlePressProfileHome} />
                    </View>
                    <UserInfo userName={user?.name || "Usuário"} userSubtitle="Aprendiz" />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Carregando módulos...</Text>
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
                <UserInfo userName={user?.name || "Usuário"} userSubtitle="Aprendiz" />
            </View>

            <Text style={styles.pageTitle}>{category?.name || "Módulos"}</Text>
            <Text style={styles.pageSubtitle}>
                {category?.modules?.length || modules?.length || 0} módulos disponíveis
            </Text>

            <FlatList
                data={(modules || []).filter(Boolean)}
                renderItem={renderLesson}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                // key para cada item já é garantido pelo keyExtractor;
                // adicionando extraData para evitar warnings de keys
                extraData={modules?.length}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
    },
    Header: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: 12,
        marginBottom: 24,
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
        marginBottom: 5,
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 20,
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
    containerNoteIcon: {
        backgroundColor: '#C6E8FF',
        padding: 2,
        marginBottom: 20,
    },
    image: {
        resizeMode: 'contain',
    },
    Note: {
        height: 20,
        width: 20,
        margin: 0,
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
