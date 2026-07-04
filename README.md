# NoteMusic

App mobile de educação musical — frontend Expo/React Native.

## Tecnologias

| Camada | Stack |
|--------|--------|
| Mobile | Expo SDK 54, React Native, TypeScript, React Navigation |
| Backend | Node.js, Express, MongoDB/Mongoose, JWT |
| E-mail | SendGrid (produção) ou SMTP Gmail (desenvolvimento) |
| Build | EAS Build, Android Bare |

## Fluxo de autenticação

1. **Cadastro** (`POST /api/auth/register`) — cria conta, retorna JWT (7 dias por padrão).
2. **Login** (`POST /api/auth/login`) — valida credenciais; mensagem genérica em falha (anti-enumeração).
3. **Sessão** — JWT salvo em `AsyncStorage` (`@NoteMusic:token`); enviado como `Bearer` nas rotas protegidas.
4. **Logout** — remove token local e chama `POST /api/auth/logout`.
5. **Sessão expirada** — respostas `401` com código `SESSION_EXPIRED` limpam o token local.
6. **Lembrar e-mail** — apenas o e-mail é persistido; **senha nunca é salva no dispositivo**.

## Fluxo de redefinição de senha

1. Usuário informa o e-mail em **Esqueci minha senha**.
2. API responde sempre com mensagem genérica (não revela se o e-mail existe).
3. Se o e-mail estiver cadastrado, o backend gera um **código de 6 dígitos** (válido por 15 min) e envia por e-mail.
4. Usuário insere e-mail + código + nova senha na tela **Redefinir senha** (`POST /api/auth/resetpassword`).
5. Código é invalidado após uso; novas solicitações substituem códigos anteriores.
6. Rate limit: 5 solicitações/hora por IP em `forgotpassword` e `resetpassword`.

> Fluxo legado de senha temporária (`changetemppassword`) permanece para compatibilidade com contas antigas.

## Segurança aplicada

- Senhas com bcrypt no backend; JWT com expiração configurável.
- Credenciais de e-mail **somente no backend** (`.env`, nunca no app).
- Anti-enumeração em recuperação de senha.
- Rate limiting em login, registro e reset.
- Token de reset armazenado como hash SHA-256 (não em texto puro).
- Logs sensíveis reduzidos em builds de produção (`__DEV__`).
- Helmet, CORS e compressão no Express.

## Variáveis de ambiente (backend)

Copie `NoteMusic-BackEnd/env.example` para `.env` e configure:

```bash
MONGODB_URI=
JWT_SECRET=          # mín. 32 caracteres
JWT_EXPIRES_IN=7d
SENDGRID_API_KEY=    # produção
EMAIL_USER=          # remetente verificado (SendGrid/Gmail)
EMAIL_PASS=          # apenas dev local com Gmail
RESET_PASSWORD_EXPIRES_MIN=15
APP_NAME=NoteMusic
ADMIN_SECRET=
```

O arquivo `.env` está no `.gitignore` — **nunca commite segredos**.

## Desenvolvimento local

```powershell
# Backend
cd NoteMusic-BackEnd
npm install
cp env.example .env   # editar variáveis
npm run dev

# App
cd NoteMusic
npm install
npx expo start --clear
```

Em dev, o app aponta para `http://localhost:3333/api` (Android emulador: `10.0.2.2:3333`).

## Build para teste fechado (Play Console)

1. Atualize versão em `app.json` e `android/app/build.gradle` (`version` + `versionCode`).
2. Configure assinatura: `android/keystore.properties` (ver README seção Build).
3. Gere o bundle:

```powershell
cd NoteMusic
eas build --platform android --profile production
```

4. Envie o `.aab` na Play Console → **Teste fechado**.
5. Use o checklist: [`docs/PLAY_STORE_CHECKLIST.md`](docs/PLAY_STORE_CHECKLIST.md)

## Estrutura do projeto

```
app/          → bootstrap (App.tsx) + navegação (RootNavigator)
features/     → telas por domínio (auth, quiz, profile…)
shared/       → componentes, hooks, constants, utils
contexts/     → AuthContext
services/     → API e lógica de negócio
```

Imports usam alias `@/` (ex.: `@/services/api`, `@/shared/constants/theme`).

## Repositório

https://github.com/DmSilv/NoteMusic

## Testes

### Ferramentas

| Pacote | Uso |
|--------|-----|
| Jest + jest-expo | Runner de testes do app |
| @testing-library/react-native | Testes de telas |
| Mocks | `fetch`, `AsyncStorage`, `Alert`, `apiService`, `useAuth` |

### Estrutura

```
__tests__/
  services/api.auth.test.ts    # login, reset, erros HTTP/rede
  utils/errorHandler.test.ts   # mensagens amigáveis
  screens/
    LoginScreen.test.tsx
    ForgotPasswordScreen.test.tsx
jest.setup.ts                  # mocks globais
```

### Comandos

```powershell
cd NoteMusic
npm test                 # todos os testes (uma vez)
npm run test:watch       # modo contínuo
npm run test:coverage    # relatório de cobertura
```

### Variáveis de ambiente

Nenhuma variável real é necessária. Testes usam mocks — sem internet, SMTP ou backend real.

### Fluxos cobertos

- `ApiService`: login, forgotPassword, resetPassword, 401/sessão, NETWORK_ERROR, timeout
- `processError`: rede, sessão, reset token, rate limit
- Telas: login (erro, rede, loading, navegação), recuperação de senha (validação, sucesso genérico, loading)

### Próximos testes recomendados

- `ResetPasswordScreen` (código + confirmação de senha)
- `AuthContext` (lembrar e-mail sem salvar senha)
- Testes E2E com Detox antes da produção definitiva
