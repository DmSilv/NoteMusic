# 📧 **CONFIGURAÇÃO DO EMAIL GMAIL - NoteMusic**

## 🔐 **Configuração da Conta Gmail**

### **1. Ativar Autenticação de 2 Fatores**
1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Vá em **Segurança**
3. Ative **Verificação em duas etapas**

### **2. Gerar Senha de App**
1. Na mesma página de Segurança
2. Clique em **Senhas de app**
3. Selecione **Email** como aplicativo
4. Clique em **Gerar**
5. **Copie a senha gerada** (16 caracteres)

### **3. Configurar Variáveis de Ambiente**

**❌ PROBLEMA IDENTIFICADO**

O sistema está tentando usar a senha normal da conta, mas o Gmail requer uma **senha de app** específica.

**🔧 SOLUÇÃO IMEDIATA:**

1. **Acesse:** [myaccount.google.com](https://myaccount.google.com)
2. **Vá em:** Segurança → Verificação em duas etapas
3. **Clique em:** Senhas de app
4. **Selecione:** Email
5. **Clique:** Gerar
6. **Copie a senha de 16 caracteres** gerada

**📧 CONFIGURAÇÃO NECESSÁRIA:**

Substitua `daniel250900` pela senha de app gerada no arquivo:
`Back End/src/services/emailService.js` linha 22

## 🚀 **Testando o Serviço de Email**

### **1. Verificar Conexão**
```bash
cd "Back End"
npm run dev
```

### **2. Testar Recuperação de Senha**
1. Acesse a tela "Esqueci minha senha"
2. Digite um email válido
3. Verifique se o email chega

## 🔧 **Solução de Problemas**

### **Erro: "Invalid login"**
- ✅ Verificar se a senha de app está correta
- ✅ Confirmar se 2FA está ativado
- ✅ Verificar se não há espaços extras

### **Erro: "Connection timeout"**
- ✅ Verificar conexão com internet
- ✅ Confirmar se porta 587 não está bloqueada
- ✅ Verificar firewall

### **Erro: "Authentication failed"**
- ✅ Regerar senha de app
- ✅ Verificar se a conta não foi bloqueada
- ✅ Aguardar alguns minutos e tentar novamente

## 📱 **Identidade Visual do App**

O email usa as cores oficiais do NoteMusic:
- **Azul Principal:** #007AFF
- **Azul Secundário:** #0A8CD6
- **Gradiente:** Linear de azul principal para secundário

## 📋 **Template do Email**

O email inclui:
- ✅ Logo e identidade visual do NoteMusic
- ✅ Senha temporária destacada
- ✅ Instruções claras de uso
- ✅ Dicas de segurança
- ✅ Design responsivo

## 🔒 **Segurança**

- ✅ Senhas temporárias expiram em 24h
- ✅ Uso de TLS para criptografia
- ✅ Autenticação obrigatória
- ✅ Rate limiting implementado

---

**Status: Configurado para Gmail SMTP** ✅

*Use a conta notemusic.oficial@gmail.com com a senha de app gerada para envio automático de emails.*
