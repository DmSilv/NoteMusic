# 🔧 GUIA DE RESOLUÇÃO DE PROBLEMAS DE CONECTIVIDADE

## 🚨 **PROBLEMA: App não consegue conectar ao backend no celular físico**

### **✅ SOLUÇÕES IMPLEMENTADAS:**

#### **1. Configuração de IP Atualizada:**
- **IP da sua máquina**: `192.168.1.8`
- **Porta do backend**: `3333`
- **URL da API**: `http://192.168.1.8:3333/api`

#### **2. Arquivos Modificados:**
- `services/api.ts`: IP atualizado para rede local
- `app.json`: Configuração extra adicionada

---

## 🔍 **VERIFICAÇÕES NECESSÁRIAS:**

### **1. Verificar se o Backend está Rodando:**
```bash
# No terminal, navegue para a pasta Back End
cd "Back End"
npm start

# Deve aparecer:
# 🚀 Servidor rodando na porta 3333
# 🌐 Acessível em: http://localhost:3333
```

### **2. Verificar se o Backend está Acessível na Rede:**
```bash
# Teste no navegador:
http://192.168.1.8:3333/api/auth/basic-info

# Deve retornar uma resposta JSON
```

### **3. Verificar Firewall do Windows:**
1. Abra **Windows Defender Firewall**
2. Clique em **Configurações Avançadas**
3. Clique em **Regras de Entrada**
4. Clique em **Nova Regra**
5. Selecione **Porta** → **Próximo**
6. Selecione **TCP** → **Portas Específicas** → **3333**
7. Selecione **Permitir a Conexão**
8. Aplique para **Domínio, Privado e Público**

### **4. Verificar se Celular e PC estão na Mesma Rede:**
- Ambos devem estar conectados ao mesmo Wi-Fi
- Verificar se não há isolamento de dispositivos no roteador

---

## 🛠️ **COMANDOS DE TESTE:**

### **Testar Conectividade:**
```bash
# No terminal do NoteMusic
node test-connectivity.js
```

### **Verificar IP Atual:**
```bash
# Windows
ipconfig

# Procurar por "Endereço IPv4" da sua conexão Wi-Fi
```

### **Testar Backend:**
```bash
# No terminal do Back End
npm start

# Em outro terminal, testar:
curl http://192.168.1.8:3333/api/auth/basic-info
```

---

## 🔄 **ALTERNATIVAS SE NÃO FUNCIONAR:**

### **Opção 1: Usar ngrok (Túnel Público)**
```bash
# Instalar ngrok
npm install -g ngrok

# Criar túnel para porta 3333
ngrok http 3333

# Usar a URL fornecida pelo ngrok no app
```

### **Opção 2: Usar Expo Dev Tunnels**
```bash
# No terminal do NoteMusic
npx expo start --tunnel

# Isso criará um túnel público para o app
```

### **Opção 3: Configurar IP Estático**
1. Configurar IP estático no roteador
2. Atualizar configuração no app
3. Reiniciar ambos os dispositivos

---

## 📱 **TESTE NO CELULAR:**

### **1. Limpar Cache do Expo:**
```bash
npx expo start --clear
```

### **2. Verificar Logs:**
- Abrir app no celular
- Verificar logs no terminal
- Procurar por erros de conexão

### **3. Testar Diferentes IPs:**
Se `192.168.1.8` não funcionar, tentar:
- `192.168.0.8`
- `192.168.1.1`
- `10.0.0.8`

---

## ✅ **VERIFICAÇÃO FINAL:**

### **Sinais de Sucesso:**
- ✅ Backend rodando na porta 3333
- ✅ Firewall permitindo conexões
- ✅ Celular e PC na mesma rede
- ✅ App consegue fazer login
- ✅ Dados carregam corretamente

### **Se Ainda Não Funcionar:**
1. Verificar logs detalhados
2. Testar com emulador primeiro
3. Usar ngrok como alternativa
4. Verificar configurações do roteador

---

## 🆘 **SUPORTE:**

Se o problema persistir, verificar:
1. **Logs do backend** para erros
2. **Logs do app** para falhas de conexão
3. **Configurações de rede** do roteador
4. **Antivírus** que pode estar bloqueando

**Lembre-se**: O emulador funciona porque usa `localhost`, mas o celular físico precisa do IP da rede local!




