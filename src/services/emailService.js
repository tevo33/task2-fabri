const nodemailer = require('nodemailer');

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function createEmailService(options = {}) {
  const env = options.env || process.env;
  const transportFactory = options.transportFactory || nodemailer.createTransport;
  const from = env.EMAIL_USER || '';
  const to = env.EMAIL_TO || from;
  const pass = env.EMAIL_PASS || '';

  return {
    isConfigured() {
      return Boolean(from && pass && to);
    },

    async sendLancamentoNotification(lancamento, action) {
      if (!this.isConfigured()) {
        return { sent: false, reason: 'not_configured' };
      }

      const transport = transportFactory({
        service: 'gmail',
        auth: {
          user: from,
          pass,
        },
      });

      const actionLabel = action === 'atualizado' ? 'atualizado' : 'criado';
      const subject = `Lancamento ${actionLabel}: ${lancamento.descricao}`;
      const text = [
        `O lancamento foi ${actionLabel}.`,
        `Descricao: ${lancamento.descricao}`,
        `Data: ${lancamento.data_lancamento}`,
        `Valor: ${formatCurrency(lancamento.valor)}`,
        `Situacao: ${lancamento.situacao}`,
      ].join('\n');

      try {
        await transport.sendMail({
          from,
          to,
          subject,
          text,
        });
      } finally {
        if (typeof transport.close === 'function') {
          transport.close();
        }
      }

      return { sent: true };
    },
  };
}

module.exports = {
  createEmailService,
};
