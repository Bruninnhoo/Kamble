# Handoff

Atualizado em 25/11/2026, ao fim da Etapa 1. Ao retomar o projeto, comece por aqui.

## Onde paramos

O projeto tem CI, banco local com Docker Compose, imagem da API e Dependabot. A lógica do app não mudou. O fluxo completo, do cadastro à aula, ainda não foi confirmado em execução.

## Antes da Etapa 2

1. Depois do merge deste PR, confirme que o job `publish` passou e que a imagem `kamble-api` aparece em Packages, no GitHub.
2. Configure o repositório, conforme o último item da [Etapa 1](ROTEIRO.md#etapa-1-git-cicd-e-devops).
3. Marque a Etapa 1 como concluída no roteiro, no primeiro commit de documentação da Etapa 2.

## Próxima tarefa

**2.1: banco local**, na [Etapa 2](ROTEIRO.md#etapa-2-rodar-e-limpar).

1. Atualize a `main` e crie a branch `fix/local-run`.
2. Abra o Docker Desktop e rode `docker compose up -d --wait`.
3. No `apps/api/.env`, use a `DATABASE_URL` do `.env.example`.
4. Rode `pnpm --filter @kamble/api exec prisma migrate deploy`.

Essa tarefa é local e não gera commit.

## Verificado em 25/11/2026

| Verificação            | Resultado                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| CI na `main`           | Passa: instalação, migrations, divergência do schema, tipos, testes, build e imagem                                   |
| Divergência do schema  | Uma alteração proposital fez a checagem falhar                                                                        |
| Imagem da API          | Sobe sem root, aplica as migrations e responde em `/api/docs`; o cadastro funciona, e rota protegida sem token dá 401 |
| Banco do Compose       | Saudável; os dados sobrevivem a um restart                                                                            |
| Publicação no GHCR     | Não testada; só roda na `main`                                                                                        |
| Testes da API          | Um teste, o "Hello World" do Nest, passa                                                                              |
| Lint (em 24/11)        | Web: 7 erros e 4 avisos. API: não executa, falta `eslint-plugin-prettier`                                             |
| Web e sala em execução | Não testados                                                                                                          |
| Teste e2e              | Não executado                                                                                                         |

## Ambiente

- O passo a passo está no [README](../README.md#rodar-localmente).
- O Postgres do Compose usa a porta **5432**. Outro container na mesma porta precisa estar parado. O PostgreSQL 18 instalado na máquina escuta na 5434 e não é usado.
- Node local: 24. pnpm: 9.15.4.
- No Windows, um `pnpm install` do zero falhou com `readStream must be readable`. No Linux e no CI, funciona. Até a tarefa 2.10, evite apagar o `node_modules`.
- O `apps/api/.env` tem `JAVA_SERVICE_URL`, que o código não usa.

## CI/CD

- `ci` roda em todo PR e na `main`.
- `publish` roda só na `main`, depois do `ci`, e publica `ghcr.io/bruninnhoo/kamble-api:<SHA do commit>`. É o único job com permissão de escrita.
- O Dependabot abre PRs mensais e, nos pacotes, ignora versões principais. O PR #4, com 28 atualizações, passou no CI. Ele deve esperar o app rodar localmente (Etapa 2), porque o CI ainda não testa a execução.

## Problemas conhecidos

| #   | Problema                                                                                                            | Onde                                           | Tarefa    |
| --- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------- |
| 1   | O `.env` local não aponta para o banco do Compose                                                                   | `apps/api/.env`                                | 2.1       |
| 2   | Um socket novo a cada render antes de conectar; a sala provavelmente não conecta (visto no código, não em execução) | `apps/web/src/lib/socket.ts`                   | 2.2       |
| 3   | Dados de turmas, aulas e usuários abertos a qualquer usuário logado                                                 | controllers de `classes`, `sessions` e `users` | 3.1 a 3.3 |
| 4   | Limite de requisições inativo                                                                                       | `apps/api/src/app.module.ts`                   | 3.4       |
| 5   | Chat e sinais não conferem a sala                                                                                   | `apps/api/src/sessions/sessions.gateway.ts`    | 3.5       |
| 6   | Dois logins do mesmo usuário no mesmo segundo geram o mesmo refresh token, e o segundo falha                        | `apps/api/src/auth/auth.service.ts`            | 3.6       |
| 7   | Sessão expira em 15 minutos sem renovar                                                                             | `apps/web/src/lib/api.ts`                      | 3.7       |
| 8   | Estado da aula se perde ao recarregar; aula encerrada aceita entrada                                                | `useWebRTC.ts` e `sessions.service.ts`         | 3.8       |
| 9   | Aluno não tem caminho até a sala                                                                                    | painel do aluno                                | 5.4       |
| 10  | Não há como matricular um aluno pela interface                                                                      | API e web                                      | Etapa 6   |
| 11  | Sem câmera nem microfone, não se entra na aula                                                                      | `apps/web/src/app/session/[id]/page.tsx`       | 7.2       |

| 12 | A instalação do zero falha no Windows | máquina de desenvolvimento | 2.10 |
| 13 | O container leva 10 segundos para parar, e a imagem tem 773 MB | `apps/api/src/main.ts` e `apps/api/Dockerfile` | 4.6 |

Enquanto os itens 3 a 8 existirem, o app não deve ser publicado.

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

## Decisões em aberto

- Hospedagem (4.1). A API precisa de servidor sempre ligado, por causa do WebSocket e do estado em memória.
- Armazenamento dos PDFs (4.2).
- Licença do repositório.

## Ao terminar uma etapa

1. Atualize "Onde paramos", "Próxima tarefa" e "Verificado em".
2. Remova os problemas resolvidos.
3. Marque as tarefas e o estado da etapa no [roteiro](ROTEIRO.md).
