# Escopo

Este documento descreve o produto que queremos construir. O que já existe hoje está no [README](../README.md) e no [handoff](HANDOFF.md).

## Problema

Em uma aula de inglês online, vídeo, livro, lousa e chat costumam ficar em ferramentas separadas. O professor alterna entre janelas, e o aluno se perde sobre em que página a turma está.

O Kamble reúne tudo em uma sala no navegador, com o livro e a lousa sincronizados entre todos os participantes.

## Objetivo do projeto

O Kamble é um projeto de portfólio. A prioridade é uma demo que funcione e um código que possa ser lido e testado. Não há lançamento comercial planejado.

## Para quem é

| Pessoa              | O que precisa                                                                |
| ------------------- | ---------------------------------------------------------------------------- |
| Professor           | Criar a turma, convidar alunos, enviar o livro e dar a aula                  |
| Aluno               | Entrar na turma por um link e chegar à aula sem dificuldade                  |
| Visitante avaliador | Entender o produto em poucos minutos, sozinho, sem conta e talvez sem câmera |

## Fluxos

### Visitante

1. Abre a landing page e escolhe "Experimentar a demo".
2. Chega ao painel do professor, com turma e livro prontos.
3. Abre o aluno em outra aba.
4. Passa pela tela de preparação nas duas abas.
5. Vê o livro e a lousa sincronizados na sala.

### Professor

1. Faz o cadastro e cria uma turma.
2. Envia o livro em PDF, copia o link de convite e agenda a aula.
3. Passa pela tela de preparação e entra na sala.
4. Inicia a aula, usa o livro e a lousa e libera a caneta para um aluno.
5. Encerra a aula e volta à turma.

### Aluno

1. Abre o link de convite.
2. Faz login ou cadastro e entra na turma.
3. Quando a aula está ao vivo, escolhe "Entrar na aula".
4. Passa pela tela de preparação e entra na sala, com ou sem câmera.
5. Ao final, volta à turma.

## Dentro do escopo

- Cadastro e login de professor e aluno
- Turmas e matrícula por link de convite
- Agendamento, início e encerramento de aulas
- Sala com vídeo, áudio, chat e compartilhamento de tela
- Livro em PDF com página sincronizada
- Lousa sobre o livro, com caneta liberada pelo professor
- Tela de preparação e entrada só para assistir
- Demo com ambiente próprio por visitante
- Uso no celular pelo navegador

## Fora do escopo

| Item                   | Motivo                                                       |
| ---------------------- | ------------------------------------------------------------ |
| Pagamentos             | Exigem obrigações legais e custos que não acrescentam à demo |
| Tarefas e notas        | O foco é a aula ao vivo                                      |
| Aprovação de professor | Sem operação real, não há quem aprove                        |
| Avaliação de nível     | Depende de conteúdo pedagógico próprio                       |
| Gravação de aulas      | Custo de processamento e armazenamento de vídeo              |
| Aplicativo nativo      | O navegador do celular atende à demo                         |
| Várias escolas         | Aumenta a complexidade de permissões sem uso previsto        |

O schema do banco ainda tem modelos de tarefas e pagamentos, criados antes desta definição. Nenhuma tela os usa.

## Critérios de sucesso

1. Um avaliador testa os papéis de professor e aluno sem criar conta.
2. Um aluno vai do link de convite até a sala usando apenas a interface.
3. Troca de página e traços feitos pelo professor aparecem na tela do aluno, inclusive depois de recarregar.
4. Quem não tem câmera ou nega a permissão consegue assistir à aula.
5. Um usuário de fora da turma não acessa os dados, as aulas nem os livros dela.
6. Toda mudança chega à `main` por PR, com o CI aprovado a partir da Etapa 1.
