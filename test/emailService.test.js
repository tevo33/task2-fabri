const test = require('node:test');
const assert = require('node:assert/strict');
const { createEmailService } = require('../src/services/emailService');

// confere se faltou config
test('emailService identifica quando o Gmail nao esta configurado', () => {
  const service = createEmailService({
    env: {},
  });

  assert.equal(service.isConfigured(), false);
});

// nao envia sem credenciais
test('emailService retorna skipped quando nao ha configuracao', async () => {
  const service = createEmailService({
    env: {},
  });

  const result = await service.sendLancamentoNotification({
    descricao: 'Internet',
    data_lancamento: '2026-03-12',
    valor: '99.90',
    situacao: 'PAGO',
  }, 'criado');

  assert.deepEqual(result, {
    sent: false,
    reason: 'not_configured',
  });
});

// monta e envia o e-mail
test('emailService envia e-mail com Gmail SMTP e assunto esperado', async () => {
  const sentMessages = [];
  const transportConfigs = [];
  const service = createEmailService({
    env: {
      EMAIL_USER: 'financeiro@gmail.com',
      EMAIL_PASS: 'app-password',
      EMAIL_TO: 'destino@gmail.com',
    },
    transportFactory(config) {
      transportConfigs.push(config);

      return {
        async sendMail(message) {
          sentMessages.push(message);
        },
      };
    },
  });

  const result = await service.sendLancamentoNotification({
    descricao: 'Aluguel',
    data_lancamento: '2026-03-10',
    valor: '1500.00',
    situacao: 'PAGO',
  }, 'atualizado');

  assert.deepEqual(result, { sent: true });
  assert.deepEqual(transportConfigs[0], {
    service: 'gmail',
    auth: {
      user: 'financeiro@gmail.com',
      pass: 'app-password',
    },
  });
  assert.equal(sentMessages[0].to, 'destino@gmail.com');
  assert.match(sentMessages[0].subject, /Lancamento atualizado: Aluguel/);
  assert.match(sentMessages[0].text, /Valor: R\$\s?1\.500,00/);
});

// fecha a conexao no fim
test('emailService fecha o transporte quando close estiver disponivel', async () => {
  let closed = false;
  const service = createEmailService({
    env: {
      EMAIL_USER: 'financeiro@gmail.com',
      EMAIL_PASS: 'app-password',
    },
    transportFactory() {
      return {
        async sendMail() {},
        close() {
          closed = true;
        },
      };
    },
  });

  await service.sendLancamentoNotification({
    descricao: 'Academia',
    data_lancamento: '2026-03-14',
    valor: '89.90',
    situacao: 'PAGO',
  }, 'criado');

  assert.equal(closed, true);
});
