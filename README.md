# NoteMusic

App mobile de educação musical (TCC) — frontend Expo/React Native.

## Desenvolvimento local

```powershell
cd NoteMusic
npm install
npx expo start --clear
```

O app em modo dev conecta ao backend local em `http://localhost:3333/api` (Android emulador: `10.0.2.2:3333`).

```powershell
# Rodar no emulador/dispositivo Android
npx expo run:android
```

## Estrutura do projeto

```
app/          → bootstrap (App.tsx) + navegação (RootNavigator)
features/     → telas por domínio (auth, quiz, profile…)
shared/       → componentes, hooks, constants, utils
contexts/     → AuthContext
services/     → API e lógica de negócio
```

Imports usam alias `@/` (ex.: `@/services/api`, `@/shared/constants/theme`).

Documentação detalhada: [`docs/GUIA_LIMPEZA_ARQUITETURA.md`](docs/GUIA_LIMPEZA_ARQUITETURA.md)

## Build Android

O projeto usa fluxo **Bare** (pasta `android/` commitada). Builds locais e via EAS.

### Assinatura (release)

1. Copie o template: `android/keystore.properties.example` → `android/keystore.properties`
2. Preencha senhas e caminho do keystore (arquivo **não** vai para o git)
3. Keystore de release: `android/app/notemusic-release-key.keystore` (gitignored)

### Comandos

```powershell
# APK para testar no celular (EAS)
eas build --platform android --profile apk

# AAB para Play Store (EAS)
eas build --platform android --profile production
```

### Versão (antes de cada release)

Atualizar nos dois lugares:

| Arquivo | Campos |
|---------|--------|
| `app.json` | `expo.version`, `expo.android.versionCode` |
| `android/app/build.gradle` | `versionCode`, `versionName` |

### Atualizar pacotes (seguro — só patches do SDK 54)

```powershell
npx expo install --fix
npx expo-doctor
```

Não usar `npm update` geral — pode quebrar compatibilidade com o Expo SDK.

## Repositório

https://github.com/DmSilv/NoteMusic
