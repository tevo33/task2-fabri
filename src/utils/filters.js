const VALID_STATUS = ['PENDENTE', 'PAGO', 'RECEBIDO'];

function isValidDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeFilters(source = {}) {
  const situacao = VALID_STATUS.includes(source.situacao) ? source.situacao : '';

  return {
    data_inicio: isValidDate(source.data_inicio) ? source.data_inicio : '',
    data_fim: isValidDate(source.data_fim) ? source.data_fim : '',
    situacao,
  };
}

function buildFilterClause(filters, options = {}) {
  const startIndex = options.startIndex || 1;
  const alias = options.alias ? `${options.alias}.` : '';
  const values = [];
  const clauses = [];
  let currentIndex = startIndex;

  if (filters.data_inicio) {
    clauses.push(`${alias}data_lancamento >= $${currentIndex}`);
    values.push(filters.data_inicio);
    currentIndex += 1;
  }

  if (filters.data_fim) {
    clauses.push(`${alias}data_lancamento <= $${currentIndex}`);
    values.push(filters.data_fim);
    currentIndex += 1;
  }

  if (filters.situacao) {
    clauses.push(`${alias}situacao = $${currentIndex}`);
    values.push(filters.situacao);
  }

  return {
    clause: clauses.length > 0 ? ` AND ${clauses.join(' AND ')}` : '',
    values,
  };
}

function buildFilterQueryString(filters) {
  const params = new URLSearchParams();

  if (filters.data_inicio) {
    params.set('data_inicio', filters.data_inicio);
  }

  if (filters.data_fim) {
    params.set('data_fim', filters.data_fim);
  }

  if (filters.situacao) {
    params.set('situacao', filters.situacao);
  }

  return params.toString();
}

module.exports = {
  VALID_STATUS,
  normalizeFilters,
  buildFilterClause,
  buildFilterQueryString,
};
