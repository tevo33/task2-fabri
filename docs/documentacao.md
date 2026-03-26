# Documentacao - Task 2

## 1. Aplicacao

### Tecnologias utilizadas

- Node.js
- Express
- PostgreSQL
- EJS

### Numero de classes da aplicacao

- 0 classes
- Estrutura baseada em modulos simples para manter o projeto enxuto

### Modelagem do banco de dados

#### Tabela `usuario`

| Campo | Tipo | Observacao |
| --- | --- | --- |
| id | SERIAL | Chave primaria |
| nome | VARCHAR(120) | Obrigatorio |
| login | VARCHAR(80) | Obrigatorio e unico |
| senha | VARCHAR(120) | Obrigatorio |
| situacao | VARCHAR(20) | Obrigatorio |

#### Tabela `lancamento`

| Campo | Tipo | Observacao |
| --- | --- | --- |
| id | SERIAL | Chave primaria |
| descricao | VARCHAR(150) | Obrigatorio |
| data_lancamento | DATE | Obrigatorio |
| valor | NUMERIC(10,2) | Obrigatorio |
| tipo_lancamento | VARCHAR(20) | Obrigatorio |
| situacao | VARCHAR(20) | Obrigatorio |

### Interface desenvolvida

- Tela web unica para listagem dos lancamentos cadastrados
- Exibicao de descricao, data, valor, tipo e situacao
- Layout simples e funcional

## 2. Publicacao

### Como acessar a VM

```bash
ssh univates@177.44.248.58
```

Senha utilizada: `uni415`

### Instalacao de cada ferramenta

Ambiente encontrado na VM:

1. Sistema operacional: Ubuntu 24.04.4 LTS
2. Node.js ja instalado: `v18.20.8`
3. npm ja instalado: `10.8.2`
4. PostgreSQL ja instalado e ativo: `16.13`
5. Dependencias do projeto instaladas com `npm install --omit=dev`
6. Porta liberada no firewall: `3000/tcp`

Comandos utilizados:

```bash
cd /home/univates/task2-fabri
npm install --omit=dev
sudo -u postgres createdb -O financeiro_app financeiro_db
PGPASSWORD='financeiro123' psql -h 127.0.0.1 -U financeiro_app -d financeiro_db -f sql/schema.sql
PGPASSWORD='financeiro123' psql -h 127.0.0.1 -U financeiro_app -d financeiro_db -f sql/seed.sql
sudo ufw allow 3000/tcp
```

### Implantacao da aplicacao

Passo a passo realizado:

1. Arquivos enviados para `/home/univates/task2-fabri`
2. Arquivo `.env` criado com acesso ao banco PostgreSQL da propria VM
3. Banco `financeiro_db` criado
4. Usuario do banco `financeiro_app` criado
5. Script `sql/schema.sql` executado
6. Script `sql/seed.sql` executado
7. Servico `systemd` criado com nome `task2-fabri.service`
8. Aplicacao publicada na porta `3000`

Servico criado:

```ini
/etc/systemd/system/task2-fabri.service
```

Comandos principais:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now task2-fabri.service
sudo systemctl restart task2-fabri.service
sudo systemctl status task2-fabri.service
```

### URL de acesso

- Aplicacao: `http://177.44.248.58:3000/`
- Credenciais cadastradas no banco: login `admin` / senha `123456`

## 3. Tempos

- Desenvolvimento da aplicacao: preencher
- Criacao do ambiente na VM: preencher
- Publicacao da aplicacao: preencher

## 4. Entrega

- PDF da documentacao
- Link da aplicacao publicada
- Credenciais de acesso
- Link do repositorio GitHub
