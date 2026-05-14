INSERT INTO usuario (nome, login, senha, situacao)
VALUES ('Administrador', 'admin', '123456', 'ATIVO')
ON CONFLICT (login) DO UPDATE
SET
  nome = EXCLUDED.nome,
  senha = EXCLUDED.senha,
  situacao = EXCLUDED.situacao;

INSERT INTO lancamento (descricao, data_lancamento, valor, tipo_lancamento, situacao)
SELECT item.descricao, item.data_lancamento::DATE, item.valor, item.tipo_lancamento, item.situacao
FROM (
  VALUES
    ('Salario mensal', '2026-03-05', 4500.00, 'RECEITA', 'PAGO'),
    ('Freelance site institucional', '2026-03-07', 1200.00, 'RECEITA', 'PAGO'),
    ('Aluguel', '2026-03-10', 1500.00, 'DESPESA', 'PAGO'),
    ('Conta de energia', '2026-03-11', 220.45, 'DESPESA', 'PAGO'),
    ('Internet', '2026-03-12', 99.90, 'DESPESA', 'PAGO'),
    ('Supermercado', '2026-03-13', 385.70, 'DESPESA', 'PAGO'),
    ('Academia', '2026-03-14', 89.90, 'DESPESA', 'PAGO'),
    ('Consulta medica', '2026-03-16', 250.00, 'DESPESA', 'PENDENTE'),
    ('Venda de notebook usado', '2026-03-18', 1800.00, 'RECEITA', 'RECEBIDO'),
    ('Parcela do curso', '2026-03-20', 320.00, 'DESPESA', 'PENDENTE')
) AS item(descricao, data_lancamento, valor, tipo_lancamento, situacao)
WHERE NOT EXISTS (
  SELECT 1
  FROM lancamento atual
  WHERE atual.descricao = item.descricao
    AND atual.data_lancamento = item.data_lancamento::DATE
    AND atual.valor = item.valor
    AND atual.tipo_lancamento = item.tipo_lancamento
);
