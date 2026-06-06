# Arquitetura da tarefa final

## Visao geral

```text
GitHub
  |
  | push / pull request
  v
GitHub Actions
  |-- npm ci
  |-- npm test
  |-- npm run quality
  |-- docker build
  |
  | deploy semi-automatizado na VM
  v
VM Univates - Ubuntu/Linux + Docker
  |
  | porta publica 3000
  v
NGINX container
  |-- /homolog -> app-homolog -> db-homolog
  |-- /prod    -> app-prod    -> db-prod
```

## Tecnologias

- Ambiente: VM Univates `177.44.248.58`, Docker e Docker Compose.
- Aplicacao: Node.js 24, Express, EJS e CSS simples.
- Banco de dados: PostgreSQL em dois containers isolados.
- Controle de mudanca: GitHub Issues.
- Controle de versao: Git e GitHub.
- Integracao: GitHub Actions.
- Testes automatizados: `node --test`, com 20 testes e estatisticas exibidas no console.
- Qualidade de codigo: ESLint com regras de complexidade, tamanho de funcao, variaveis nao usadas e `console.log`.
- Build: imagem Docker gerada no CI.
- Deploy: `scripts/deploy.sh`, com promocao obrigatoria de homologacao antes de producao.

## Ambientes

- Homologacao: `http://177.44.248.58:3000/homolog`
- Producao: `http://177.44.248.58:3000/prod`
- Credenciais da aplicacao: `admin` / `123456`

Cada ambiente usa seu proprio container de aplicacao, banco PostgreSQL, variaveis de ambiente e volume persistente.

## Atualizacao de banco

As alteracoes de banco ficam em `sql/migrations`. O script `npm run migrate` cria a tabela `schema_migrations` e aplica somente arquivos pendentes, garantindo versionamento separado para homologacao e producao.

## Comandos de operacao na VM

```bash
curl -fsSL https://raw.githubusercontent.com/tevo33/task2-fabri/main/scripts/bootstrap.sh | sh
cd ~/task2-fabri
./scripts/deploy.sh homolog
./scripts/deploy.sh prod
```

O primeiro comando automatiza a instalacao de Git, Docker, Docker Compose e do projeto em uma VM limpa.
O segundo comando so executa quando o commit atual ja foi aplicado em homologacao.
