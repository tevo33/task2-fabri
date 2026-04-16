const PDFDocument = require('pdfkit');

function formatDate(value) {
  return new Date(value).toLocaleDateString('pt-BR');
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function buildFilterSummary(filters) {
  const parts = [];

  if (filters.data_inicio) {
    parts.push(`Data inicial: ${filters.data_inicio}`);
  }

  if (filters.data_fim) {
    parts.push(`Data final: ${filters.data_fim}`);
  }

  if (filters.situacao) {
    parts.push(`Situacao: ${filters.situacao}`);
  }

  return parts.length > 0 ? parts.join(' | ') : 'Sem filtros aplicados';
}

function generateLancamentosPdf({ lancamentos, filters }) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const filterSummary = buildFilterSummary(filters);
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
      compress: false,
    });

    doc.info.Title = 'Relatorio de lancamentos';
    doc.info.Subject = `Filtros: ${filterSummary}`;

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('Relatorio de lancamentos');
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
    doc.text(`Filtros: ${filterSummary}`);
    doc.moveDown();

    if (lancamentos.length === 0) {
      doc.fontSize(12).text('Nenhum lancamento encontrado.');
      doc.end();
      return;
    }

    lancamentos.forEach((lancamento, index) => {
      doc
        .fontSize(12)
        .text(`${index + 1}. ${lancamento.descricao}`)
        .fontSize(10)
        .text(`Data: ${formatDate(lancamento.data_lancamento)}`)
        .text(`Valor: ${formatCurrency(lancamento.valor)}`)
        .text(`Tipo: ${lancamento.tipo_lancamento}`)
        .text(`Situacao: ${lancamento.situacao}`);

      if (index < lancamentos.length - 1) {
        doc.moveDown();
      }
    });

    doc.end();
  });
}

module.exports = {
  generateLancamentosPdf,
};
