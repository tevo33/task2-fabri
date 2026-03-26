require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const port = Number(process.env.PORT || 3000);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false }));

function formatDateForInput(value) {
  return new Date(value).toISOString().split('T')[0];
}

app.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        descricao,
        data_lancamento,
        valor,
        tipo_lancamento,
        situacao
      FROM lancamento
      ORDER BY data_lancamento DESC, id DESC
    `);

    res.render('lancamentos', {
      lancamentos: result.rows,
      error: null,
    });
  } catch (error) {
    res.render('lancamentos', {
      lancamentos: [],
      error: 'Nao foi possivel carregar os lancamentos. Verifique a conexao com o banco.',
    });
  }
});

app.get('/registrar', async (req, res) => {
  const lancamentoId = Number(req.query.id || 0);

  try {
    const [despesasResult, edicaoResult] = await Promise.all([
      pool.query(`
        SELECT
          id,
          descricao,
          data_lancamento,
          valor,
          tipo_lancamento,
          situacao
        FROM lancamento
        WHERE tipo_lancamento = 'DESPESA'
        ORDER BY data_lancamento DESC, id DESC
      `),
      lancamentoId
        ? pool.query(`
            SELECT
              id,
              descricao,
              data_lancamento,
              valor,
              situacao
            FROM lancamento
            WHERE id = $1
              AND tipo_lancamento = 'DESPESA'
          `, [lancamentoId])
        : Promise.resolve({ rows: [] }),
    ]);

    const lancamentoEmEdicao = edicaoResult.rows[0]
      ? {
          ...edicaoResult.rows[0],
          data_lancamento: formatDateForInput(edicaoResult.rows[0].data_lancamento),
        }
      : null;

    res.render('registrar', {
      despesas: despesasResult.rows,
      lancamentoEmEdicao,
      error: null,
    });
  } catch (error) {
    res.render('registrar', {
      despesas: [],
      lancamentoEmEdicao: null,
      error: 'Nao foi possivel carregar o cadastro de despesas.',
    });
  }
});

app.post('/registrar', async (req, res) => {
  const { descricao, data_lancamento, valor, situacao } = req.body;

  try {
    await pool.query(`
      INSERT INTO lancamento (
        descricao,
        data_lancamento,
        valor,
        tipo_lancamento,
        situacao
      ) VALUES ($1, $2, $3, 'DESPESA', $4)
    `, [descricao, data_lancamento, valor, situacao]);

    res.redirect('/registrar');
  } catch (error) {
    res.status(400).render('registrar', {
      despesas: [],
      lancamentoEmEdicao: {
        descricao,
        data_lancamento,
        valor,
        situacao,
      },
      error: 'Nao foi possivel salvar a despesa.',
    });
  }
});

app.post('/registrar/:id/editar', async (req, res) => {
  const { id } = req.params;
  const { descricao, data_lancamento, valor, situacao } = req.body;

  try {
    await pool.query(`
      UPDATE lancamento
      SET
        descricao = $1,
        data_lancamento = $2,
        valor = $3,
        situacao = $4
      WHERE id = $5
        AND tipo_lancamento = 'DESPESA'
    `, [descricao, data_lancamento, valor, situacao, id]);

    res.redirect('/registrar');
  } catch (error) {
    res.redirect(`/registrar?id=${id}`);
  }
});

app.post('/registrar/:id/excluir', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(`
      DELETE FROM lancamento
      WHERE id = $1
        AND tipo_lancamento = 'DESPESA'
    `, [id]);
  } finally {
    res.redirect('/registrar');
  }
});

app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});
