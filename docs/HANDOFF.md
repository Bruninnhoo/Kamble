# Handoff

Atualizado em 26/11/2026, ao fim da Etapa 2. Ao retomar o projeto, comece por aqui.

## Onde paramos

O app roda localmente com o banco do Docker Compose. Pela API, o fluxo foi confirmado: cadastro, login, turma, aula e matrícula feita à mão no banco. O lint passa nos dois apps, e o CI agora exige lint. Na sala, a parte do servidor funciona: entrada, chat e repasse da sinalização WebRTC entre professor e aluno. O vídeo e a tela ainda não foram testados no navegador.

## Antes da Etapa 3

1. Teste a sala no navegador, conforme o passo a passo abaixo. Se falhar, a correção entra na branch `fix/local-run`, antes do PR.
2. Abra o PR de `fix/local-run` para a `main` e faça o merge depois do CI verde.

### Teste da sala

Já existem no banco local um professor (`prof@kamble.test`), um aluno (`aluno@kamble.test`), ambos com a senha `senha1234`, e a "Turma Teste", com uma aula agendada e o aluno matriculado.

1. Rode `docker compose up -d --wait` e depois `pnpm dev`.
2. Numa janela normal, entre como professor, abra Turma Teste → Aulas e entre na aula.
3. Numa janela anônima, entre como aluno e abra a mesma URL `/session/<id>`. Ainda não há botão para o aluno (5.4).
4. Confira se o vídeo e o áudio aparecem nos dois lados e se o chat funciona.

## Próxima tarefa

**3.1: restringir `GET /classes/:id`**, na [Etapa 3](ROTEIRO.md#etapa-3-segurança-e-sessão). Crie a branch a partir da `main` atualizada. Só o professor da turma e os alunos matriculados podem ver a turma; os outros recebem 403. A tarefa leva o seu teste.

## Verificado em 26/11/2026

| Verificação            | Resultado                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| CI na `main`           | Passa, e o job `publish` também                                                               |
| Regras da `main`       | Ruleset ativo: PR obrigatório, CI obrigatório, sem force push e sem exclusão; só merge commit |
| Lint, tipos, testes    | Passam nos dois apps, sem avisos de lint                                                      |
| Testes da API          | Dois testes do `/health`: banco no ar e banco fora                                            |
| Build                  | Passa nos dois apps                                                                           |
| Banco do Compose       | Saudável; todas as migrations aplicadas                                                       |
| API local com curl     | `/health`, cadastro, login, criação de turma e de aula; o aluno matriculado vê a turma        |
| `pnpm install` do zero | Passa no Windows, também com o store do pnpm vazio; depois dele é preciso `prisma generate`   |
| Sala pelo socket       | Dois clientes Node entram na mesma aula, se veem, trocam chat e repassam a oferta WebRTC      |
| Sala no navegador      | Não testada: falta vídeo, áudio e a tela                                                      |
| Teste e2e              | Não executado                                                                                 |

## Ambiente

- O passo a passo está no [README](../README.md#rodar-localmente).
- O Postgres do Compose usa a porta **5432**. Outro container na mesma porta precisa estar parado. O PostgreSQL 18 instalado na máquina escuta na 5434 e não é usado.
- Node local: 24.16. pnpm: 9.15.4.
- A falha `readStream must be readable` do `pnpm install`, vista em 24/11, não se repetiu em 25/11 (tarefa 2.10). Se voltar, anote a versão do Node e do pnpm.
- O `apps/api/.env` tem `JAVA_SERVICE_URL`, que o código não usa.
- Matrícula à mão: `INSERT INTO enrollments (id, "studentId", "classId")`, com o `id` da tabela `students`, e não o de `users`.

## CI/CD

- `ci` roda em todo PR e na `main`: instalação, migrations, divergência do schema, lint, tipos, testes, build e imagem.
- `publish` roda só na `main`, depois do `ci`, e publica `ghcr.io/bruninnhoo/kamble-api:<SHA do commit>`. É o único job com permissão de escrita.
- O Dependabot abre PRs mensais e, nos pacotes, ignora versões principais.
- O CodeQL roda pela configuração padrão do GitHub.

## Problemas conhecidos

| #   | Problema                                                                                           | Onde                                           | Tarefa    |
| --- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------- |
| 1   | Dados de turmas, aulas e usuários abertos a qualquer usuário logado; confirmado com curl nas aulas | controllers de `classes`, `sessions` e `users` | 3.1 a 3.3 |
| 2   | Limite de requisições inativo                                                                      | `apps/api/src/app.module.ts`                   | 3.4       |
| 3   | Chat e sinais não conferem a sala                                                                  | `apps/api/src/sessions/sessions.gateway.ts`    | 3.5       |
| 4   | Dois logins do mesmo usuário no mesmo segundo geram o mesmo refresh token, e o segundo falha       | `apps/api/src/auth/auth.service.ts`            | 3.6       |
| 5   | Sessão expira em 15 minutos sem renovar                                                            | `apps/web/src/lib/api.ts`                      | 3.7       |
| 6   | Estado da aula se perde ao recarregar; aula encerrada aceita entrada                               | `useWebRTC.ts` e `sessions.service.ts`         | 3.8       |
| 7   | Aluno não tem caminho até a sala                                                                   | painel do aluno                                | 5.4       |
| 8   | Não há como matricular um aluno pela interface                                                     | API e web                                      | Etapa 6   |
| 9   | Sem câmera nem microfone, não se entra na aula                                                     | `apps/web/src/app/session/[id]/page.tsx`       | 7.2       |
| 10  | O container leva 10 segundos para parar, e a imagem tem 773 MB                                     | `apps/api/src/main.ts` e `apps/api/Dockerfile` | 4.6       |

Enquanto os itens 1 a 6 existirem, o app não deve ser publicado.

## Decisões tomadas

- Projeto de portfólio, sem lançamento comercial.
- Documentação em português, commits em inglês.
- Commits pequenos, uma branch e um PR por etapa, merge commit.
- Todos os commits são feitos pelo autor.
- A publicação da imagem é um job do `ci.yml`, e não um workflow separado, para depender diretamente do `ci`.
- O Prisma CLI é dependência de produção, para a imagem aplicar as migrations.
- CI antes das novas telas; deploy público só depois da Etapa 3.
- Matrícula por link, tela de preparação e demo por visitante.
- Token em `localStorage` e, na demo, em `sessionStorage`, para haver um papel por aba.
- O ESLint não roda o Prettier; a formatação fica fora do lint.
- No web, o `localStorage` é lido com `useSyncExternalStore` (`lib/useStored.ts`), e não com `useEffect` + `setState`, que o lint do React 19 recusa.

## Decisões em aberto

- Hospedagem (4.1). A API precisa de servidor sempre ligado, por causa do WebSocket e do estado em memória.
- Armazenamento dos PDFs (4.2).
- Licença do repositório.

## Ao terminar uma etapa

1. Atualize "Onde paramos", "Próxima tarefa" e "Verificado em".
2. Remova os problemas resolvidos.
3. Marque as tarefas e o estado da etapa no [roteiro](ROTEIRO.md).
