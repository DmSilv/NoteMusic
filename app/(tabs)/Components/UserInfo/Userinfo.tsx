    import React from 'react';
    import { View, Text, StyleSheet } from 'react-native';
    import SubTitleComponent from '../SubTitle/SubTitle'; // Ajuste o caminho conforme necessário
    import TitleComponent from '../Title/Title'; // Ajuste o caminho conforme necessário

    // Definindo os tipos de props para o componente
    interface UserInfoProps {
    userName: string;
    userSubtitle: string;
    }

    const UserInfo: React.FC<UserInfoProps> = ({ userName, userSubtitle }) => {
    return (
        <View style={styles.container}>
        <SubTitleComponent fontFamily={'Roboto-Light'} subtitle={userSubtitle} color={'#43BBFF'} marginRight={''} marginTop={''}/>
        <View style={styles.line} />
        <TitleComponent title={userName} fontFamily={'Roboto-Bold'}  color={''} fontSize={''}/> 
        </View>
    );
    };

    const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    line: {
        width: 0.5,
        height: 30,
        backgroundColor: 'black',
        marginHorizontal: 5,
    },
    });

    export default UserInfo;
