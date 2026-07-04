# Checklist — Publicação Play Console (NoteMusic)

Use este checklist antes de cada build para **teste fechado** ou **produção**.

## Versão e build

- [ ] `app.json`: `expo.version` incrementada (ex.: `1.0.1`)
- [ ] `app.json`: `expo.android.versionCode` incrementado (sempre maior que o anterior na Play Console)
- [ ] `android/app/build.gradle`: `versionCode` e `versionName` alinhados com `app.json`
- [ ] Changelog preparado para testadores (o que mudou nesta versão)

## Testes automatizados

- [ ] Backend: `cd NoteMusic-BackEnd && npm test` (33 testes)
- [ ] App: `cd NoteMusic && npm test` (24 testes)
- [ ] Opcional: `npm run test:coverage` em ambos os projetos

## Backend (Railway / produção)

- [ ] `JWT_SECRET` forte (32+ caracteres), único por ambiente
- [ ] `MONGODB_URI` de produção configurado
- [ ] `SENDGRID_API_KEY` + `EMAIL_USER` (remetente verificado no SendGrid)
- [ ] `RESET_PASSWORD_EXPIRES_MIN` definido (padrão: 15)
- [ ] `NODE_ENV=production` e `TRUST_PROXY=1` se aplicável
- [ ] Health check OK: `GET /api/health`
- [ ] Deploy do backend **antes** de publicar o app que depende de novas rotas

## Segurança e privacidade

- [ ] Nenhuma credencial (SMTP, JWT, API keys) no código ou no repositório
- [ ] `.env` no `.gitignore` (backend)
- [ ] Política de privacidade publicada em URL acessível (obrigatório: conta, e-mail, autenticação)
- [ ] URL da política de privacidade preenchida na Play Console → Política do app
- [ ] Declaração de coleta de dados alinhada ao que o app realmente coleta (e-mail, progresso, etc.)

## App — autenticação e UX

- [ ] Login, cadastro e recuperação de senha testados em dispositivo real
- [ ] Fluxo de reset: solicitar código → receber e-mail → redefinir senha → login
- [ ] Mensagem genérica ao solicitar reset (não revela se e-mail existe)
- [ ] Botões com estado de loading e bloqueio contra múltiplos cliques
- [ ] App testado **sem internet** (mensagem amigável, sem crash)
- [ ] Sessão expirada redireciona para login sem loop infinito
- [ ] "Lembrar e-mail" não salva senha no dispositivo

## Android / Play Console

- [ ] `android/keystore.properties` e keystore de release configurados (não commitados)
- [ ] Build gerado: `eas build --platform android --profile production`
- [ ] APK/AAB assinado com a **mesma chave** da versão anterior na Play Console
- [ ] Permissões revisadas — apenas as necessárias (sem permissões extras)
- [ ] Ícone, splash e screenshots atualizados se houve mudança visual
- [ ] Classificação de conteúdo (questionário) atualizada se necessário
- [ ] Faixa de teste fechado: lista de e-mails de testadores adicionada

## Teste final (smoke test)

- [ ] Instalar build de release em dispositivo limpo
- [ ] Cadastrar novo usuário
- [ ] Fazer login e logout
- [ ] Completar um módulo ou quiz (fluxo principal)
- [ ] Solicitar reset de senha e concluir com código do e-mail
- [ ] Verificar que logs de produção não expõem tokens ou senhas

## Pós-publicação

- [ ] Monitorar crashes na Play Console (primeiras 24–48 h)
- [ ] Verificar logs do Railway por erros de e-mail ou autenticação
- [ ] Responder feedback dos testadores do teste fechado

---

| Versão alvo desta auditoria:** `2.0.0` (versionCode `4`)
