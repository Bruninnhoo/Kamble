# Kamble

[![CI](https://github.com/Bruninnhoo/Kamble/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Bruninnhoo/Kamble/actions/workflows/ci.yml)

Sala de aula de inglês ao vivo no navegador: vídeo, chat, livro em PDF e lousa sincronizados entre professor e alunos.

> Projeto de portfólio em desenvolvimento. Ainda não há versão publicada, e a sala ainda não foi testada de ponta a ponta.

## Destaques do projeto

- **Vídeo entre navegadores** com WebRTC, e a API cuidando da sinalização
- **Livro sincronizado:** o professor troca de página, e a turma acompanha
- **Lousa sobre o PDF**, com caneta que o professor libera para um aluno
- **Áudio da aba** misturado ao microfone no compartilhamento de tela

## Estado atual

| Parte                                       | Estado                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------- |
| Cadastro, login e turmas                    | Código escrito                                                                   |
| Agendamento, início e encerramento de aulas | Código escrito                                                                   |
| Sala com vídeo, chat, livro e lousa         | Código escrito, com [problemas conhecidos](docs/HANDOFF.md#problemas-conhecidos) |
| Convite, preparação e demo                  | Planejado                                                                        |
| CI, imagem da API e banco local             | Configurados                                                                     |
| Deploy                                      | Planejado                                                                        |

O que vem a seguir está no [roteiro](docs/ROTEIRO.md).

## Tecnologias

| Camada    | Tecnologia                                                     |
| --------- | -------------------------------------------------------------- |
| Web       | Next.js 16, React 19, Tailwind CSS 4, pdf.js, Socket.IO Client |
| API       | NestJS 11, Prisma 6, Passport JWT, Socket.IO                   |
| Banco     | PostgreSQL                                                     |
| Monorepo  | Turborepo, pnpm                                                |
| DevOps    | GitHub Actions, Docker, GHCR, Dependabot                       |
| Linguagem | TypeScript                                                     |

## Rodar localmente

Requisitos: Node.js 24, pnpm 9 e Docker.

**1. Instale as dependências**

```bash
pnpm install
```

**2. Crie os arquivos de ambiente**

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Em `apps/api/.env`, troque os valores de `JWT_SECRET` e `JWT_REFRESH_SECRET`.

**3. Suba o banco**

```bash
docker compose up -d --wait
```

O banco usa a porta 5432, que precisa estar livre.

**4. Prepare o banco**

```bash
pnpm --filter @kamble/api exec prisma migrate deploy
pnpm --filter @kamble/api exec prisma generate
```

**5. Inicie**

```bash
pnpm dev
```

| Serviço | Endereço                       |
| ------- | ------------------------------ |
| Web     | http://localhost:3000          |
| API     | http://localhost:3001/api/v1   |
| Swagger | http://localhost:3001/api/docs |

## Documentação

- [Escopo](docs/ESCOPO.md): o que o projeto é e o que não é
- [Arquitetura](docs/ARQUITETURA.md): dados, rotas, eventos e decisões
- [Roteiro](docs/ROTEIRO.md): etapas e critérios de pronto
- [Como trabalhamos](CONTRIBUTING.md): branches, commits e PRs
- [Handoff](docs/HANDOFF.md): onde o projeto parou
