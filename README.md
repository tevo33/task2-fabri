# Task 2 - Registro de despesas e receitas

Aplicacao enxuta em Node.js com PostgreSQL para listar lancamentos financeiros.

## Requisitos

- Node.js 24+
- PostgreSQL

## Configuracao

1. Copie `.env.example` para `.env`
2. Preencha as credenciais do PostgreSQL da VM
3. Crie o banco de dados
4. Execute os scripts SQL:

```sql
\i sql/schema.sql
\i sql/seed.sql
```

## Execucao

```bash
npm install
npm start
```

A aplicacao ficara disponivel em `http://localhost:3000`.

## Estrutura

- `src/server.js`: servidor Express e rota principal
- `src/db.js`: conexao com PostgreSQL
- `views/lancamentos.ejs`: tela de listagem
- `sql/schema.sql`: criacao das tabelas
- `sql/seed.sql`: carga inicial
