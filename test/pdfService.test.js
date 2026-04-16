const test = require('node:test');
const assert = require('node:assert/strict');
const { generateLancamentosPdf } = require('../src/services/pdfService');

// gera um arquivo pdf
test('generateLancamentosPdf retorna um buffer PDF', async () => {
  const buffer = await generateLancamentosPdf({
    lancamentos: [],
    filters: {},
  });

  assert.equal(Buffer.isBuffer(buffer), true);
  assert.equal(buffer.subarray(0, 4).toString(), '%PDF');
});

// coloca o titulo no pdf
test('generateLancamentosPdf inclui o titulo principal', async () => {
  const buffer = await generateLancamentosPdf({
    lancamentos: [],
    filters: {},
  });

  assert.match(buffer.toString('latin1'), /\(Relatorio de lancamentos\)/);
});

// mostra os filtros no pdf
test('generateLancamentosPdf descreve os filtros aplicados', async () => {
  const buffer = await generateLancamentosPdf({
    lancamentos: [
      {
        descricao: 'Conta de energia',
        data_lancamento: '2026-03-11',
        valor: '220.45',
        tipo_lancamento: 'DESPESA',
        situacao: 'PAGO',
      },
    ],
    filters: {
      data_inicio: '2026-03-01',
      data_fim: '2026-03-31',
      situacao: 'PAGO',
    },
  });

  assert.match(buffer.toString('latin1'), /\(Filtros: Data inicial: 2026-03-01 \| Data final: 2026-03-31 \| Situacao: PAGO\)/);
});
