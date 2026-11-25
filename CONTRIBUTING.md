# Como trabalhamos

## Por etapas

O trabalho segue o [roteiro](docs/ROTEIRO.md), uma etapa por vez. Antes de começar, leia o [handoff](docs/HANDOFF.md).

1. Crie a branch da etapa a partir da `main` atualizada.
2. Faça uma tarefa por vez e verifique o resultado.
3. Faça um commit por tarefa.
4. Atualize o handoff e o roteiro no último commit da etapa.
5. Abra o PR.

Uma ideia fora da etapa vai para o roteiro, e não para a branch atual.

## Branches

Formato `tipo/assunto`, em inglês e minúsculas: `docs/project-foundation`, `feat/class-invite`, `fix/call-socket`.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/pt-br/), em inglês, no imperativo e com um assunto só.

| Tipo       | Uso                                         |
| ---------- | ------------------------------------------- |
| `feat`     | Funcionalidade                              |
| `fix`      | Correção                                    |
| `docs`     | Documentação                                |
| `test`     | Testes                                      |
| `refactor` | Mudança interna sem alterar o comportamento |
| `ci`       | Integração e entrega contínuas              |
| `build`    | Build e imagens                             |
| `chore`    | Manutenção                                  |

Se a mensagem junta dois assuntos, provavelmente são dois commits.

## Pull requests

- Um PR por etapa, com o que mudou e como foi verificado.
- CI aprovado antes do merge, a partir da Etapa 1.
- Merge commit, sem squash, para manter os commits pequenos no histórico.
- Branch apagada após o merge.

## Verificação

| Comando          | O que confere                              |
| ---------------- | ------------------------------------------ |
| `pnpm build`     | Build dos apps                             |
| `pnpm lint`      | Lint, hoje com falhas conhecidas (Etapa 2) |
| `pnpm typecheck` | Tipos de todos os pacotes                  |
| `pnpm test`      | Testes da API                              |

Regra de negócio, permissão ou validação nova leva um teste no mesmo commit.

## CI/CD

O workflow é o [ci.yml](.github/workflows/ci.yml). O deploy entra na Etapa 4:

| Momento         | O que roda                                             |
| --------------- | ------------------------------------------------------ |
| PR              | Typecheck, testes, build, migrations e build da imagem |
| Merge na `main` | O mesmo, e publicação da imagem no GHCR                |
| Após a Etapa 4  | Deploy automático, com retorno a uma versão anterior   |

## Segredos

- Arquivos `.env` com valores reais nunca entram no Git. Só os `.env.example`, com valores fictícios.
- Segredos de CI ficam no GitHub, com a menor permissão necessária.
- Se um segredo vazar, troque-o primeiro. Apagar o commit não basta.
