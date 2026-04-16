const express = require('express');
const session = require('express-session');
const path = require('path');
const {
  normalizeFilters,
  buildFilterClause,
  buildFilterQueryString,
  VALID_STATUS,
} = require('./utils/filters');
const { createEmailService } = require('./services/emailService');
const { generateLancamentosPdf } = require('./services/pdfService');
const EXPENSE_STATUS_OPTIONS = ['PENDENTE', 'PAGO'];

function formatDateForInput(value) {
  return new Date(value).toISOString().split('T')[0];
}

function requireAuth(req, res, next) {
  if (req.session.usuario) {
    return next();
  }

  return res.redirect('/login');
}

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

function buildNotificationMessage(result, actionLabel) {
  if (result.sent) {
    return `Despesa ${actionLabel} e e-mail enviado.`;
  }

  if (result.reason === 'not_configured') {
    return `Despesa ${actionLabel}. E-mail nao configurado.`;
  }

  return `Despesa ${actionLabel}, mas o e-mail falhou.`;
}

async function sendNotification(emailService, lancamento, actionLabel) {
  try {
    return await emailService.sendLancamentoNotification(lancamento, actionLabel);
  } catch (error) {
    return { sent: false, reason: 'error' };
  }
}

async function listLancamentos(pool, filters, options = {}) {
  const onlyDespesas = options.onlyDespesas === true;
  const { clause, values } = buildFilterClause(filters);
  const baseWhere = onlyDespesas ? `WHERE tipo_lancamento = 'DESPESA'` : 'WHERE 1 = 1';

  const result = await pool.query(`
    SELECT
      id,
      descricao,
      data_lancamento,
      valor,
      tipo_lancamento,
      situacao
    FROM lancamento
    ${baseWhere}${clause}
    ORDER BY data_lancamento DESC, id DESC
  `, values);

  return result.rows;
}

function createApp(options = {}) {
  const pool = options.pool;
  const emailService = options.emailService || createEmailService();

  if (!pool || typeof pool.query !== 'function') {
    throw new Error('A pool de banco precisa ser informada.');
  }

  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', 'views'));
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(express.urlencoded({ extended: false }));
  app.use(session({
    secret: process.env.SESSION_SECRET || 'task2-simples',
    resave: false,
    saveUninitialized: false,
  }));

  app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    res.locals.flash = req.session.flash || null;
    delete req.session.flash;
    next();
  });

  app.get('/login', (req, res) => {
    if (req.session.usuario) {
      return res.redirect('/');
    }

    return res.render('login', { error: null });
  });

  app.post('/login', async (req, res) => {
    const { login, senha } = req.body;

    try {
      const result = await pool.query(`
        SELECT id, nome, login
        FROM usuario
        WHERE login = $1
          AND senha = $2
          AND situacao = 'ATIVO'
        LIMIT 1
      `, [login, senha]);

      if (!result.rows[0]) {
        return res.status(401).render('login', {
          error: 'Login ou senha invalidos.',
        });
      }

      req.session.usuario = result.rows[0];
      return res.redirect('/');
    } catch (error) {
      return res.status(500).render('login', {
        error: 'Nao foi possivel fazer login.',
      });
    }
  });

  app.post('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  });

  app.get('/', requireAuth, async (req, res) => {
    const filters = normalizeFilters(req.query);

    try {
      const lancamentos = await listLancamentos(pool, filters);

      res.render('lancamentos', {
        lancamentos,
        error: null,
        filters,
        filterQueryString: buildFilterQueryString(filters),
        statusOptions: VALID_STATUS,
        expenseStatusOptions: EXPENSE_STATUS_OPTIONS,
      });
    } catch (error) {
      res.render('lancamentos', {
        lancamentos: [],
        error: 'Nao foi possivel carregar os lancamentos. Verifique a conexao com o banco.',
        filters,
        filterQueryString: buildFilterQueryString(filters),
        statusOptions: VALID_STATUS,
        expenseStatusOptions: EXPENSE_STATUS_OPTIONS,
      });
    }
  });

  app.get('/lancamentos/pdf', requireAuth, async (req, res) => {
    const filters = normalizeFilters(req.query);

    try {
      const lancamentos = await listLancamentos(pool, filters);
      const pdfBuffer = await generateLancamentosPdf({ lancamentos, filters });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=\"lancamentos.pdf\"');
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).send('Nao foi possivel gerar o PDF.');
    }
  });

  app.get('/registrar', requireAuth, async (req, res) => {
    const lancamentoId = Number(req.query.id || 0);
    const filters = normalizeFilters(req.query);

    try {
      const [despesas, edicaoResult] = await Promise.all([
        listLancamentos(pool, filters, { onlyDespesas: true }),
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
        despesas,
        lancamentoEmEdicao,
        error: null,
        filters,
        statusOptions: VALID_STATUS,
        expenseStatusOptions: EXPENSE_STATUS_OPTIONS,
      });
    } catch (error) {
      res.render('registrar', {
        despesas: [],
        lancamentoEmEdicao: null,
        error: 'Nao foi possivel carregar o cadastro de despesas.',
        filters,
        statusOptions: VALID_STATUS,
        expenseStatusOptions: EXPENSE_STATUS_OPTIONS,
      });
    }
  });

  app.post('/registrar', requireAuth, async (req, res) => {
    const { descricao, data_lancamento, valor, situacao } = req.body;

    try {
      const result = await pool.query(`
        INSERT INTO lancamento (
          descricao,
          data_lancamento,
          valor,
          tipo_lancamento,
          situacao
        ) VALUES ($1, $2, $3, 'DESPESA', $4)
        RETURNING id, descricao, data_lancamento, valor, tipo_lancamento, situacao
      `, [descricao, data_lancamento, valor, situacao]);

      const emailResult = await sendNotification(emailService, result.rows[0], 'criado');
      setFlash(req, 'success', buildNotificationMessage(emailResult, 'cadastrada'));
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
        filters: normalizeFilters({}),
        statusOptions: VALID_STATUS,
        expenseStatusOptions: EXPENSE_STATUS_OPTIONS,
      });
    }
  });

  app.post('/registrar/:id/editar', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { descricao, data_lancamento, valor, situacao } = req.body;

    try {
      const result = await pool.query(`
        UPDATE lancamento
        SET
          descricao = $1,
          data_lancamento = $2,
          valor = $3,
          situacao = $4
        WHERE id = $5
          AND tipo_lancamento = 'DESPESA'
        RETURNING id, descricao, data_lancamento, valor, tipo_lancamento, situacao
      `, [descricao, data_lancamento, valor, situacao, id]);

      if (!result.rows[0]) {
        setFlash(req, 'error', 'Despesa nao encontrada para atualizacao.');
        return res.redirect('/registrar');
      }

      const emailResult = await sendNotification(emailService, result.rows[0], 'atualizado');
      setFlash(req, 'success', buildNotificationMessage(emailResult, 'atualizada'));
      res.redirect('/registrar');
    } catch (error) {
      setFlash(req, 'error', 'Nao foi possivel atualizar a despesa.');
      res.redirect(`/registrar?id=${id}`);
    }
  });

  app.post('/registrar/:id/excluir', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
      await pool.query(`
        DELETE FROM lancamento
        WHERE id = $1
          AND tipo_lancamento = 'DESPESA'
      `, [id]);

      setFlash(req, 'success', 'Despesa excluida com sucesso.');
    } catch (error) {
      setFlash(req, 'error', 'Nao foi possivel excluir a despesa.');
    } finally {
      res.redirect('/registrar');
    }
  });

  return app;
}

module.exports = {
  createApp,
  formatDateForInput,
};
