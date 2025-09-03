# 🔐 **CONFIGURAÇÃO DA SENHA DE APP - Gmail NoteMusic**

## 🚨 **PROBLEMA ATUAL**
O sistema está usando a senha normal da conta (`daniel250900`), mas o Gmail bloqueia isso por segurança.

## ✅ **SOLUÇÃO PASSO A PASSO**

### **1. Gerar Senha de App no Gmail**
1. Acesse: [myaccount.google.com](https://myaccount.google.com)
2. Faça login com: `notemusic.oficial@gmail.com`
3. Vá em: **Segurança**
4. Ative: **Verificação em duas etapas** (se não estiver ativa)
5. Clique em: **Senhas de app**
6. Selecione: **Email**
7. Clique: **Gerar**
8. **COPIE a senha de 16 caracteres** (exemplo: `abcd efgh ijkl mnop`)

### **2. Atualizar o Código**
Edite o arquivo: `Back End/src/services/emailService.js`

**Localizar linha 22:**
```javascript
pass: 'daniel250900'
```

**Substituir por:**
```javascript
pass: 'SUA_SENHA_DE_APP_AQUI'
```

### **3. Exemplo de Configuração Correta**
```javascript
auth: {
  user: 'notemusic.oficial@gmail.com',
  pass: 'abcd efgh ijkl mnop'  // ← Sua senha de app real
}
```

## 🔧 **Testar Configuração**
1. Salve o arquivo
2. Reinicie o backend: `npm run dev`
3. Teste recuperação de senha no app
4. Verifique se o email chega

## 📱 **Identidade Visual Mantida**
- ✅ Cores oficiais do NoteMusic
- ✅ Template HTML responsivo
- ✅ Logo e branding corretos
- ✅ Instruções claras para o usuário

---

**⚠️ IMPORTANTE:** Nunca compartilhe ou comite a senha de app no código!
**✅ SOLUÇÃO:** Use variáveis de ambiente em produção.

*Status: Aguardando configuração da senha de app* ⏳
