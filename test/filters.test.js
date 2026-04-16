const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeFilters,
  buildFilterClause,
  buildFilterQueryString,
} = require('../src/utils/filters');

// devolve filtro vazio
test('normalizeFilters retorna filtros vazios por padrao', () => {
  assert.deepEqual(normalizeFilters(), {
    data_inicio: '',
    data_fim: '',
    situacao: '',
  });
});

// mantem filtro valido
test('normalizeFilters preserva filtros validos', () => {
  assert.deepEqual(normalizeFilters({
    data_inicio: '2026-03-01',
    data_fim: '2026-03-31',
    situacao: 'PAGO',
  }), {
    data_inicio: '2026-03-01',
    data_fim: '2026-03-31',
    situacao: 'PAGO',
  });
});

// limpa filtro invalido
test('normalizeFilters ignora status e datas invalidos', () => {
  assert.deepEqual(normalizeFilters({
    data_inicio: '01/03/2026',
    data_fim: '2026/03/31',
    situacao: 'CANCELADO',
  }), {
    data_inicio: '',
    data_fim: '',
    situacao: '',
  });
});

// monta a clausula sql
test('buildFilterClause monta SQL parametrizado com todos os filtros', () => {
  const result = buildFilterClause({
    data_inicio: '2026-03-01',
    data_fim: '2026-03-31',
    situacao: 'PAGO',
  }, {
    startIndex: 3,
  });

  assert.equal(
    result.clause,
    ' AND data_lancamento >= $3 AND data_lancamento <= $4 AND situacao = $5',
  );
  assert.deepEqual(result.values, ['2026-03-01', '2026-03-31', 'PAGO']);
});

// monta a query da url
test('buildFilterQueryString inclui apenas filtros preenchidos', () => {
  const queryString = buildFilterQueryString({
    data_inicio: '2026-03-01',
    data_fim: '',
    situacao: 'PENDENTE',
  });

  assert.equal(queryString, 'data_inicio=2026-03-01&situacao=PENDENTE');
});
