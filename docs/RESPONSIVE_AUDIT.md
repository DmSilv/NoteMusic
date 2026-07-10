# Auditoria de Responsividade — NoteMusic

Data: julho/2026

## Objetivo

Garantir que telas principais funcionem bem em aparelhos Android com telas pequenas (ex.: Motorola 360×640), médias (390×844) e grandes (430×932), sem correções manuais por dispositivo.

---

## Telas analisadas

| Tela | Problemas encontrados | Status |
|------|----------------------|--------|
| **SelectionScreen** (Bem-vindo) | Botões lado a lado com `width: 40%` aplicado ao **Text** (não ao botão); sem scroll de segurança em telas muito pequenas | ✅ Corrigido — **layout visual original preservado**, apenas com `ScreenScrollContainer` como rede de segurança (ver nota abaixo) |
| **LoginScreen** | Larguras hardcoded `0.85`; ilustração grande em telas compactas | ✅ Corrigido |
| **RegisterUser** | Já tinha lógica compacta parcial | ⚠️ Parcial (usa padrões similares) |
| **SelectLevelPerson** | Sem ScrollView; conteúdo centralizado podia cortar opções/botão | ✅ Corrigido |
| **ProfileHome** (Lobby) | Cards de stats sem `minWidth:0`; padding fixo; saudação podia estourar | ✅ Corrigido |
| **ProfileAccount** | Imagem com `height: 270` fixo | ✅ Corrigido |
| **SecondaryButton / TertiaryButton** | `styleWidth` aplicado ao Text em vez do TouchableOpacity; height fixo 53px | ✅ Corrigido |
| **PrimaryButton** | `Dimensions.get` estático no Style; margens grandes em telas baixas | ✅ Corrigido |
| ModuleCategory, Quiz, QuizIntro | Usam `Dimensions.get` estático | 📋 Backlog (não crítico nesta rodada) |

---

## Problemas encontrados (resumo)

1. **Botões cortados** — `SecondaryButton`/`TertiaryButton` recebiam largura no texto, não no container clicável.
2. **Sem scroll** — `SelectLevelPerson` e `SelectionScreen` não scrollavam quando o conteúdo excedia a viewport.
3. **Heights fixos** — Imagem de perfil (`270px`), botões (`53px`).
4. **Dimensions estático** — `Dimensions.get('window')` no load do módulo não reage a rotação/redimensionamento.
5. **Flex sem shrink** — Cards de estatísticas e textos de saudação sem `minWidth: 0` / `flexShrink`.
6. **Padding inconsistente** — Valores mágicos (`24`, `0.85`, `0.4`) espalhados.

---

## Mudanças aplicadas

### Base reutilizável

| Arquivo | Função |
|---------|--------|
| `shared/constants/responsive.ts` | Breakpoints, spacing, fontSize, presets de teste, helpers |
| `shared/hooks/useResponsiveLayout.ts` | Hook central (`formFieldWidth`, `stackButtons`, `isCompact`, etc.) |
| `shared/components/layout/ScreenScrollContainer.tsx` | ScrollView + SafeArea + KeyboardAvoidingView opcional |

### Padrões adotados

- **Largura de formulário:** `getFormFieldWidth(width)` → 90% em telas ≤360px, 85% acima, máx. 400px.
- **Botões lado a lado:** empilhar quando `width < 390px` (`shouldStackButtons`).
- **Padding horizontal:** 16px compacto, 24px demais casos.
- **Área de toque mínima:** 44px (`MIN_TOUCH_TARGET`).
- **Cards em row:** sempre `flex: 1`, `minWidth: 0`, `flexShrink: 1`.
- **Preferir** `useResponsiveLayout()` **em vez de** `Dimensions.get('window')`.

### Nota sobre a SelectionScreen (Bem-vindo)

Esta tela passou por múltiplas iterações na auditoria. A decisão final foi **preservar exatamente o layout/estilo visual do último commit** (logo, ilustração, espaçamentos e proporções fixas), pois esse era o padrão aprovado. A única mudança estrutural é envolver o conteúdo em `ScreenScrollContainer`:

- Em telas onde o conteúdo já cabe (a maioria dos aparelhos comuns), o comportamento é **idêntico** ao original — nada rola, nada muda visualmente.
- Em telas muito pequenas ou com fonte do sistema aumentada (acessibilidade), onde o conteúdo fixo poderia ultrapassar a altura disponível, o container permite rolagem em vez de cortar botões/textos.
- Os componentes `SecondaryButton`/`TertiaryButton` mantêm a correção do bug em que a largura era aplicada ao `Text` em vez do botão inteiro (causa real de "botão cortado" em qualquer tamanho de tela).

### Telas corrigidas

- `SelectionScreen` — mesmo layout visual do commit anterior + `ScreenScrollContainer` como rede de segurança (sem alterar espaçamentos/tamanhos).
- `LoginScreen` — `formFieldWidth`, ilustração adaptativa, padding dinâmico.
- `SelectLevelPerson` — `ScreenScrollContainer`, botão com largura fluida.
- `ProfileHome` — stats compactos, saudação com `numberOfLines`/`adjustsFontSizeToFit`.
- `ProfileAccount` — altura de imagem proporcional à tela.
- `PrimaryButton`, `SecondaryButton`, `TertiaryButton` — estilos flexíveis e bug de largura corrigido.

---

## Como rodar os testes

```bash
cd c:\Users\PC\Projects\NoteMusic

# Todos os testes
npm test

# Apenas responsividade
npm test -- --testPathPattern="responsive"

# Com watch
npm run test:watch

# Com cobertura
npm run test:coverage
```

### Presets simulados

| Preset | Dimensões | Uso |
|--------|-----------|-----|
| `small` | 360×640 | Motorola / telas compactas |
| `medium` | 390×844 | iPhone / Android médio |
| `large` | 430×932 | Telas grandes |

---

## Como criar novos testes de responsividade

1. Importe os utilitários:

```typescript
import {
  mockScreenPreset,
  restoreWindowDimensionsMock,
  SCREEN_CASES,
} from '@/__tests__/utils/responsiveTestUtils';
```

2. Mock dependências de navegação/API (como nos exemplos existentes).

3. Use `it.each(SCREEN_CASES)` para validar os três tamanhos:

```typescript
afterEach(() => restoreWindowDimensionsMock());

it.each(SCREEN_CASES)('renderiza botão principal em %s', (_label) => {
  mockScreenPreset('small'); // ou medium / large
  const { getByText } = render(<MinhaTela />);
  expect(getByText('Confirmar')).toBeTruthy();
});
```

4. Valide:
   - Botões principais visíveis (`getByText`)
   - Campos de formulário (`getByPlaceholderText`)
   - Textos críticos da tela
   - Ausência de crash (render completa)

---

## Arquivos de teste

- `__tests__/constants/responsive.test.ts` — helpers e breakpoints
- `__tests__/utils/responsiveTestUtils.ts` — mock de `useWindowDimensions`
- `__tests__/screens/SelectionScreen.responsive.test.tsx`
- `__tests__/screens/LoginScreen.responsive.test.tsx`
- `__tests__/screens/SelectLevelPerson.responsive.test.tsx`
- `__tests__/screens/ProfileHome.responsive.test.tsx`

---

## Próximos passos (backlog)

- [ ] Aplicar `useResponsiveLayout` em `ModuleCategory`, `Quiz`, `QuizIntroScreen`
- [ ] Testes responsivos para `RegisterUser` e `ProfileAccount`
- [ ] Extrair `AuthFormLayout` compartilhado entre Login/Register/ForgotPassword

---

## Validação manual recomendada

1. Abrir app no emulador/dispositivo **360×640** (ou similar).
2. Percorrer: Bem-vindo → Login → Lobby → Perfil → Onboarding nível.
3. Confirmar: botões não cortados, scroll funciona, teclado não esconde campos.
4. Rodar `npm test` antes de commit.
