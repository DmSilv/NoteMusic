// Sistema de tratamento de erros para apresentar mensagens específicas ao usuário

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface ErrorMessage {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

// Mapeamento de códigos de erro para mensagens amigáveis
const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  // Erros de autenticação
  'INVALID_CREDENTIALS': {
    title: 'Credenciais Inválidas',
    message: 'Email ou senha incorretos. Verifique seus dados e tente novamente.',
    type: 'error'
  },
  'USER_NOT_FOUND': {
    title: 'Usuário Não Encontrado',
    message: 'Nenhuma conta encontrada com este email. Verifique o endereço ou crie uma nova conta.',
    type: 'error'
  },
  'EMAIL_NOT_FOUND': {
    title: 'Email Não Encontrado',
    message: 'Este email não está cadastrado em nossa plataforma. Verifique o endereço ou crie uma nova conta.',
    type: 'error'
  },
  'INVALID_EMAIL': {
    title: 'Email Inválido',
    message: 'O formato do email está incorreto. Digite um email válido.',
    type: 'error'
  },
  'WEAK_PASSWORD': {
    title: 'Senha Fraca',
    message: 'A senha deve ter pelo menos 6 caracteres. Escolha uma senha mais forte.',
    type: 'error'
  },
  'PASSWORDS_DONT_MATCH': {
    title: 'Senhas Não Coincidem',
    message: 'As senhas digitadas não são iguais. Verifique e tente novamente.',
    type: 'error'
  },
  'INVALID_PASSWORD': {
    title: 'Senha Incorreta',
    message: 'A senha atual está incorreta. Verifique e tente novamente.',
    type: 'error'
  },
  'TEMP_PASSWORD_REQUIRED': {
    title: 'Senha Temporária Detectada',
    message: 'Você deve alterar sua senha temporária antes de continuar.',
    type: 'warning'
  },

  // Erros de registro
  'USER_ALREADY_EXISTS': {
    title: 'Conta Já Existe',
    message: 'Já existe uma conta cadastrada com este email. Tente fazer login ou use outro email.',
    type: 'error'
  },
  'EMAIL_ALREADY_REGISTERED': {
    title: 'Email Já Cadastrado',
    message: 'Este email já está sendo usado por outra conta. Tente fazer login ou use outro email.',
    type: 'error'
  },
  'INVALID_NAME': {
    title: 'Nome Inválido',
    message: 'O nome deve ter entre 2 e 15 caracteres e conter apenas letras.',
    type: 'error'
  },
  'NAME_TOO_SHORT': {
    title: 'Nome Muito Curto',
    message: 'O nome deve ter pelo menos 2 caracteres.',
    type: 'error'
  },
  'NAME_TOO_LONG': {
    title: 'Nome Muito Longo',
    message: 'O nome deve ter no máximo 15 caracteres (apenas primeiro nome).',
    type: 'error'
  },

  // Erros de recuperação de senha
  'EMAIL_SEND_FAILED': {
    title: 'Erro ao Enviar Email',
    message: 'Não foi possível enviar o email de recuperação. Verifique sua conexão e tente novamente.',
    type: 'error'
  },
  'INVALID_RESET_TOKEN': {
    title: 'Token Inválido',
    message: 'O link de recuperação é inválido ou expirou. Solicite um novo link.',
    type: 'error'
  },
  'RESET_TOKEN_EXPIRED': {
    title: 'Link Expirado',
    message: 'O link de recuperação expirou. Solicite um novo link de recuperação.',
    type: 'error'
  },

  // Erros de rede e servidor
  'NETWORK_ERROR': {
    title: 'Erro de Conexão',
    message: 'Verifique sua conexão com a internet e tente novamente.',
    type: 'error'
  },
  'SERVER_ERROR': {
    title: 'Erro do Servidor',
    message: 'Ocorreu um erro interno. Tente novamente em alguns minutos.',
    type: 'error'
  },
  'SERVICE_UNAVAILABLE': {
    title: 'Serviço Indisponível',
    message: 'O serviço está temporariamente indisponível. Tente novamente mais tarde.',
    type: 'error'
  },
  'TIMEOUT': {
    title: 'Tempo Esgotado',
    message: 'A operação demorou muito para ser concluída. Verifique sua conexão e tente novamente.',
    type: 'error'
  },
  'RATE_LIMIT_EXCEEDED': {
    title: 'Muitas Tentativas',
    message: 'Você fez muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
    type: 'warning'
  },
  'TOO_MANY_ATTEMPTS': {
    title: 'Muitas Tentativas de Login',
    message: 'Muitas tentativas de login. Aguarde 1 minuto antes de tentar novamente.',
    type: 'warning'
  },

  // Erros de validação
  'VALIDATION_ERROR': {
    title: 'Dados Inválidos',
    message: 'Verifique os dados informados e tente novamente.',
    type: 'error'
  },
  'REQUIRED_FIELD': {
    title: 'Campo Obrigatório',
    message: 'Este campo é obrigatório. Preencha todas as informações necessárias.',
    type: 'error'
  },
  'INVALID_FORMAT': {
    title: 'Formato Inválido',
    message: 'O formato dos dados está incorreto. Verifique e tente novamente.',
    type: 'error'
  },

  // Erros de permissão
  'UNAUTHORIZED': {
    title: 'Acesso Negado',
    message: 'Você não tem permissão para realizar esta ação. Faça login novamente.',
    type: 'error'
  },
  'FORBIDDEN': {
    title: 'Ação Não Permitida',
    message: 'Esta ação não é permitida. Verifique suas permissões.',
    type: 'error'
  },
  'SESSION_EXPIRED': {
    title: 'Sessão Expirada',
    message: 'Sua sessão expirou. Faça login novamente para continuar.',
    type: 'warning'
  },

  // Erros de dados
  'DATA_NOT_FOUND': {
    title: 'Dados Não Encontrados',
    message: 'Os dados solicitados não foram encontrados.',
    type: 'error'
  },
  'DUPLICATE_DATA': {
    title: 'Dados Duplicados',
    message: 'Estes dados já existem no sistema.',
    type: 'error'
  },
  'INVALID_DATA': {
    title: 'Dados Inválidos',
    message: 'Os dados fornecidos são inválidos.',
    type: 'error'
  }
};

// Função para extrair código de erro da mensagem ou resposta da API
const extractErrorCode = (error: any): string | null => {
  // Tentar extrair código de diferentes formatos de erro
  if (error?.code) return error.code;
  if (error?.error?.code) return error.error.code;
  if (error?.response?.data?.code) return error.response.data.code;
  if (error?.data?.code) return error.data.code;
  
  // Tentar extrair da mensagem
  if (error?.message) {
    const message = error.message.toLowerCase();
    
    // Mapear mensagens comuns para códigos
    if (message.includes('email já existe') || message.includes('user already exists')) return 'USER_ALREADY_EXISTS';
    if (message.includes('email não encontrado') || message.includes('user not found')) return 'USER_NOT_FOUND';
    if (message.includes('credenciais inválidas') || message.includes('invalid credentials')) return 'INVALID_CREDENTIALS';
    if (message.includes('senha incorreta') || message.includes('invalid password')) return 'INVALID_PASSWORD';
    if (message.includes('email inválido') || message.includes('invalid email')) return 'INVALID_EMAIL';
    if (message.includes('senha fraca') || message.includes('weak password')) return 'WEAK_PASSWORD';
    if (message.includes('senhas não coincidem') || message.includes('passwords dont match')) return 'PASSWORDS_DONT_MATCH';
    if (message.includes('nome inválido') || message.includes('invalid name')) return 'INVALID_NAME';
    if (message.includes('muitas tentativas') || message.includes('too many attempts')) return 'TOO_MANY_ATTEMPTS';
    if (message.includes('rate limit') || message.includes('muitas tentativas')) return 'RATE_LIMIT_EXCEEDED';
    if (message.includes('network') || message.includes('conexão')) return 'NETWORK_ERROR';
    if (message.includes('timeout') || message.includes('tempo esgotado')) return 'TIMEOUT';
    if (message.includes('servidor') || message.includes('server')) return 'SERVER_ERROR';
    if (message.includes('não autorizado') || message.includes('unauthorized')) return 'UNAUTHORIZED';
    if (message.includes('sessão expirada') || message.includes('session expired')) return 'SESSION_EXPIRED';
  }
  
  return null;
};

// Função para determinar o tipo de erro baseado no status HTTP
const getErrorTypeFromStatus = (status?: number): 'error' | 'warning' | 'info' => {
  if (!status) return 'error';
  
  if (status >= 400 && status < 500) return 'error';
  if (status >= 500) return 'error';
  if (status === 429) return 'warning';
  
  return 'error';
};

// Função principal para processar erros e retornar mensagens amigáveis
export const processError = (error: any): ErrorMessage => {
  console.log('🔍 Processando erro:', error);
  
  // Extrair código de erro
  const errorCode = extractErrorCode(error);
  
  // Se encontrou código específico, usar mensagem mapeada
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }
  
  // Tentar extrair informações da resposta da API
  const apiMessage = error?.response?.data?.message || error?.data?.message || error?.message;
  const status = error?.response?.status || error?.status;
  
  // Se tem mensagem da API, usar ela
  if (apiMessage && typeof apiMessage === 'string') {
    return {
      title: 'Erro',
      message: apiMessage,
      type: getErrorTypeFromStatus(status)
    };
  }
  
  // Fallback para erros genéricos
  if (status === 400) {
    return {
      title: 'Dados Inválidos',
      message: 'Os dados fornecidos são inválidos. Verifique as informações e tente novamente.',
      type: 'error'
    };
  }
  
  if (status === 401) {
    return {
      title: 'Não Autorizado',
      message: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.',
      type: 'error'
    };
  }
  
  if (status === 403) {
    return {
      title: 'Acesso Negado',
      message: 'Você não tem permissão para realizar esta ação.',
      type: 'error'
    };
  }
  
  if (status === 404) {
    return {
      title: 'Não Encontrado',
      message: 'O recurso solicitado não foi encontrado.',
      type: 'error'
    };
  }
  
  if (status === 409) {
    return {
      title: 'Conflito',
      message: 'Já existe uma conta com este email. Tente fazer login ou use outro email.',
      type: 'error'
    };
  }
  
  if (status === 429) {
    return {
      title: 'Muitas Tentativas',
      message: 'Você fez muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
      type: 'warning'
    };
  }
  
  if (status >= 500) {
    return {
      title: 'Erro do Servidor',
      message: 'Ocorreu um erro interno. Tente novamente em alguns minutos.',
      type: 'error'
    };
  }
  
  // Erro genérico
  return {
    title: 'Erro',
    message: 'Ocorreu um erro inesperado. Tente novamente.',
    type: 'error'
  };
};

// Função para criar mensagens de sucesso
export const createSuccessMessage = (action: string): ErrorMessage => {
  const successMessages: Record<string, ErrorMessage> = {
    'login': {
      title: 'Login Realizado!',
      message: 'Bem-vindo de volta! Você foi logado com sucesso.',
      type: 'info'
    },
    'register': {
      title: 'Conta Criada!',
      message: 'Sua conta foi criada com sucesso! Bem-vindo ao NoteMusic!',
      type: 'info'
    },
    'password_reset': {
      title: 'Email Enviado!',
      message: 'Instruções de recuperação foram enviadas para seu email.',
      type: 'info'
    },
    'password_changed': {
      title: 'Senha Alterada!',
      message: 'Sua senha foi alterada com sucesso.',
      type: 'info'
    },
    'profile_updated': {
      title: 'Perfil Atualizado!',
      message: 'Seus dados foram atualizados com sucesso.',
      type: 'info'
    }
  };
  
  return successMessages[action] || {
    title: 'Sucesso!',
    message: 'Operação realizada com sucesso.',
    type: 'info'
  };
};

export default processError;



