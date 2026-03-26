INSERT INTO usuario (nome, login, senha, situacao)
VALUES ('Administrador', 'admin', '123456', 'ATIVO');

INSERT INTO lancamento (descricao, data_lancamento, valor, tipo_lancamento, situacao) VALUES
('Salario mensal', '2026-03-05', 4500.00, 'RECEITA', 'PAGO'),
('Freelance site institucional', '2026-03-07', 1200.00, 'RECEITA', 'PAGO'),
('Aluguel', '2026-03-10', 1500.00, 'DESPESA', 'PAGO'),
('Conta de energia', '2026-03-11', 220.45, 'DESPESA', 'PAGO'),
('Internet', '2026-03-12', 99.90, 'DESPESA', 'PAGO'),
('Supermercado', '2026-03-13', 385.70, 'DESPESA', 'PAGO'),
('Academia', '2026-03-14', 89.90, 'DESPESA', 'PAGO'),
('Consulta medica', '2026-03-16', 250.00, 'DESPESA', 'PENDENTE'),
('Venda de notebook usado', '2026-03-18', 1800.00, 'RECEITA', 'RECEBIDO'),
('Parcela do curso', '2026-03-20', 320.00, 'DESPESA', 'PENDENTE');
