# Roteiro da apresentacao da tarefa final

Este roteiro segue a ordem de validacao do enunciado e da revisao feita em aula. A mudanca de label e a nova tabela devem ser definidas e implementadas somente no dia.

## Antes da apresentacao

- Confirmar que o repositorio esta publico e que a branch principal e `main`.
- Confirmar acesso SSH a VM e permissao de `sudo`.
- Deixar abertas duas abas: GitHub Actions e GitHub Issues.
- Nao deixar imagens ou containers prontos na VM.
- Se o professor encontrar algo antigo, remover somente quando ele solicitar.

## 1. Mostrar a VM limpa

```bash
ssh univates@177.44.248.58
docker images
docker ps -a
```

Resultado esperado: nenhuma imagem e nenhum container da aplicacao.

## 2. Instalar ferramentas e projeto automaticamente

Executar um unico bootstrap:

```bash
curl -fsSL https://raw.githubusercontent.com/tevo33/task2-fabri/main/scripts/bootstrap.sh | sh
cd ~/task2-fabri
```

O script instala Git, Docker e Docker Compose, inicia o Docker e clona o projeto.

## 3. Criar Homologacao

```bash
./scripts/deploy.sh homolog
sudo docker compose ps
```

Acessar `http://177.44.248.58:3000/homolog`, entrar com `admin` / `123456`, listar os lancamentos e cadastrar uma despesa.

## 4. Criar Producao

```bash
./scripts/deploy.sh prod
sudo docker compose ps
```

Acessar `http://177.44.248.58:3000/prod`, entrar, listar os lancamentos e cadastrar outra despesa.

Antes das mudancas, registrar a quantidade de dados e as tabelas dos dois bancos:

```bash
sudo docker compose exec db-homolog psql -U task2 -d financeiro_homolog -c "\dt"
sudo docker compose exec db-homolog psql -U task2 -d financeiro_homolog -c "SELECT COUNT(*) FROM lancamento;"
sudo docker compose exec db-prod psql -U task2 -d financeiro_prod -c "\dt"
sudo docker compose exec db-prod psql -U task2 -d financeiro_prod -c "SELECT COUNT(*) FROM lancamento;"
```

## 5. Registrar a mudanca

Criar uma GitHub Issue com o titulo `Alterar label e criar tabela solicitada`.

Descricao sugerida:

```text
Alterar o label indicado pelo professor de [TEXTO ATUAL] para [NOVO TEXTO].
Criar a tabela [NOME DA TABELA] por migration, sem apagar tabelas ou dados existentes.
Validar primeiro em Homologacao e depois promover o mesmo commit para Producao.
```

## 6. Implementar codigo e banco

No computador de desenvolvimento:

```bash
git checkout main
git pull
git checkout -b mudanca-label-tabela
```

1. Alterar somente o texto solicitado no arquivo `.ejs` indicado.
2. Criar `sql/migrations/003_create_NOME_DA_TABELA.sql`.
3. A migration deve conter apenas `CREATE TABLE ...`; nao usar `DROP`, recriar banco ou repetir os scripts iniciais.

Exemplo de formato, adaptando os campos pedidos:

```sql
CREATE TABLE categoria (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL
);
```

## 7. Testar, versionar e integrar

```bash
npm run ci
git add views sql/migrations
git commit -m "Altera label e adiciona tabela solicitada"
git push -u origin mudanca-label-tabela
```

Mostrar o GitHub Actions executando:

- 20 testes automatizados e suas estatisticas;
- ESLint para qualidade de codigo;
- build da imagem Docker.

Depois do CI aprovado, o GitHub Actions abre o Pull Request e faz o merge na `main` quando nao existem conflitos.

## 8. Atualizar e validar Homologacao

Na VM:

```bash
cd ~/task2-fabri
./scripts/deploy.sh homolog
```

Na aba de Homologacao, atualizar a pagina e mostrar o novo label. Depois:

```bash
sudo docker compose exec db-homolog psql -U task2 -d financeiro_homolog -c "\dt"
sudo docker compose exec db-homolog psql -U task2 -d financeiro_homolog -c "SELECT COUNT(*) FROM lancamento;"
```

Confirmar que a nova tabela apareceu e que a quantidade anterior de lancamentos foi preservada.

## 9. Aprovar e promover Producao

Declarar a aprovacao de Homologacao e executar:

```bash
./scripts/deploy.sh prod
```

Na aba de Producao, atualizar a pagina e mostrar o novo label. Depois:

```bash
sudo docker compose exec db-prod psql -U task2 -d financeiro_prod -c "\dt"
sudo docker compose exec db-prod psql -U task2 -d financeiro_prod -c "SELECT COUNT(*) FROM lancamento;"
```

Confirmar a nova tabela e os dados antigos preservados. O script bloqueia Producao se o mesmo commit ainda nao tiver passado por Homologacao.

## Checklist final

- VM inicialmente sem imagens e containers.
- Ferramentas e projeto instalados por script.
- Homologacao e Producao em containers separados.
- Login, listagem e cadastro funcionando nos dois ambientes.
- Mudanca registrada em GitHub Issue.
- Label e migration implementados ao vivo.
- Commit e push realizados.
- 20 testes, qualidade e build aprovados no GitHub Actions.
- Homologacao atualizada primeiro.
- Producao promovida com o mesmo commit.
- Nova tabela adicionada sem perder dados existentes.
