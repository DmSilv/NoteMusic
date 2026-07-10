import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import SubTitleComponent from '@/shared/components/form/SubTitle/SubTitle';
import TitleComponent from '@/shared/components/form/Title/Title';
import { useAuth } from '@/contexts/AuthContext';
import { getLevelColors, formatLevelDisplay } from '@/shared/constants/theme';
import { getLevelTheme } from '@/shared/constants/levelTheme';
import { useUserData } from '@/shared/hooks/useUserData';

// Espaço reservado no header para o botão de voltar (posicionado de forma
// absoluta, fora do fluxo do flex) + padding horizontal do ChromeNavHeader
// (16px de cada lado) + respiro entre o botão e o texto. Fixo em px porque o
// próprio botão de voltar tem tamanho fixo — o que varia é a largura da tela.
const RESERVED_SPACE_FOR_BACK_BUTTON = 96;
const MIN_USER_INFO_WIDTH = 110;

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
    const { width: windowWidth } = useWindowDimensions();

    // Independente do tamanho da tela: reserva espaço para o botão de voltar
    // e deixa o restante para nível + divisória + nome, truncando o nome (não
    // o nível, que é sempre curto) quando não houver espaço suficiente.
    const maxContainerWidth = Math.max(
        windowWidth - RESERVED_SPACE_FOR_BACK_BUTTON,
        MIN_USER_INFO_WIDTH
    );

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
        <View style={[styles.container, { maxWidth: maxContainerWidth }]}>
            <View style={styles.levelBlock}>
                <SubTitleComponent 
                    fontFamily={'Roboto-Light'} 
                    subtitle={displayLevel} 
                    color={subtitleColor} 
                    marginRight={0} 
                    marginTop={0}
                />
            </View>
            <View style={[styles.line, { backgroundColor: lineColor }]} />
            <TitleComponent 
                title={displayName} 
                fontFamily={'Roboto-Bold'}  
                color={titleColor} 
                MarginTop={0}
                numberOfLines={1}
                shrink
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
    levelBlock: {
        flexShrink: 0,
    },
    line: {
        width: 0.5,
        height: 30,
        backgroundColor: 'black',
        marginHorizontal: 5,
        flexShrink: 0,
    },
    errorIndicator: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    errorText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default UserInfo;
