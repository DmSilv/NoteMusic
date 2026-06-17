# 🚀 GUIA COMPLETO - PUBLICAR NOTEMUSIC NA PLAY STORE

## 📋 PRÉ-REQUISITOS

### 1. Conta Google Developer
- Acesse: https://play.google.com/console
- Pague a taxa de $25 USD (única vez)
- Complete o perfil da conta

### 2. Conta Expo/EAS
- Acesse: https://expo.dev
- Crie uma conta gratuita
- Faça login no terminal: `eas login`

## 🔧 PASSO A PASSO COMPLETO

### PASSO 1: PREPARAR ASSETS
Você precisa criar os seguintes arquivos na pasta `assets/images/`:

#### Ícone Principal (icon.png)
- **Tamanho:** 1024x1024 pixels
- **Formato:** PNG com transparência
- **Design:** Logo do NoteMusic, simples e reconhecível

#### Ícone Adaptativo (adaptive-icon.png)
- **Tamanho:** 1024x1024 pixels
- **Área segura:** 66% central (676x676px)
- **Design:** Funciona bem em formas circulares e quadradas

#### Splash Screen (splash.png)
- **Tamanho:** 1284x2778 pixels
- **Formato:** PNG
- **Design:** Logo centralizado, fundo azul #007AFF

#### Favicon (favicon.png)
- **Tamanho:** 48x48 pixels
- **Formato:** PNG

### PASSO 2: CONFIGURAR EAS BUILD

```bash
# 1. Fazer login no EAS
eas login

# 2. Configurar projeto (se necessário)
eas build:configure

# 3. Gerar build de produção para Android
eas build --platform android --profile production
```

### PASSO 3: CONFIGURAR GOOGLE PLAY CONSOLE

#### 3.1 Criar Aplicativo
1. Acesse: https://play.google.com/console
2. Clique em "Criar aplicativo"
3. Preencha:
   - **Nome:** NoteMusic
   - **Idioma padrão:** Português (Brasil)
   - **Tipo:** Aplicativo
   - **Categoria:** Educação

#### 3.2 Configurar Detalhes do Aplicativo
- **Nome:** NoteMusic
- **Descrição curta:** Aprenda música de forma interativa e divertida
- **Descrição completa:** 
```
NoteMusic é um aplicativo educacional que ensina teoria musical de forma interativa e gamificada. 

Características:
🎵 Aprenda teoria musical básica
📚 Módulos organizados por níveis (Aprendiz, Virtuoso, Maestro)
🎮 Sistema de gamificação com pontos e conquistas
📊 Acompanhe seu progresso
🏆 Desafios diários
📱 Interface intuitiva e moderna

Perfeito para estudantes de música, músicos iniciantes e qualquer pessoa interessada em aprender teoria musical de forma divertida e eficaz.
```

#### 3.3 Configurar Categoria e Tags
- **Categoria:** Educação
- **Tags:** música, educação, teoria musical, gamificação, aprendizado

#### 3.4 Configurar Contato
- **Website:** (seu site ou GitHub)
- **Email:** suporte.notemusic@gmail.com
- **Telefone:** (opcional)

### PASSO 4: POLÍTICA DE PRIVACIDADE (OBRIGATÓRIA)

Crie um arquivo `PRIVACY_POLICY.md` com:

```markdown
# Política de Privacidade - NoteMusic

## Informações que Coletamos
- Email para criação de conta
- Progresso de aprendizado
- Pontuações e conquistas

## Como Usamos as Informações
- Personalizar experiência de aprendizado
- Salvar progresso do usuário
- Enviar emails de recuperação de senha

## Compartilhamento
Não compartilhamos informações pessoais com terceiros.

## Segurança
Utilizamos criptografia para proteger dados sensíveis.

## Contato
Email: suporte.notemusic@gmail.com
```

### PASSO 5: GERAR BUILD DE PRODUÇÃO

```bash
# No terminal, na pasta NoteMusic:
eas build --platform android --profile production
```

### PASSO 6: FAZER UPLOAD NA PLAY STORE

#### 6.1 Baixar o AAB
Após o build, baixe o arquivo `.aab` do link fornecido pelo EAS.

#### 6.2 Upload no Play Console
1. Acesse seu app no Play Console
2. Vá para "Produção" > "Criar nova versão"
3. Faça upload do arquivo `.aab`
4. Preencha as notas da versão:
```
Versão 1.0.0 - Lançamento inicial
- Sistema completo de aprendizado musical
- Gamificação com pontos e conquistas
- Módulos por níveis (Aprendiz, Virtuoso, Maestro)
- Desafios diários
- Interface moderna e intuitiva
```

#### 6.3 Configurar Distribuição
- **Países:** Brasil (ou todos)
- **Dispositivos:** Todos os dispositivos Android
- **Versão mínima:** Android 6.0 (API 23)

### PASSO 7: REVISÃO E PUBLICAÇÃO

1. **Revisar:** Verifique todas as informações
2. **Teste interno:** Teste o app antes de publicar
3. **Publicar:** Clique em "Publicar aplicativo"

## ⏱️ TEMPO ESTIMADO

- **Preparação:** 2-4 horas
- **Build:** 10-20 minutos
- **Revisão Google:** 1-3 dias
- **Total:** 2-4 dias

## 💰 CUSTOS

- **Conta Developer:** $25 USD (única vez)
- **EAS Build:** Gratuito (até 30 builds/mês)
- **Total:** $25 USD

## 🔧 COMANDOS ÚTEIS

```bash
# Verificar status do build
eas build:list

# Ver logs do build
eas build:view [BUILD_ID]

# Configurar projeto
eas build:configure

# Build para teste interno
eas build --platform android --profile preview
```

## 📞 SUPORTE

Se precisar de ajuda:
- **EAS:** https://docs.expo.dev/build/introduction/
- **Play Console:** https://support.google.com/googleplay/android-developer
- **Email:** suporte.notemusic@gmail.com

## 🎯 PRÓXIMOS PASSOS

1. ✅ Criar assets (ícones, splash)
2. ✅ Fazer login no EAS
3. ✅ Gerar build de produção
4. ✅ Configurar Play Console
5. ✅ Upload e publicação
6. ✅ Monitorar downloads e reviews



