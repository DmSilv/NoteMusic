import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import TitleComponent from '../Components/Title/Title';
import SubTitleComponent from '../Components/SubTitle/SubTitle';
import UserInfo from '../Components/UserInfo/Userinfo';
import BackButton from '../Components/BackButton/BackButton';
import { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');

// Definindo os tipos de props para o componente
interface ModuleCategoryProps {
    navigation: StackNavigationProp<any>;
}

const ModuleCategory: React.FC<ModuleCategoryProps> = ({ navigation }) => {
    const handlePressProfileHome = () => {
        navigation.navigate('ProfileHome');
    };

    const handlePressContentListCategory = () => {
        navigation.navigate('ContentListCategory');
    };

    const categorias = [
        'Propriedades do Som',
        'Escalas Maiores',
        'Figuras Musicais',
        'Ritmo Ternários',
        'Compasso Simples',
        'Andamento e Dinâmica',
        'Solfégio Básico',
        'Articulação Musical',
        'Intervalos Musicais',
        'Expressão Musical',
        'Síncopa e Contratempo',
        'Compasso Composto',
    ];

    const renderCard = (titulo: string) => (
        <View style={styles.card}>
            <TouchableOpacity style={styles.containerCard} onPress={handlePressContentListCategory}>
                <View style={styles.cardHeader}>
                    <View style={styles.containerNoteIcon}>
                        <Image
                            source={require('../../../assets/images/music-note.png')}
                            style={[styles.image, styles.Note]}
                        />
                    </View>
                    <Text style={styles.cardText}>{titulo}</Text>
                </View>
                <View style={styles.cardFooter}>
                    <View style={styles.timeContainer}>
                        <View style={styles.containerModuleTime}>
                            <Image
                                source={require('../../../assets/images/clock.png')}
                                style={[styles.image, styles.clock]}
                            />
                            <Text>5 min</Text>
                        </View>
                    </View>
                    <Text>🥇</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView>
                {/* Barra Superior */}
                <View style={styles.header}>
                    <UserInfo userName="Danilo" userSubtitle="Aprendiz" />
                    <View style={styles.backButtoncontainer}>
                        <BackButton onPress={handlePressProfileHome} />
                    </View>
                </View>

                {/* Título e Saudação */}
                <View style={styles.intro}>
                    <SubTitleComponent fontFamily={'Roboto-Medium'} subtitle={'Olá seja bem-vindo,'} color={''} marginRight={''} marginTop={''} />
                    <TitleComponent title={'Comece sua Jornada'} fontFamily={'Roboto-Bold'} color={''} fontSize={''} />
                </View>

                {/* Categorias */}
                <View style={styles.categories}>
                    <Text style={styles.categoryText}>Categorias</Text>
                    <View style={styles.categoryTags}>
                        <Text style={styles.categoryTag}>Aprendiz 🏅</Text>
                        <Text style={styles.categoryTag}>Virtuoso 🥇</Text>
                        <Text style={styles.categoryTag}>Maestro 🏆</Text>
                    </View>
                </View>

                {/* Cartões */}
                <View style={styles.cardGrid}>
                    {categorias.map((categoria, index) => (
                        <View key={index} style={styles.cardWrapper}>
                            {renderCard(categoria)}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
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
    categoryText: {
        fontSize: 14,
        fontWeight: 'semibold',
        color: 'black',
        fontFamily: 'Poppins-SemiBold',
    },
    categoryTags: {
        flexDirection: 'row',
        marginTop: 8,
    },
    categoryTag: {
        fontSize: 12,
        color: '#000000',
        marginRight: 10,
        fontFamily: 'Poppins-Regular',
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
        padding: 15,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
        width: '100%',
        minHeight: 110,
    },
    cardText: {
        marginLeft: 10,
        fontSize: width < 400 ? 14 : 16,
        fontWeight: 'light',
        flexShrink: 1,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    containerNoteIcon: {
        backgroundColor: '#C6E8FF',
        padding: 1,
        marginBottom: 20,
    },
    image: {
        resizeMode: 'contain',
    },
    Note: {
        height: 20,
        width: 20,
        margin: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
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

export default ModuleCategory;

