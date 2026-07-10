import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SubTitleComponent from '@/shared/components/form/SubTitle/SubTitle';
import TitleComponent from '@/shared/components/form/Title/Title';
import { useAuth } from '@/contexts/AuthContext';
import { getLevelColors, formatLevelDisplay } from '@/shared/constants/theme';
import { getLevelTheme } from '@/shared/constants/levelTheme';
import { useUserData } from '@/shared/hooks/useUserData';

// Definindo os tipos de props para o componente
interface UserInfoProps {
    userName?: string;
    userSubtitle?: string;
    useRealTimeData?: boolean;
    /** 'chrome' = textos/ícones brancos para header sobre fundo colorido do nível */
    variant?: 'content' | 'chrome';
}

const UserInfo: React.FC<UserInfoProps> = ({ 
    userName: propUserName, 
    userSubtitle: propUserSubtitle, 
    useRealTimeData = true,
    variant = 'content',
}) => {
    const { user } = useAuth();
    const { userData, isLoading, retryCount } = useUserData(useRealTimeData ? 60000 : 0);

    const displayName = propUserName || (isLoading ? '' : userData?.name) || user?.name || 'Usuário';
    const rawLevel = propUserSubtitle || (isLoading ? '' : userData?.level) || user?.level;
    const displayLevel = rawLevel ? formatLevelDisplay(rawLevel) : '...';
    
    const levelColors = getLevelColors(rawLevel || user?.level || 'aprendiz');
    const chrome = getLevelTheme(rawLevel || user?.level || 'aprendiz');
    const subtitleColor = variant === 'chrome' ? chrome.textColor : levelColors.primary;
    const titleColor = variant === 'chrome' ? chrome.textColor : levelColors.text;
    const lineColor = variant === 'chrome' ? chrome.iconColor : levelColors.primary;
    const badgeColor = variant === 'chrome' ? chrome.iconColor : levelColors.primary;

    // Mostrar indicador de erro se houver muitos retries
    const showErrorIndicator = retryCount > 2;

    return (
        <View style={styles.container}>
            <SubTitleComponent 
                fontFamily={'Roboto-Light'} 
                subtitle={displayLevel} 
                color={subtitleColor} 
                marginRight={0} 
                marginTop={0}
            />
            <View style={[styles.line, { backgroundColor: lineColor }]} />
            <TitleComponent 
                title={displayName} 
                fontFamily={'Roboto-Bold'}  
                color={titleColor} 
                MarginTop={0}
            />
            {showErrorIndicator && (
                <View style={[styles.errorIndicator, { backgroundColor: badgeColor }]}>
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
