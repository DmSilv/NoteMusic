import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import MenuBottom from '../Components/Menu-Bottom/MenuBottom'
import { NavigationProp } from '@react-navigation/native';
import font from '../Components/FontLoader/FontLoader'
const { width, height } = Dimensions.get('window');
interface Props {
    navigation: NavigationProp<any>;
}
const HomeScreen = ({ navigation }: Props)=> {
    const modules = [
        { title: 'Propriedades do Som', time: '5 min' },
        { title: 'Figuras musicais', time: '5 min' },
        { title: 'Linguagem Rítmica', time: '5 min' }
    ];
    const paddingHorizontal = (16 / 390) * width;

    const handlePressModuleCategory = () => {
        navigation.navigate('ModuleCategory');
    };

    const handlePressQuiz = () => {
        navigation.navigate('Quiz');
    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Olá seja bem vindo,</Text>
                <Text style={styles.name}>Danilo Silva</Text>
            </View>

            <View style={styles.statusContainer}>
                <View style={styles.containerstatusBoxPending}>
                    <TouchableOpacity style={styles.statusBoxPending} onPress={handlePressModuleCategory}>
                        <View style={styles.statusBoxStatusNumber}>
                            <Image
                                source={require('../../../assets/images/book-white.png')}  // Caminho para a imagem local
                                style={[styles.image, styles.book]}
                            />
                            <Text style={styles.statusNumber}>02</Text>
                        </View>

                        <Text style={styles.statusText}>Módulos Pendentes</Text>
                        <View style={styles.Modulecontainerview}>
                            <Text style={styles.Modulefinished}>Ver Modulos</Text>
                            <Image
                                source={require('../../../assets/images/arrow-right-white.png')}  // Caminho para a imagem local
                                style={[styles.image, styles.arrow]}
                            />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.containerstatusBoxFinished}>
                    <TouchableOpacity style={styles.statusBoxfinished}>
                        <View style={styles.statusBoxStatusNumber}>
                            <Image
                                source={require('../../../assets/images/book.png')}  // Caminho para a imagem local
                                style={[styles.image, styles.book]}
                            />
                            <Text style={styles.statusNumberfinished}>03</Text>
                        </View>

                        <Text style={styles.statusTextfinished}>Módulos Finalizados</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.Containerline}>
                <View style={styles.line} />
            </View>



            <View style={styles.challengeContainer}>
                <Text style={styles.challengeText}>Desafio semanal</Text>
                <Text style={styles.challengeTime}>Encerra em 4 dias</Text>
            </View>

            <ScrollView style={styles.moduleList}>
                {modules.map((module, index) => (
                    <View key={index} style={styles.moduleCard}>
                        <View style={styles.containerModuleTitle}>
                            <View style={styles.containerNoteIcon}>
                                <Image
                                    source={require('../../../assets/images/music-note.png')}  // Caminho para a imagem local
                                    style={[styles.image, styles.Note]}
                                />
                            </View>

                            <Text style={styles.moduleTitle}>{module.title}</Text>
                        </View>
                        <Text style={styles.moduleDescription}>
                            A linguagem rítmica flui como uma melodia, alternando sons e pausas com precisão...
                        </Text>
                        <View style={styles.moduleFooter}>
                            <View style={styles.containerModuleTime}>
                                <Image
                                    source={require('../../../assets/images/clock.png')}  // Caminho para a imagem local
                                    style={[styles.image, styles.clock]}
                                />
                                <Text style={styles.moduleTime}>{module.time}</Text>
                            </View>
                            <TouchableOpacity style={styles.button} onPress={handlePressQuiz}>
                                <Text style={styles.buttonText}>Iniciar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <MenuBottom
                navigateToHome={() => navigation.navigate('ProfileHome')}
                navigateToProfile={() => navigation.navigate('ProfileAccount')}
                currentScreen="home"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        marginTop: '10%',
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.03,
    },
    greeting: {
        fontSize: height * 0.02,
        color: '#555',
    },
    name: {
        fontSize: height * 0.03,
        fontWeight: 'bold',
        color: '#0087D3',
        marginBottom: height * 0.02,
    },
    statusContainer: {
        flexDirection: 'row',
        width: 'auto',
        marginHorizontal: 12,
        marginBottom: 24,
    },
    containerstatusBoxPending: {
        flex: 1,
        width: '100%',
        backgroundColor: '#0A8CD6',
        paddingHorizontal: height * 0.04,
        borderRadius: 10,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
    },
    statusBoxPending: {
        marginHorizontal: height * -0.03,
        marginTop: 12

    },
    containerstatusBoxFinished: {
        flex: 1,
        width: '100%',
        backgroundColor: 'rgba(67, 187, 255, 0.2)',
        paddingHorizontal: height * 0.04,
        borderRadius: 10,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
    },
    statusBoxfinished: {
        marginHorizontal: height * -0.03,
        marginTop: 12

    },
    statusBoxStatusNumber: {
        flexDirection: 'column',
    },
    statusNumber: {
        fontSize: height * 0.04,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 12

    },
    statusNumberfinished: {
        fontSize: height * 0.04,
        fontWeight: 'bold',
        color: '#424242',
        marginTop: 12
    },
    statusText: {
        fontSize: height * 0.017,
        color: 'white',
        flexShrink: 1,
        width: '120%',
        fontWeight: 'light',
    },
    Modulecontainerview: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingVertical: 12
    },
    statusTextfinished: {
        fontSize: height * 0.017,
        color: '#0A8CD6',
        flexWrap: 'nowrap',
        flexShrink: 1,
        width: '120%',
        fontWeight: 'light',
    },
    Containerline: {
        paddingHorizontal: 16,
        width: '100%',
        marginBottom: 18,
    },
    line: {
        height: 1,
        backgroundColor: 'rgba(140, 140, 140, 0.20)',
        width: '100%',
    },
    Modulefinished: {
        color: '#FFF',
        marginRight: 6,
        fontSize: height * 0.017,
        fontWeight: '600'
    },
    image: {
        resizeMode: 'contain',
    },
    arrow: {
        width: 12,
        height: 12,
    },
    book: {
        width: 25,
        height: 25,
    },
    challengeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: width * 0.05,
        marginBottom: height * 0.02,
    },
    challengeText: {
        fontSize: height * 0.022,
        fontWeight: 'semibold',
    },
    challengeTime: {
        color: '#E5944A',
        fontWeight: 'medium',
        fontSize: 14
    },
    moduleList: {
        // paddingHorizontal: width * 0.01,
    },
    moduleCard: {
        backgroundColor: 'rgba(0, 163, 255, 0.04)',
        padding: height * 0.02,
        marginBottom: height * 0.02,
    },
    containerModuleTitle: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    containerNoteIcon: {
        backgroundColor: '#C6E8FF',
        padding: 1,
        marginRight: 4,
        borderRadius: 4
    },
    Note: {
        height: 20,
        width: 20,
        margin: 1
    },
    moduleTitle: {
        fontSize: height * 0.022,
        fontWeight: 'bold',
        color: '#0087D3',
    },
    moduleDescription: {
        fontSize: height * 0.018,
        color: '#545454',
        marginVertical: height * 0.01,
    },
    moduleFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    moduleTime: {
        fontSize: height * 0.016,
        color: '#131313',
        fontFamily: 'Poppins-Regular'
    },
    containerModuleTime: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    clock: {
        width: 16,
        height: 16,
        marginRight: 4,
        marginBottom:3
    },
    button: {
        backgroundColor: '#0087D3',
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.07,
        borderRadius: 15.5,
    },
    buttonText: {
        color: '#FFFCFC',
        fontWeight: 'bold',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: height * 0.02,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingHorizontal: width * 0.05,
    },
    navButton: {
        alignItems: 'center',
    },
    navButtonText: {
        fontSize: height * 0.02,
        fontWeight: 'bold',
        color: '#1B4DFF',
    },
});

export default HomeScreen;
