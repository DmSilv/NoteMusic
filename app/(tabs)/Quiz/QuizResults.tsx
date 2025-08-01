import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import BackButton from '../Components/BackButton/BackButton';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface QuizResultsProps {
    navigation: StackNavigationProp<any>;
    route: {
        params: {
            score: number;
            total: number;
        };
    };
}

const QuizResults: React.FC<QuizResultsProps> = ({ navigation, route }) => {
    const { score, total } = route.params;
    const percentage = (score / total) * 100;

    const getPerformanceMessage = () => {
        if (percentage >= 90) {
            return {
                title: 'Excelente!',
                message: 'Você demonstrou um conhecimento excepcional!',
                color: '#4CAF50',
                emoji: '🎉'
            };
        } else if (percentage >= 80) {
            return {
                title: 'Muito Bom!',
                message: 'Você tem um conhecimento sólido sobre o assunto.',
                color: '#4CAF50',
                emoji: '👏'
            };
        } else if (percentage >= 60) {
            return {
                title: 'Bom Trabalho!',
                message: 'Continue estudando para melhorar ainda mais.',
                color: '#FF9800',
                emoji: '👍'
            };
        } else {
            return {
                title: 'Continue Praticando!',
                message: 'A teoria musical requer dedicação e prática constante.',
                color: '#F44336',
                emoji: '💪'
            };
        }
    };

    const performance = getPerformanceMessage();

    const handleBackToHome = () => {
        navigation.navigate('ProfileHome');
    };

    const handleRetryQuiz = () => {
        navigation.navigate('Quiz');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BackButton onPress={() => navigation.goBack()} />
                <Text style={styles.headerTitle}>Resultados</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Score Card */}
                <View style={styles.scoreCard}>
                    <Text style={styles.emoji}>{performance.emoji}</Text>
                    <Text style={[styles.performanceTitle, { color: performance.color }]}>
                        {performance.title}
                    </Text>
                    <Text style={styles.performanceMessage}>
                        {performance.message}
                    </Text>
                </View>

                {/* Score Details */}
                <View style={styles.scoreDetails}>
                    <View style={styles.scoreRow}>
                        <Text style={styles.scoreLabel}>Pontuação:</Text>
                        <Text style={styles.scoreValue}>{score}/{total}</Text>
                    </View>
                    <View style={styles.scoreRow}>
                        <Text style={styles.scoreLabel}>Percentual:</Text>
                        <Text style={styles.scoreValue}>{percentage.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.scoreRow}>
                        <Text style={styles.scoreLabel}>Questões Corretas:</Text>
                        <Text style={styles.scoreValue}>{score}</Text>
                    </View>
                    <View style={styles.scoreRow}>
                        <Text style={styles.scoreLabel}>Questões Incorretas:</Text>
                        <Text style={styles.scoreValue}>{total - score}</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarBackground}>
                        <View 
                            style={[
                                styles.progressBar, 
                                { 
                                    width: `${percentage}%`,
                                    backgroundColor: performance.color
                                }
                            ]} 
                        />
                    </View>
                </View>

                {/* Tips */}
                <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>💡 Dicas para Melhorar</Text>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipText}>• Revise os conceitos básicos regularmente</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipText}>• Pratique com exercícios diários</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipText}>• Ouça diferentes tipos de música</Text>
                    </View>
                    <View style={styles.tipItem}>
                        <Text style={styles.tipText}>• Use aplicativos de teoria musical</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={[styles.button, styles.retryButton]} 
                        onPress={handleRetryQuiz}
                    >
                        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.button, styles.homeButton]} 
                        onPress={handleBackToHome}
                    >
                        <Text style={styles.homeButtonText}>Voltar ao Menu</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: Math.max(16, screenWidth * 0.04),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Math.max(16, screenHeight * 0.02),
        marginBottom: Math.max(16, screenHeight * 0.02),
    },
    headerTitle: {
        fontSize: Math.max(20, screenWidth * 0.05),
        fontWeight: 'bold',
        color: '#131313',
        marginLeft: Math.max(16, screenWidth * 0.04),
        fontFamily: 'Roboto-Bold',
    },
    content: {
        flex: 1,
    },
    scoreCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: Math.max(16, screenWidth * 0.04),
        padding: Math.max(24, screenWidth * 0.06),
        marginBottom: Math.max(24, screenHeight * 0.03),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    emoji: {
        fontSize: Math.max(48, screenWidth * 0.12),
        marginBottom: Math.max(16, screenHeight * 0.02),
    },
    performanceTitle: {
        fontSize: Math.max(24, screenWidth * 0.06),
        fontWeight: 'bold',
        marginBottom: Math.max(8, screenHeight * 0.01),
        fontFamily: 'Roboto-Bold',
        textAlign: 'center',
    },
    performanceMessage: {
        fontSize: Math.max(16, screenWidth * 0.04),
        color: '#545454',
        textAlign: 'center',
        lineHeight: Math.max(22, screenHeight * 0.028),
        fontFamily: 'Roboto-Regular',
    },
    scoreDetails: {
        backgroundColor: '#FFFFFF',
        borderRadius: Math.max(12, screenWidth * 0.03),
        padding: Math.max(20, screenWidth * 0.05),
        marginBottom: Math.max(24, screenHeight * 0.03),
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Math.max(8, screenHeight * 0.01),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
    },
    scoreLabel: {
        fontSize: Math.max(16, screenWidth * 0.04),
        color: '#545454',
        fontFamily: 'Roboto-Regular',
    },
    scoreValue: {
        fontSize: Math.max(18, screenWidth * 0.045),
        fontWeight: 'bold',
        color: '#131313',
        fontFamily: 'Roboto-Bold',
    },
    progressContainer: {
        marginBottom: Math.max(24, screenHeight * 0.03),
    },
    progressBarBackground: {
        height: Math.max(12, screenHeight * 0.015),
        backgroundColor: '#E9ECEF',
        borderRadius: Math.max(6, screenWidth * 0.015),
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: Math.max(6, screenWidth * 0.015),
    },
    tipsContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: Math.max(12, screenWidth * 0.03),
        padding: Math.max(20, screenWidth * 0.05),
        marginBottom: Math.max(24, screenHeight * 0.03),
    },
    tipsTitle: {
        fontSize: Math.max(18, screenWidth * 0.045),
        fontWeight: 'bold',
        color: '#131313',
        marginBottom: Math.max(16, screenHeight * 0.02),
        fontFamily: 'Roboto-Bold',
    },
    tipItem: {
        marginBottom: Math.max(8, screenHeight * 0.01),
    },
    tipText: {
        fontSize: Math.max(14, screenWidth * 0.035),
        color: '#545454',
        lineHeight: Math.max(20, screenHeight * 0.025),
        fontFamily: 'Roboto-Regular',
    },
    actionButtons: {
        gap: Math.max(12, screenHeight * 0.015),
        marginBottom: Math.max(24, screenHeight * 0.03),
    },
    button: {
        height: Math.max(48, screenHeight * 0.06),
        borderRadius: Math.max(24, screenWidth * 0.06),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Math.max(24, screenWidth * 0.06),
    },
    retryButton: {
        backgroundColor: '#0A8CD6',
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: Math.max(16, screenWidth * 0.04),
        fontWeight: 'bold',
        fontFamily: 'Roboto-Bold',
    },
    homeButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#0A8CD6',
    },
    homeButtonText: {
        color: '#0A8CD6',
        fontSize: Math.max(16, screenWidth * 0.04),
        fontWeight: 'bold',
        fontFamily: 'Roboto-Bold',
    },
});

export default QuizResults; 