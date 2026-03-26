require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const port = Number(process.env.PORT || 3000);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(express.static(path.join(__dirname, '..', 'public')));

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

app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});
