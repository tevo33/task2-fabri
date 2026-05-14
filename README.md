# Task 2 - Registro de despesas e receitas

Aplicacao enxuta em Node.js com PostgreSQL para CRUD de despesas pessoais, listagem de lancamentos, filtros, notificacao por e-mail e exportacao em PDF.

## Requisitos

- Node.js 24+
- PostgreSQL

## Configuracao

1. Copie `.env.example` para `.env`
2. Preencha as credenciais do PostgreSQL da VM
3. Se quiser envio de e-mail via Gmail, configure:
   - `EMAIL_USER`: conta Gmail remetente
   - `EMAIL_PASS`: app password do Google
   - `EMAIL_TO`: destinatario do aviso
4. Crie o banco de dados
5. Execute os scripts SQL:

```sql
\i sql/schema.sql
\i sql/seed.sql
```

## Execucao

```bash
npm install
npm run migrate
npm start
```

Para rodar os testes:

```bash
npm test
```

A validacao completa de integracao local roda testes e qualidade de codigo:

```bash
npm run ci
```

A aplicacao ficara disponivel em `http://localhost:3000`.

## Ambientes com Docker

A tarefa final usa dois ambientes isolados por container e banco:

- Homologacao: `http://177.44.248.58:3000/homolog`
- Producao: `http://177.44.248.58:3000/prod`

Na VM, atualize cada ambiente com um comando:

```bash
./scripts/deploy.sh homolog
./scripts/deploy.sh prod
```

O deploy de producao exige que o mesmo commit ja tenha sido aplicado em homologacao.

Documentos auxiliares da entrega final:

- `docs/arquitetura-final.md`: arquitetura, tecnologias e fluxo CI/CD
- `docs/roteiro-mudancas.md`: roteiro para registrar e demonstrar mudancas

## Recursos

- CRUD de despesas
- Login com sessao
- Filtros por data inicial, data final e situacao
- Exportacao da listagem para PDF
- Envio de e-mail apos criar ou atualizar uma despesa
- 20 testes automatizados com `node:test`

## Estrutura

- `src/app.js`: composicao do app Express e rotas
- `src/server.js`: bootstrap do servidor
- `src/db.js`: conexao com PostgreSQL
- `src/services/emailService.js`: envio de e-mail via Gmail
- `src/services/pdfService.js`: geracao do PDF
- `src/utils/filters.js`: normalizacao e montagem dos filtros
- `views/lancamentos.ejs`: tela de listagem com filtros e exportacao
- `views/registrar.ejs`: tela de CRUD de despesas com filtros
- `sql/schema.sql`: criacao das tabelas
- `sql/seed.sql`: carga inicial
- `test/`: 20 testes automatizados
