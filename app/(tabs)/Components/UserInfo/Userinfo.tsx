import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SubTitleComponent from '../SubTitle/SubTitle';
import TitleComponent from '../Title/Title';
import { useAuth } from '../../../contexts/AuthContext';
import { getLevelColors, formatLevelDisplay } from '../../../../constants/LevelColors';
import { useUserData } from '../../../../hooks/useUserData';

// Definindo os tipos de props para o componente
interface UserInfoProps {
    userName?: string;
    userSubtitle?: string;
    useRealTimeData?: boolean; // Nova prop para controlar se deve buscar dados em tempo real
}

const UserInfo: React.FC<UserInfoProps> = ({ 
    userName: propUserName, 
    userSubtitle: propUserSubtitle, 
    useRealTimeData = true 
}) => {
    const { user } = useAuth();
    const { userData, isLoading, retryCount } = useUserData(useRealTimeData ? 60000 : 0); // 60 segundos se usar dados em tempo real

    // Determinar dados a serem exibidos
    const displayName = propUserName || userData?.name || user?.name || "Usuário";
    const rawLevel = propUserSubtitle || userData?.level || user?.level || "aprendiz";
    const displayLevel = formatLevelDisplay(rawLevel);
    
    // Obter cores baseadas no nível
    const levelColors = getLevelColors(displayLevel);

    // Mostrar indicador de erro se houver muitos retries
    const showErrorIndicator = retryCount > 2;

    return (
        <View style={styles.container}>
            <SubTitleComponent 
                fontFamily={'Roboto-Light'} 
                subtitle={displayLevel} 
                color={levelColors.primary} 
                marginRight={''} 
                marginTop={''}
            />
            <View style={[styles.line, { backgroundColor: levelColors.primary }]} />
            <TitleComponent 
                title={displayName} 
                fontFamily={'Roboto-Bold'}  
                color={levelColors.text} 
                fontSize={''}
            />
            {showErrorIndicator && (
                <View style={[styles.errorIndicator, { backgroundColor: levelColors.primary }]}>
                    <Text style={styles.errorText}>!</Text>
                </View>
            )}
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
    errorIndicator: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default UserInfo;
