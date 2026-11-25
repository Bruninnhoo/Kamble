# Roteiro

Cada etapa tem uma branch, um PR e um critério de pronto. Cada tarefa tem o tamanho de um commit. As regras de trabalho estão no [CONTRIBUTING](../CONTRIBUTING.md).

| Etapa                  | Estado                         |
| ---------------------- | ------------------------------ |
| 0. Documentação        | Concluída com o merge deste PR |
| 1. Git, CI/CD e DevOps | Próxima                        |
| 2. Rodar e limpar      | Planejada                      |
| 3. Segurança e sessão  | Planejada                      |
| 4. Hospedagem e CD     | Planejada                      |
| 5. Tela da turma       | Planejada                      |
| 6. Convite             | Planejada                      |
| 7. Preparação          | Planejada                      |
| 8. Demo por visitante  | Planejada                      |
| 9. Fechamento          | Planejada                      |

## Etapa 0: Documentação

Branch `docs/project-foundation`.

- [x] 0.1 Versionar a pasta `docs/`
- [x] 0.2 Escopo
- [x] 0.3 Arquitetura
- [x] 0.4 Roteiro
- [x] 0.5 Guia de contribuição
- [x] 0.6 README
- [x] 0.7 Handoff

**Pronto quando:** os documentos estão na `main`, e a próxima tarefa é clara lendo só o handoff.

## Etapa 1: Git, CI/CD e DevOps

Branch `chore/devops-foundation`. A lógica do app não muda.

- [ ] 1.1 `.gitattributes` com fim de linha LF
- [ ] 1.2 `.nvmrc` com Node 24
- [ ] 1.3 Remover `pnpm-lock.yaml.1778462830`
- [ ] 1.4 `.env.example` nos dois apps, com exceção no `apps/web/.gitignore`, que hoje bloqueia `.env*`
- [ ] 1.5 Scripts `typecheck` e `test` na raiz e tarefa `test` no Turborepo
- [ ] 1.6 CI: instalação, typecheck, testes e build
- [ ] 1.7 CI: migrations em um Postgres e divergência com o schema
- [ ] 1.8 Dependabot mensal e agrupado
- [ ] 1.9 Modelo de PR
- [ ] 1.10 Postgres local com Docker Compose
- [ ] 1.11 Imagem Docker da API
- [ ] 1.12 CI: build da imagem
- [ ] 1.13 Publicação da imagem no GHCR a partir da `main`
- [ ] 1.14 Handoff e badge do CI
- [ ] No GitHub, sem commit: regras da `main`, só merge commit, descrição e tópicos, alertas do Dependabot e CodeQL

**Pronto quando:** o CI está verde, a `main` está protegida e a imagem está no GHCR.

**Fora:** lint no CI (Etapa 2), imagem do web (depende da hospedagem) e deploy (Etapa 4).

## Etapa 2: Rodar e limpar

- [ ] 2.1 Ajustar a porta do banco e aplicar as migrations (local, sem commit)
- [ ] 2.2 Corrigir a criação repetida de socket em `lib/socket.ts`
- [ ] 2.3 Trocar o "Hello World" por `GET /health`, com teste
- [ ] 2.4 Remover dependências e código sem uso
- [ ] 2.5 Trocar os READMEs padrão dos apps
- [ ] 2.6 Remover o depoimento fictício e as promessas fora do escopo
- [ ] 2.7 Corrigir o lint da API
- [ ] 2.8 Corrigir o lint do web
- [ ] 2.9 Lint obrigatório no CI
- [ ] 2.10 Handoff

**Pronto quando:** professor e aluno se conectam localmente, com a matrícula feita à mão no banco, e o CI exige lint.

## Etapa 3: Segurança e sessão

Cada item leva o seu teste.

- [ ] 3.1 Restringir `GET /classes/:id`
- [ ] 3.2 Restringir a consulta de aulas
- [ ] 3.3 Restringir `GET /users/:id`
- [ ] 3.4 Limite de requisições
- [ ] 3.5 Chat e sinais só entre participantes da sala
- [ ] 3.6 Refresh token único
- [ ] 3.7 Renovar a sessão no cliente
- [ ] 3.8 Recuperar o estado da aula ao entrar e recusar aula encerrada
- [ ] 3.9 Handoff

**Pronto quando:** um usuário de fora da turma recebe 403, e a sessão passa de 15 minutos sem novo login.

## Etapa 4: Hospedagem e CD

- [ ] 4.1 Comparar opções e registrar a decisão
- [ ] 4.2 Guardar os PDFs fora do disco da API
- [ ] 4.3 Configurar ambiente e segredos no GitHub
- [ ] 4.4 Deploy automático com migrations
- [ ] 4.5 Testar o retorno a uma versão anterior
- [ ] 4.6 Handoff

**Pronto quando:** um merge na `main` publica a nova versão, e `/health` responde.

## Etapa 5: Tela da turma

- [ ] 5.1 Aulas em `/classes/:id`
- [ ] 5.2 Agendamento em `/classes/:id` e remoção da rota antiga
- [ ] 5.3 Lista de alunos para o professor
- [ ] 5.4 "Entrar na aula" na turma e no painel do aluno
- [ ] 5.5 Remover links mortos
- [ ] 5.6 Painéis no celular
- [ ] 5.7 Handoff

**Pronto quando:** um aluno matriculado chega à sala pela interface.

## Etapa 6: Convite

- [ ] 6.1 `inviteCode` no banco, com preenchimento das turmas existentes
- [ ] 6.2 Consulta e entrada por código na API, com teste
- [ ] 6.3 Link de convite para o professor
- [ ] 6.4 Página `/join/:code`
- [ ] 6.5 Retorno após login ou cadastro, só para caminhos relativos
- [ ] 6.6 Handoff

**Pronto quando:** o aluno se matricula pelo link, sem duplicar e respeitando o limite da turma.

## Etapa 7: Preparação

- [ ] 7.1 Tela com prévia de câmera e microfone
- [ ] 7.2 Entrar só para assistir
- [ ] 7.3 Controles quando não há mídia
- [ ] 7.4 Handoff

**Pronto quando:** é possível entrar sem câmera e receber o áudio e o vídeo do professor.

## Etapa 8: Demo por visitante

- [ ] 8.1 Sessão por aba
- [ ] 8.2 PDF de exemplo escrito para o projeto
- [ ] 8.3 `POST /auth/demo` com limite por IP, com teste
- [ ] 8.4 Entrada do aluno em outra aba
- [ ] 8.5 Limpeza das contas de demo antigas, com teste
- [ ] 8.6 "Experimentar a demo" na landing page
- [ ] 8.7 Handoff

**Pronto quando:** um avaliador testa os dois papéis sozinho.

## Etapa 9: Fechamento

- [ ] 9.1 TURN
- [ ] 9.2 Teste manual em celular e entre redes diferentes
- [ ] 9.3 Prints, vídeo e README final

**Pronto quando:** o vídeo conecta entre redes diferentes, e o README tem o link público.
