# API

NestJS 11, Prisma 6 e Socket.IO. Instalação e variáveis de ambiente estão no [README principal](../../README.md#rodar-localmente).

| Comando, em `apps/api`         | Efeito                        |
| ------------------------------ | ----------------------------- |
| `pnpm dev`                     | Inicia com recarga automática |
| `pnpm test`                    | Testes unitários              |
| `pnpm test:e2e`                | Teste com o banco no ar       |
| `pnpm exec prisma migrate dev` | Cria e aplica uma migration   |
| `pnpm exec prisma studio`      | Abre o banco no navegador     |

Rotas e eventos de socket: [arquitetura](../../docs/ARQUITETURA.md).
