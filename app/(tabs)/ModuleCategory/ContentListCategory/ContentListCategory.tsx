import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import UserInfo from '../../Components/UserInfo/Userinfo';
import BackButton from '../../Components/BackButton/BackButton';

// Tipos de props
interface ContentListCategory {
    navigation: StackNavigationProp<any>;
}

interface Lesson {
    id: string;
    title: string;
    description: string;
    time: string;
}

const lessons: Lesson[] = [
    { id: '1', title: 'Propriedades do Som', description: 'A linguagem rítmica flui como uma melodia, alternando sons e pausas com precisão. Suas palavras dançam...', time: '5 min' },
    { id: '2', title: 'Figuras musicais', description: 'A linguagem rítmica flui como uma melodia...', time: '5 min' },
    { id: '3', title: 'Linguagem Rítmica', description: 'A linguagem rítmica flui como uma melodia...', time: '5 min' },
    { id: '4', title: 'Linguagem Rítmica', description: 'A linguagem rítmica flui como uma melodia...', time: '5 min' },
    { id: '5', title: 'Linguagem Rítmica', description: 'A linguagem rítmica flui como uma melodia...', time: '5 min' },
];

const ModuleCategoryScreen: React.FC<ContentListCategory> = ({ navigation }) => {
    const handlePressProfileHome = () => {
        navigation.navigate('ModuleCategory');
    };


    const handlePressQuizIntroScreen = () => {
        navigation.navigate('QuizIntroScreen');
    };

    const renderLesson = ({ item }: { item: Lesson }) => (
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
                    <Text style={styles.lessonTime}>{item.time}</Text>
                </View>
                <TouchableOpacity style={styles.startButton} onPress={handlePressQuizIntroScreen}>
                    <Text style={styles.startButtonText}>Iniciar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.Header}>
                <View style={styles.backButtoncontainer}>
                    <BackButton onPress={handlePressProfileHome} />
                </View>
                <UserInfo userName="Danilo" userSubtitle="Aprendiz" />
            </View>

            <Text style={styles.pageTitle}>Propriedades do Som</Text>
            <Text style={styles.pageSubtitle}>Domine os Fundamentos da Acústica Musical</Text>

            <FlatList
                data={lessons}
                renderItem={renderLesson}
                keyExtractor={(item) => item.id}
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
});

export default ModuleCategoryScreen;
