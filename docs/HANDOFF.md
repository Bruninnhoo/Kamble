# Handoff

Atualizado em 24/11/2026, ao fim da Etapa 0. Ao retomar o projeto, comece por aqui.

## Onde paramos

A documentação está escrita. Nenhum código do app mudou nesta etapa. O fluxo completo, do cadastro à aula, ainda não foi confirmado em execução.

## Próxima tarefa

**1.1: `.gitattributes`**, na [Etapa 1](ROTEIRO.md#etapa-1-git-cicd-e-devops).

1. Confirme que o PR da Etapa 0 entrou na `main`.
2. Atualize a `main` e crie a branch `chore/devops-foundation`.
3. Crie o `.gitattributes` com `* text=auto eol=lf`.
4. Rode `git add .gitattributes` e depois `git add --renormalize .`. Confira com `git status` que só o `.gitattributes` mudou.
5. Faça o commit: `chore: normalize line endings`.

## Verificado em 24/11/2026

| Verificação           | Resultado                                   |
| --------------------- | ------------------------------------------- |
| Tipos da API e do web | Passam                                      |
| Testes da API         | Um teste, o "Hello World" do Nest, passa    |
| Lint do web           | 7 erros e 4 avisos                          |
| Lint da API           | Não executa: falta `eslint-plugin-prettier` |
| Build e execução      | Não testados                                |
| Teste e2e             | Não executado; precisa do banco             |

## Ambiente

- O passo a passo está no [README](../README.md#rodar-localmente).
- Na máquina de desenvolvimento, o PostgreSQL 18 escuta na porta **5434**, e o `apps/api/.env` aponta para a 5432. A correção é a tarefa 2.1.
- Node local: 24. pnpm: 9.15.4.
- O Docker está instalado, mas o Docker Desktop precisa estar aberto a partir da tarefa 1.10.
- O `apps/api/.env` tem `JAVA_SERVICE_URL`, que o código não usa.

## Problemas conhecidos

| #   | Problema                                                                                                            | Onde                                           | Tarefa    |
| --- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | --------- |
| 1   | Porta do banco errada                                                                                               | `apps/api/.env`                                | 2.1       |
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

Enquanto os itens 3 a 8 existirem, o app não deve ser publicado.

## Decisões tomadas

- Projeto de portfólio, sem lançamento comercial.
- Documentação em português, commits em inglês.
- Commits pequenos, uma branch e um PR por etapa, merge commit.
- Commits, PRs e a configuração de Git, CI/CD e DevOps são feitos manualmente pelo autor.
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
