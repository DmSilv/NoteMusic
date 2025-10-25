import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, useWindowDimensions, Image, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import eyeIcon from '../../../assets/images/eye.png';
import eyeOffIcon from '../../../assets/images/eye-off.png';
import TitleComponent from '../Components/Title/Title';
import SubTitleComponent from '../Components/SubTitle/SubTitle';
import PrimaryButton from '../Components/Form/Button/PrimaryButton/PrimaryButton';
import SecondaryButton from '../Components/Form/Button/SecondaryButton/SecondaryButton';
import Input from '../Components/Form/Input/Input';
import MenuBottom from '../Components/MenuBottom';
import EditAccount from '../../../assets/images/Edit-Account.png';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validateName } from '../../../utils/validation';
interface ModuleCategoryProps {
    navigation: StackNavigationProp<any>;
}
 const ProfileAccount: React.FC<ModuleCategoryProps> = ({ navigation }) => {
    const scrollViewRef = useRef<ScrollView>(null); 
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const { user, logout, updateUser } = useAuth();
    
    // Estados do formulário
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: ''
    });

    // Atualizar formData quando user mudar
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        }
    }, [user]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Estados de validação
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: ''
    });
  
    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
        setKeyboardVisible(true);
        scrollViewRef.current?.scrollTo({ y: 10000, animated: true });
      });
  
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardVisible(false);
      });
  
      return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
      };
    }, []);

    const validateForm = () => {
        let isValid = true;
        const newErrors = { ...errors };
        
        // ✅ Validar nome com filtro de palavras inapropriadas
        if (formData.name.trim()) {
            const nameValidation = validateName(formData.name);
            if (!nameValidation.isValid) {
                newErrors.name = nameValidation.error || 'Nome inválido';
                isValid = false;
            } else {
                newErrors.name = '';
            }
        } else {
            newErrors.name = '';
        }
        
        // ✅ Validar email com verificação de domínio
        if (formData.email.trim()) {
            const emailValidation = validateEmail(formData.email);
            if (!emailValidation.isValid) {
                newErrors.email = emailValidation.error || 'E-mail inválido';
                isValid = false;
            } else {
                newErrors.email = '';
            }
        } else {
            newErrors.email = '';
        }
        
        // Validar senha atual (se tentando alterar email ou senha)
        const isChangingEmailOrPassword = (formData.email.trim() && formData.email !== user?.email) || formData.newPassword.trim();
        if (isChangingEmailOrPassword && !formData.currentPassword.trim()) {
            newErrors.currentPassword = 'Senha atual é obrigatória para alterar email ou senha';
            isValid = false;
        } else if (formData.currentPassword.trim() && formData.currentPassword.length < 6) {
            newErrors.currentPassword = 'Senha deve ter pelo menos 6 caracteres';
            isValid = false;
        } else {
            newErrors.currentPassword = '';
        }
        
        // Validar nova senha (se fornecida)
        if (formData.newPassword.trim() && formData.newPassword.length < 6) {
            newErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
            isValid = false;
        } else {
            newErrors.newPassword = '';
        }
        
        setErrors(newErrors);
        return isValid;
    };

    const hasChanges = () => {
        return (
            (formData.name.trim() && formData.name !== user?.name) ||
            (formData.email.trim() && formData.email !== user?.email) ||
            formData.currentPassword.trim() ||
            formData.newPassword.trim()
        );
    };

    const handleUpdateAccount = async () => {
        if (!validateForm()) {
            Alert.alert('Erro de Validação', 'Por favor, corrija os erros nos campos.');
            return;
        }

        // Verificar se há mudanças
        if (!hasChanges()) {
            Alert.alert('Aviso', 'Nenhuma alteração foi feita nos campos.');
            return;
        }

        setIsLoading(true);
        
        try {
            // Preparar dados para atualização
            const updateData: any = {};
            
            if (formData.name.trim() && formData.name !== user?.name) {
                updateData.name = formData.name.trim();
            }
            if (formData.email.trim() && formData.email !== user?.email) {
                updateData.email = formData.email.trim();
            }
            if (formData.currentPassword.trim()) {
                updateData.currentPassword = formData.currentPassword.trim();
            }
            if (formData.newPassword.trim()) {
                updateData.newPassword = formData.newPassword.trim();
            }
            
            // Chamar função de atualização do contexto
            await updateUser(updateData);
            
            Alert.alert('Sucesso', 'Conta atualizada com sucesso!');
            
            // Limpar campos de senha
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: ''
            }));
            
        } catch (error: any) {
            console.error('Erro ao atualizar conta:', error);
            Alert.alert('Erro', error.message || 'Não foi possível atualizar a conta. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Sair da conta',
            'Tem certeza que deseja sair da sua conta?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'SelectionScreen' }],
                        });
                    },
                },
            ]
        );
    };

    // ✅ Removido - usando validateEmail do utils/validation.ts (já importado)

    const validateField = (field: string, value: string) => {
        let error = '';
        
        switch (field) {
            case 'name':
                if (value.trim()) {
                    // ✅ Usar validação completa incluindo filtro de palavras inapropriadas
                    const nameValidation = validateName(value);
                    if (!nameValidation.isValid) {
                        error = nameValidation.error || 'Nome inválido';
                    }
                }
                break;
            case 'email':
                if (value.trim()) {
                    const emailValidation = validateEmail(value);
                    if (!emailValidation.isValid) {
                        error = emailValidation.error || 'E-mail inválido';
                    }
                }
                break;
            case 'currentPassword':
                if (value.trim() && value.length < 6) {
                    error = 'Senha deve ter pelo menos 6 caracteres';
                }
                break;
            case 'newPassword':
                if (value.trim() && value.length < 6) {
                    error = 'Nova senha deve ter pelo menos 6 caracteres';
                }
                break;
        }
        
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
    };

    const handleInputChange = (field: string, value: string) => {
        // Para o campo nome, limitar a 15 caracteres (apenas primeiro nome)
        if (field === 'name' && value.length > 15) {
            return; // Não permitir mais de 15 caracteres
        }
        
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Validar campo em tempo real
        validateField(field, value);
    };

    // Função para calcular marginTop dinâmico
    const calculateMarginTop = () => {
        if (windowHeight < 600) {
            return 20; // Para telas pequenas
        } else if (windowHeight >= 600 && windowHeight < 800) {
            return 30; // Para telas médias
        } else {
            return 40; // Para telas grandes
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollViewContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.containerForm, { marginTop: calculateMarginTop(), borderTopLeftRadius: keyboardVisible ? 0 : 40, borderTopRightRadius: keyboardVisible ? 0 : 40 }]}>
                  
                    <View style={styles.containerImage}>
                        <Image source={EditAccount} style={styles.image} />
                    </View>
                    <TitleComponent color={''} fontFamily={''} title={'Gerenciar Conta'} fontSize={''} truncate={false} />
                    <SubTitleComponent subtitle={'Preencha apenas os campos que deseja alterar na sua conta.'} fontFamily={'Roboto-Light'}  color={''} marginRight={''} marginTop={''}/>
                    
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>
                            💡 Dica: Deixe os campos vazios se não quiser alterá-los
                        </Text>
                    </View>

                    <SubTitleComponent subtitle={'Nome completo'} fontFamily={'Roboto-Light'}  color={''} marginRight={''} marginTop={''}/>
                    <Input 
                        onChangeText={(text) => handleInputChange('name', text)} 
                        placeholder={'Digite apenas seu primeiro nome (máx. 15 caracteres)'} 
                        secureTextEntry={false} 
                        styleWidth={{ width: windowWidth * 0.85 }}
                        value={formData.name}
                        error={errors.name}
                        maxLength={15}
                    />

                    <SubTitleComponent subtitle={'E-mail'} fontFamily={'Roboto-Light'}  color={''} marginRight={''} marginTop={''}/>
                    <Input 
                        onChangeText={(text) => handleInputChange('email', text)} 
                        placeholder={'Digite seu e-mail'} 
                        secureTextEntry={false} 
                        styleWidth={{ width: windowWidth * 0.85 }}
                        value={formData.email}
                        error={errors.email}
                    />

                    <SubTitleComponent subtitle={'Senha Antiga'} fontFamily={'Roboto-Light'}  color={''} marginRight={''} marginTop={''}/>
                    <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
                        <Input 
                            onChangeText={(text) => handleInputChange('currentPassword', text)} 
                            placeholder={'Digite sua senha atual'} 
                            secureTextEntry={!showCurrentPassword} 
                            styleWidth={{ width: '100%' }}
                            value={formData.currentPassword}
                            error={errors.currentPassword}
                        />
                        <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeIconContainer}>
                            <Image source={showCurrentPassword ? eyeIcon : eyeOffIcon} style={styles.eyeIcon} />
                        </TouchableOpacity>
                    </View>

                    <SubTitleComponent subtitle={'Nova Senha'} fontFamily={'Roboto-Light'}  color={''} marginRight={''} marginTop={''}/>
                    <View style={[styles.passwordContainer, { width: windowWidth * 0.85 }]}>
                        <Input 
                            onChangeText={(text) => handleInputChange('newPassword', text)} 
                            placeholder={'Crie uma nova senha'} 
                            secureTextEntry={!showNewPassword} 
                            styleWidth={{ width: '100%' }}
                            value={formData.newPassword}
                            error={errors.newPassword}
                        />
                        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeIconContainer}>
                            <Image source={showNewPassword ? eyeIcon : eyeOffIcon} style={styles.eyeIcon} />
                        </TouchableOpacity>
                    </View>

                    <PrimaryButton 
                        onPress={handleUpdateAccount} 
                        styleWidth={{ width: windowWidth * 0.85 }} 
                        title={hasChanges() ? 'Atualizar Conta' : 'Nenhuma alteração'}
                        loading={isLoading}
                        disabled={isLoading || !hasChanges()}
                    />
                    
                    <View style={styles.logoutContainer}>
                        <TouchableOpacity 
                            style={styles.deleteAccountButton}
                            onPress={() => {
                                Alert.alert(
                                    'Excluir Conta',
                                    'Tem certeza que deseja excluir sua conta? Esta ação é irreversível.',
                                    [
                                        { text: 'Cancelar', style: 'cancel' },
                                        { 
                                            text: 'Continuar', 
                                            style: 'destructive',
                                            onPress: () => navigation.navigate('AccountDeletion')
                                        }
                                    ]
                                );
                            }}
                        >
                            <Text style={styles.deleteAccountButtonText}>Excluir Conta</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.logoutContainer}>
                        <SecondaryButton onPress={handleLogout} styleWidth={{ width: windowWidth * 0.85 }} title={'Sair da Conta'} />
                    </View>
                </View>
            </ScrollView>

            {!keyboardVisible && (
              <MenuBottom
              current="profile"
              goHome={() => navigation.navigate('ProfileHome')}
              goProfile={() => {}}
          />
          
            )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: -40,
        borderRadius: 0,
    },
    containerForm: {
        paddingHorizontal: 24,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 0,
    },

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    eyeIconContainer: {
        position: 'absolute',
        right: 10,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    eyeIcon: {
        width: 24,
        height: 24,
    },
    containerImage: {
        marginBottom: 12,
    },
    image: {
        width: '100%',
        height: 270,
        resizeMode: 'contain',
    },
    logoutContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    infoContainer: {
        backgroundColor: '#F0F8FF',
        padding: 12,
        borderRadius: 8,
        marginVertical: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#0087D3',
    },
    infoText: {
        color: '#0087D3',
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
    },
    deleteAccountButton: {
        backgroundColor: '#DC3545',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#C82333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    deleteAccountButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});

export default ProfileAccount;