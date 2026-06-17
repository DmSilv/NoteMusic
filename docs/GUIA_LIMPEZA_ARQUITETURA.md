# Guia de Limpeza e Arquitetura — NoteMusic Frontend

> Documento vivo. Atualizar este arquivo ao concluir cada tarefa ou fase.
>
> **Última atualização:** 17/06/2025  
> **Fase atual:** Limpeza + Build ✅

---

## Visão geral

O NoteMusic é um app **Expo SDK 54 / React Native** com navegação via **React Navigation** (`app/navigation/RootNavigator.tsx`).

**Fluxo principal:**

```
Selection → Login/Register → ProfileHome → Módulos → Quiz → Resultados
```

**Núcleo da aplicação:**
- `app/App.tsx` — providers, fontes
- `app/navigation/RootNavigator.tsx` — 15 rotas
- `contexts/AuthContext.tsx`
- `services/api.ts` + serviços de quiz/módulo
- `features/*/screens/` — telas
- `shared/` — componentes, hooks, theme

---

## Progresso das fases

| Fase | Descrição | Status | Concluída em |
|------|-----------|--------|--------------|
| 1 | Limpeza sem impacto no runtime | ✅ Concluída | 17/06/2025 |
| 2 | Código claramente órfão | ✅ Concluída | 17/06/2025 |
| 3 | Hooks, utils e constants mortos | ✅ Concluída | 17/06/2025 |
| 4 | Consolidação (médio risco) | ✅ Concluída | 17/06/2025 |
| 5 | Dependências não usadas | ✅ Concluída | 17/06/2025 |
| 6 | Reestruturação de pastas | ✅ Concluída | 17/06/2025 |
| 7 | Build Android + dependências | ✅ Concluída | 17/06/2025 |

**Legenda:** ⬜ Pendente · 🔄 Em andamento · ✅ Concluída

---

## Arquitetura final (implementada)

```
NoteMusic/
├── index.js                          → app/App.tsx
├── app/
│   ├── App.tsx                       # providers + fontes
│   └── navigation/
│       ├── RootNavigator.tsx         # Stack com 15 rotas
│       ├── routes.ts                 # nomes das rotas
│       └── types.ts                  # tipos de navegação
│
├── features/
│   ├── auth/screens/
│   ├── onboarding/screens/
│   ├── profile/screens/
│   ├── modules/screens/
│   ├── quiz/screens/
│   └── account/screens/
│
├── shared/
│   ├── components/form|layout|notification/
│   ├── hooks/
│   ├── constants/                    # theme.ts, CategoryNames.ts
│   ├── types/
│   └── utils/
│
├── contexts/                         # AuthContext
├── services/                         # api, quiz, module...
└── assets/
```

**Imports:** alias `@/` configurado no `tsconfig.json` + `experiments.tsconfigPaths` no `app.json`.

---

## Regras de segurança

1. **Uma fase por vez** — não misturar remoção com refactor visual.
2. **Antes de apagar:** buscar imports (`grep` no nome do arquivo).
3. **Após cada fase:** rodar validação (seção abaixo).
4. **Commits pequenos** — um commit por fase facilita reverter.
5. **Não remover** telas registradas em `app/navigation/RootNavigator.tsx` sem atualizar o navigator.

### Validação padrão (repetir após cada fase)

```bash
# TypeScript
npx tsc --noEmit

# App em desenvolvimento
npm run dev
```

**Fluxo manual a testar:**
- [ ] SelectionScreen → Login
- [ ] Login com credenciais válidas → ProfileHome
- [ ] ProfileHome → ModuleCategory → ContentListCategory
- [ ] ContentListCategory → QuizIntro → Quiz → QuizResults
- [ ] ProfileHome → ProfileAccount
- [ ] Logout / Register (se alterou auth)

---

## Fase 1 — Limpeza sem impacto no runtime

**Risco:** zero · **Objetivo:** remover ruído e corrigir configs quebradas.

### Tarefas

- [x] Remover scripts de debug na raiz:
  - `test-connectivity.js`
  - `test-mobile-connection.js`
  - `test-celular-conexao.js`
  - `debug-connectivity.js`
- [x] Mover documentação para `docs/`:
  - `GUIA_CONECTIVIDADE.md`
  - `GUIA_PLAY_STORE_COMPLETO.md`
  - `RELATORIO_VALIDACAO_FINAL.md`
  - `RELATORIO_VALIDACAO_SISTEMA.md`
  - `ASSETS_GUIDE.md`
- [x] Remover import morto de `ProtectedRoute` em `app/_layout.tsx`
- [x] Corrigir `tsconfig.json` — remover referência a `Quiz.Jsx` (arquivo não existe; existe `Quiz.tsx`)
- [x] Remover script `reset-project` no `package.json` (pasta `scripts/` inexistente)

### Notas / decisões

- `npx tsc --noEmit` ainda falha com erros **pré-existentes** no projeto (tipos legados, arquivos mortos da Fase 2). Nenhum erro novo foi introduzido pela Fase 1.
- `ProtectedRoute` permanece no disco — será removido na Fase 2.

---

## Fase 2 — Código claramente órfão

**Risco:** baixo · **Objetivo:** remover arquivos sem rota e sem imports.

### Variantes de tela nunca exportadas

- [x] `app/(tabs)/AccountDeletion/AccountDeletion.tsx`
- [x] `app/(tabs)/AccountDeletion/AccountDeletionSimple.tsx`
- [x] `app/(tabs)/AccountDeletion/AccountDeletionProfessional.tsx`
- [x] `app/(tabs)/DeactivatedAccount/DeactivatedAccount.tsx` (manter `DeactivatedAccountStandard`)

### Telas sem rota no Stack

- [x] `app/(tabs)/ProfileHome/Achievements.tsx`
- [x] `app/(tabs)/ProfileHome/Leaderboard.tsx`

### Componentes órfãos

- [x] `app/(tabs)/ProfileHome/ModuleCard.tsx`
- [x] `app/(tabs)/ProfileHome/ChallengeCard.tsx`
- [x] `app/Components/QuizDescription/QuizDescription.tsx`
- [x] `app/Components/QuizValidation/QuizValidation.tsx`
- [x] `app/Components/ProtectedRoute/ProtectedRoute.tsx`
- [x] `app/Components/ProtectedComponent/ProtectedComponent.tsx`
- [x] `app/Components/ErrorBoundary/ErrorBoundary.tsx`
- [x] `app/Components/Loading/LoadingComponent.tsx`
- [x] `app/Components/StatusBar/` (pasta inteira)
- [x] `app/(tabs)/Components/SafeAreaWrapper/SafeAreaWrapper.js`
- [x] `app/(tabs)/Components/Form/Picker/Picker.jsx` + Style
- [x] `app/(tabs)/Components/Form/Validation/Validation.tsx`
- [x] `app/(tabs)/Components/Form/Button/UnifiedButton/UnifiedButton.tsx`

### Serviços duplicados / não referenciados

- [x] `app/services/quizService.ts` (manter `services/quizService.ts` na raiz)
- [x] `services/unlockDailyChallenge.ts`
- [x] `services/achievementService.ts` (confirmado: nunca importado; API cobre via `apiService`)

### Notas / decisões

- **24 arquivos removidos** no total.
- `AccountDeletion` e `DeactivatedAccount` continuam funcionando via `index.tsx` → versão `Standard`.
- Erros TypeScript reduziram de ~150+ para **92** (restantes são tipos legados no código ativo).

## Fase 3 — Hooks, utils e constants mortos

**Risco:** baixo · **Objetivo:** remover abstrações nunca usadas.

### Contextos duplicados

- [x] `app/contexts/UserDataContext.tsx` (manter `hooks/useUserData.ts`)

### Hooks órfãos

- [x] `hooks/useIntelligentRefresh.ts`
- [x] `hooks/useNotification.ts` (wrapper morto; `useNotification` do `NotificationProvider` permanece)
- [x] `hooks/useThemeColor.ts`
- [x] `hooks/useColorScheme.ts`
- [x] `hooks/useColorScheme.web.ts`

### Utils órfãos

- [x] `utils/intelligentCache.ts`
- [x] `utils/statusBarConfig.ts`
- [x] `app/utils/responsive.ts`

### Constants órfãos

- [x] `constants/DesignSystem.ts`
- [x] `constants/StatusBarColors.ts`
- [x] `constants/Colors.ts` (só referenciado por `useThemeColor`)

### Notas / decisões

- **12 arquivos removidos** no total.
- Hooks mantidos (em uso): `useUserData`, `useStatusBar`, `useFormValidation`, `useAsyncOperation`, `useErrorHandler`.
- Constants mantidos (em uso): `AppStyles.ts`, `LevelColors.ts`, `CategoryNames.ts`.
- Erros TypeScript: **91** (era 92 na Fase 2).

## Fase 4 — Consolidação (médio risco)

**Risco:** médio · **Objetivo:** unificar duplicatas sem mudar comportamento.

### Botões

- [x] Unificar `app/(tabs)/Components/Button/PrimaryButton.tsx` e `app/(tabs)/Components/Form/Button/PrimaryButton/`
- [x] Atualizar imports em todas as telas afetadas (`SelectLevelPerson`)
- [x] Remover variante duplicada após migração

### Design tokens

- [x] Consolidar `constants/AppStyles.ts` + `constants/LevelColors.ts` → `constants/theme.ts`
- [x] Remover arquivos antigos após migração
- [ ] Revisar visualmente Login, ProfileHome e Quiz (manual)

### Migração JSX → TSX

- [x] `Title.jsx` → `Title.tsx` (com suporte a props legadas PascalCase + `subtitle`)
- [x] `SubTitle.jsx` → `SubTitle.tsx` (com suporte a props legadas PascalCase)

### Tipos de navegação

- [x] Substituir tipos de `@react-navigation/stack` por `@react-navigation/native-stack` (6 arquivos)

### Correções pendentes

- [x] Remover import morto `./types` em `RegisterUser.tsx` (tipo nunca usado)

### Notas / decisões

- `PrimaryButton` unificado suporta: `loading`, `styleWidth`, `style`, `iconName`.
- `Title`/`SubTitle` aceitam props em camelCase e PascalCase para não quebrar telas legadas.
- Erros TypeScript: **88** (era 91 na Fase 3).

## Fase 5 — Dependências não usadas

**Risco:** médio-alto · **Objetivo:** reduzir `package.json`. Remover **uma dependência por vez** e validar build.

### Candidatas à remoção

| Pacote | Motivo |
|--------|--------|
| `react-native-paper` | Zero imports |
| `react-native-elements` | Zero imports |
| `expo-linking` | Zero imports |
| `expo-web-browser` | Zero imports |
| `expo-navigation-bar` | Zero imports |
| `@react-native-picker/picker` | Só em Picker morto (Fase 2) |
| `@react-navigation/stack` | Só tipos; navigator é native-stack |

### Avaliar com cuidado

| Pacote | Motivo para manter |
|--------|-------------------|
| `react-native-reanimated` | Plugin Babel; verificar se navigation depende |
| `react-native-worklets` | Peer de reanimated |
| `expo-constants`, `expo-splash-screen` | Podem ser usados indiretamente pelo Expo |

### Checklist por pacote removido

| Pacote | Removido | Build OK | App OK |
|--------|----------|----------|--------|
| `react-native-paper` | ✅ | ✅ `npm install` | ⬜ manual |
| `react-native-elements` | ✅ | ✅ | ⬜ manual |
| `expo-linking` | ✅ | ✅ | ⬜ manual |
| `expo-web-browser` | ✅ | ✅ | ⬜ manual |
| `expo-navigation-bar` | ✅ | ✅ | ⬜ manual |
| `@react-native-picker/picker` | ✅ | ✅ | ⬜ manual |
| `@react-navigation/stack` | ✅ | ✅ | ⬜ manual |
| `react-native-reanimated` | ✅ | ✅ | ⬜ manual |
| `react-native-worklets` | ✅ | ✅ | ⬜ manual |

### Notas / decisões

- **26 pacotes** removidos do `node_modules` via `npm install`.
- Plugin `react-native-reanimated/plugin` removido do `babel.config.js` (zero uso no código).
- **Mantidos:** `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens` (navegação); `expo-constants`, `expo-splash-screen` (Expo).
- `tsc`: **88 erros** (inalterado — erros legados no código ativo).

## Fase 6 — Reestruturação de pastas

**Risco:** alto · **Objetivo:** arquitetura final. Só iniciar com Fases 1–5 estáveis.

### Passos

- [x] Criar estrutura `features/`, `shared/`, `contexts/`, `app/navigation/` (sem wrapper `src/` — pastas na raiz)
- [x] Renomear `app/(tabs)/` → `features/*/screens/`
- [x] Unificar componentes → `shared/components/`
- [x] Mover `hooks/`, `constants/`, `utils/`, `types/` → `shared/`
- [x] Atualizar `tsconfig.json` paths (`@/*`) + `experiments.tsconfigPaths` no `app.json`
- [x] Atualizar todos os imports para `@/`
- [x] `_layout.tsx` → `app/App.tsx` + `app/navigation/RootNavigator.tsx`
- [x] `contexts/` movido para raiz
- [x] Remover pastas legado (`app/(tabs)`, `app/Components` vazias)

### Notas / decisões

- Entry point: `index.js` → `app/App.tsx`.
- Rotas centralizadas em `app/navigation/routes.ts` (constantes `ROUTES`).
- Nomes de rota mantidos (`RemenberPassword` com typo — evita quebrar `navigate`).
- `tsc`: **88 erros** (legados, sem erros de módulo `@/`).
- **Reiniciar Metro com cache limpo:** `npx expo start --clear`

---

## Fase 7 — Build Android e dependências

**Risco:** médio · **Objetivo:** organizar config de build e alinhar pacotes do SDK 54.

### Segurança da assinatura

- [x] Senhas removidas do `android/app/build.gradle`
- [x] Credenciais em `android/keystore.properties` (gitignored)
- [x] Template `android/keystore.properties.example` no repositório
- [x] Keystore de release removido do índice git
- [x] `.gitignore` atualizado (`keystore`, `google-play-service-account.json`)
- [x] `create-keystore.bat` sem senhas em texto

> **Atenção:** se o keystore já foi commitado no passado, considere gerar um novo antes da próxima publicação na Play Store.

### Configuração

- [x] `app.json` — removidos `statusBar` inválidos; adicionado `android.versionCode`
- [x] `eas.json` — limpeza de perfis (`development`, `preview`, `production`, `apk`)
- [x] Removida dependência direta `metro` do `package.json`
- [x] Plugin `expo-font` adicionado ao `app.json`

### Pacotes (patches SDK 54)

- [x] `npx expo install --fix` — expo 54.0.35, expo-constants, expo-font, expo-splash-screen, expo-status-bar, jest-expo
- [x] `expo-doctor` — 17/18 checks (aviso Bare workflow é esperado)

### Comandos de build

```bash
# Dev local
npx expo start --clear
npx expo run:android

# EAS — APK teste
eas build --platform android --profile apk

# EAS — AAB Play Store
eas build --platform android --profile production
```

### Versão antes de cada release

| Arquivo | Campos |
|---------|--------|
| `app.json` | `expo.version`, `expo.android.versionCode` |
| `android/app/build.gradle` | `versionCode`, `versionName` |

### Workflow Bare (importante)

Com a pasta `android/` presente, mudanças em `icon`, `splash` e `plugins` no `app.json` **não sincronizam automaticamente** no build nativo. Editar arquivos em `android/` ou rodar `npx expo prebuild` quando necessário.

### Atualizar deps com segurança

```bash
# Seguro — só patches do SDK instalado
npx expo install --fix
npx expo-doctor

# Evitar por enquanto
npm update          # pode quebrar compatibilidade
# Subir para SDK 55+ sem plano
```

### Notas / decisões

- `expo-doctor` restante: aviso de projeto Bare vs Prebuild — comportamento esperado.
- `keystore.properties` deve existir localmente para builds release via Gradle.

---

Referência rápida (definidas em `app/navigation/RootNavigator.tsx`):

1. SelectionScreen
2. LoginScreen
3. RegisterUser
4. RemenberPassword
5. SelectLevelPerson
6. ProfileHome
7. ProfileAccount
8. ModuleCategory
9. ContentListCategory
10. QuizIntroScreen
11. Quiz
12. QuizResults
13. ChangePassword
14. LevelStats
15. AccountDeletion / DeactivatedAccount

---

## Log de alterações

Registrar aqui o que foi feito em cada sessão de trabalho.

| Data | Fase | O que foi feito | Validado |
|------|------|-----------------|----------|
| 17/06/2025 | — | Guia criado | — |
| 17/06/2025 | 1 | Removidos 4 scripts de debug; docs movidos para `docs/`; import `ProtectedRoute` removido de `_layout.tsx`; `tsconfig.json` corrigido; script `reset-project` removido do `package.json` | `tsc` com erros pré-existentes; app `npm run dev` inalterado |
| 17/06/2025 | 2 | Removidos 24 arquivos órfãos (variantes de tela, componentes mortos, serviços duplicados) | `tsc`: 92 erros restantes (só código ativo); nenhum import quebrado |
| 17/06/2025 | 3 | Removidos 12 arquivos (contexto duplicado, hooks/utils/constants mortos) | `tsc`: 91 erros; nenhum import quebrado |
| 17/06/2025 | 4 | Unificado PrimaryButton; criado `constants/theme.ts`; Title/SubTitle migrados para TSX; tipos native-stack; RegisterUser corrigido | `tsc`: 88 erros |
| 17/06/2025 | 5 | Removidas 9 deps não usadas + plugin reanimated; `npm install` OK (-26 pacotes) | `tsc`: 88 erros; reiniciar `npm start` recomendado |
| 17/06/2025 | 6 | Reestruturação completa: `features/`, `shared/`, `app/navigation/`, imports `@/`, `App.tsx` | `tsc`: 88 erros; `expo start --clear` recomendado |
| 17/06/2025 | 7 | Build: keystore seguro, app.json/eas.json limpos, `expo install --fix`, expo-doctor 17/18 | Pacotes SDK 54 alinhados |

---

## Problemas conhecidos

### Corrigidos

- [x] `RegisterUser.tsx` importa `./types` — removido na Fase 4
- [x] `app/services/quizService.ts` duplicado — removido na Fase 2
- [x] `ProtectedRoute` / expo-router — removido na Fase 2
- [x] `tsconfig.json` referencia `Quiz.Jsx` — Fase 1
- [x] Script `reset-project` inexistente — Fase 1
- [x] Keystore e senhas no git — Fase 7
- [x] `statusBar` inválido no `app.json` — Fase 7
- [x] Pacotes Expo desalinhados (patches SDK 54) — Fase 7

### Pendentes (opcional / futuro)

- [ ] Typo na rota: `RemenberPassword` (corrigir rota + pasta + todos os `navigate`)
- [ ] **88 erros TypeScript** legados (`tsc --noEmit`)
- [ ] Teste manual do fluxo completo pós-reestruturação
- [ ] Rotacionar keystore se o repo foi público com credenciais antigas
- [ ] `npm audit` — vulnerabilidades em devDependencies (não urgente para TCC)
