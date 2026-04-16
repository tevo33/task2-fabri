const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

function createPoolStub(handler) {
  const calls = [];

  return {
    calls,
    async query(sql, params = []) {
      calls.push({ sql, params });
      return handler(sql, params, calls.length - 1);
    },
  };
}

function createLoggedAgent(pool, emailService) {
  const app = createApp({ pool, emailService });
  const agent = request.agent(app);

  return {
    app,
    agent,
  };
}

test('GET /login renderiza a tela de acesso', async () => {
  const pool = createPoolStub(async () => ({ rows: [] }));
  const app = createApp({ pool });
  const response = await request(app).get('/login');

  assert.equal(response.status, 200);
  assert.match(response.text, /Entrar/);
});

test('GET / redireciona para /login quando usuario nao esta autenticado', async () => {
  const pool = createPoolStub(async () => ({ rows: [] }));
  const app = createApp({ pool });
  const response = await request(app).get('/');

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, '/login');
});

test('POST /login autentica usuario valido', async () => {
  const pool = createPoolStub(async (sql) => {
    if (sql.includes('FROM usuario')) {
      return {
        rows: [{ id: 1, nome: 'Administrador', login: 'admin' }],
      };
    }

    return { rows: [] };
  });
  const app = createApp({ pool });
  const response = await request(app)
    .post('/login')
    .type('form')
    .send({ login: 'admin', senha: '123456' });

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, '/');
});

test('POST /login retorna 401 para credenciais invalidas', async () => {
  const pool = createPoolStub(async () => ({ rows: [] }));
  const app = createApp({ pool });
  const response = await request(app)
    .post('/login')
    .type('form')
    .send({ login: 'admin', senha: 'errada' });

  assert.equal(response.status, 401);
  assert.match(response.text, /Login ou senha invalidos/);
});

test('GET / aplica filtros de data e situacao na consulta', async () => {
  const pool = createPoolStub(async (sql) => {
    if (sql.includes('FROM usuario')) {
      return {
        rows: [{ id: 1, nome: 'Administrador', login: 'admin' }],
      };
    }

    if (sql.includes('FROM lancamento')) {
      return {
        rows: [
          {
            id: 10,
            descricao: 'Aluguel',
            data_lancamento: '2026-03-10',
            valor: '1500.00',
            tipo_lancamento: 'DESPESA',
            situacao: 'PAGO',
          },
        ],
      };
    }

    return { rows: [] };
  });
  const { agent } = createLoggedAgent(pool);

  await agent
    .post('/login')
    .type('form')
    .send({ login: 'admin', senha: '123456' });

  const response = await agent.get('/?data_inicio=2026-03-01&data_fim=2026-03-31&situacao=PAGO');

  assert.equal(response.status, 200);
  assert.match(response.text, /Aluguel/);
  assert.match(pool.calls[1].sql, /data_lancamento >= \$1/);
  assert.match(pool.calls[1].sql, /data_lancamento <= \$2/);
  assert.match(pool.calls[1].sql, /situacao = \$3/);
  assert.deepEqual(pool.calls[1].params, ['2026-03-01', '2026-03-31', 'PAGO']);
});

test('POST /registrar cria despesa e envia notificacao por e-mail', async () => {
  const notifications = [];
  const emailService = {
    async sendLancamentoNotification(lancamento, action) {
      notifications.push({ lancamento, action });
      return { sent: true };
    },
  };
  const pool = createPoolStub(async (sql) => {
    if (sql.includes('FROM usuario')) {
      return {
        rows: [{ id: 1, nome: 'Administrador', login: 'admin' }],
      };
    }

    if (sql.includes('INSERT INTO lancamento')) {
      return {
        rows: [{
          id: 11,
          descricao: 'Supermercado',
          data_lancamento: '2026-03-13',
          valor: '385.70',
          tipo_lancamento: 'DESPESA',
          situacao: 'PAGO',
        }],
      };
    }

    return { rows: [] };
  });
  const { agent } = createLoggedAgent(pool, emailService);

  await agent
    .post('/login')
    .type('form')
    .send({ login: 'admin', senha: '123456' });

  const response = await agent
    .post('/registrar')
    .type('form')
    .send({
      descricao: 'Supermercado',
      data_lancamento: '2026-03-13',
      valor: '385.70',
      situacao: 'PAGO',
    });

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, '/registrar');
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].action, 'criado');
  assert.deepEqual(pool.calls[1].params, ['Supermercado', '2026-03-13', '385.70', 'PAGO']);
});

test('POST /registrar/:id/editar atualiza despesa e envia notificacao', async () => {
  const notifications = [];
  const emailService = {
    async sendLancamentoNotification(lancamento, action) {
      notifications.push({ lancamento, action });
      return { sent: true };
    },
  };
  const pool = createPoolStub(async (sql, params) => {
    if (sql.includes('FROM usuario')) {
      return {
        rows: [{ id: 1, nome: 'Administrador', login: 'admin' }],
      };
    }

    if (sql.includes('UPDATE lancamento')) {
      return {
        rows: [{
          id: Number(params[4]),
          descricao: params[0],
          data_lancamento: params[1],
          valor: params[2],
          tipo_lancamento: 'DESPESA',
          situacao: params[3],
        }],
      };
    }

    return { rows: [] };
  });
  const { agent } = createLoggedAgent(pool, emailService);

  await agent
    .post('/login')
    .type('form')
    .send({ login: 'admin', senha: '123456' });

  const response = await agent
    .post('/registrar/7/editar')
    .type('form')
    .send({
      descricao: 'Curso',
      data_lancamento: '2026-03-20',
      valor: '320.00',
      situacao: 'PENDENTE',
    });

  assert.equal(response.status, 302);
  assert.equal(response.headers.location, '/registrar');
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].action, 'atualizado');
  assert.deepEqual(pool.calls[1].params, ['Curso', '2026-03-20', '320.00', 'PENDENTE', '7']);
});

test('GET /lancamentos/pdf exporta um arquivo PDF', async () => {
  const pool = createPoolStub(async (sql) => {
    if (sql.includes('FROM usuario')) {
      return {
        rows: [{ id: 1, nome: 'Administrador', login: 'admin' }],
      };
    }

    if (sql.includes('FROM lancamento')) {
      return {
        rows: [
          {
            id: 3,
            descricao: 'Salario mensal',
            data_lancamento: '2026-03-05',
            valor: '4500.00',
            tipo_lancamento: 'RECEITA',
            situacao: 'PAGO',
          },
        ],
      };
    }

    return { rows: [] };
  });
  const { agent } = createLoggedAgent(pool);

  await agent
    .post('/login')
    .type('form')
    .send({ login: 'admin', senha: '123456' });

  const response = await agent.get('/lancamentos/pdf?situacao=PAGO');

  assert.equal(response.status, 200);
  assert.match(response.headers['content-type'], /application\/pdf/);
  assert.match(response.headers['content-disposition'], /lancamentos\.pdf/);
  assert.equal(response.body.subarray(0, 4).toString(), '%PDF');
});
