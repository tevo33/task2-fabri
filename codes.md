# Comandos da apresentacao

## 1. Acessar a VM

Conecta na VM usando a chave SSH configurada.

```bash
ssh task2-vm
```

## 2. Mostrar Docker vazio

Comprova que nao existem containers, imagens ou volumes preparados.

```bash
docker ps -a
docker images
docker volume ls
```

## 3. Instalar ambiente e projeto

Instala Git, Docker, Docker Compose e clona o repositorio.

```bash
curl -fsSL https://raw.githubusercontent.com/tevo33/task2-fabri/main/scripts/bootstrap.sh | sh
cd ~/task2-fabri
```

## 4. Criar Homologacao

Constroi a aplicacao, cria o banco e aplica as migrations em HML.

```bash
./scripts/deploy.sh homolog
docker compose ps
```

## 5. Criar Producao

Constroi a aplicacao, cria o banco e aplica as migrations em PROD.

```bash
./scripts/deploy.sh prod
docker compose ps
```

## 6. Conferir banco antes da mudanca

Mostra tabelas e quantidade de dados preservados em cada ambiente.

```bash
docker compose exec db-homolog psql -U task2 -d financeiro_homolog -c "\dt"
docker compose exec db-homolog psql -U task2 -d financeiro_homolog -c "SELECT COUNT(*) FROM lancamento;"
docker compose exec db-prod psql -U task2 -d financeiro_prod -c "\dt"
docker compose exec db-prod psql -U task2 -d financeiro_prod -c "SELECT COUNT(*) FROM lancamento;"
```

## 7. Criar branch da mudanca

Atualiza a `main` e cria uma branch para o label e a migration solicitados.

```bash
exit
git checkout main
git pull
git checkout -b mudanca-label-tabela
```

## 8. Demonstrar erro de qualidade

Este codigo compila, mas a regra `no-var` gera erro no ESLint.

```js
var exemploQuality = 'teste';
assert.equal(exemploQuality, 'teste');
```

```bash
npm run quality
```

## 9. Validar a mudanca correta

Remova o exemplo anterior e execute os 20 testes e a analise de qualidade.

```bash
npm run ci
```

## 10. Versionar e enviar

O push dispara CI, criacao do Pull Request e merge automatico quando nao ha conflitos.

```bash
git add views sql/migrations
git commit -m "Altera label e adiciona tabela solicitada"
git push -u origin mudanca-label-tabela
```

## 11. Atualizar Homologacao

Baixa a `main` mesclada, aplica apenas a nova migration e atualiza HML.

```bash
cd ~/task2-fabri
./scripts/deploy.sh homolog
docker compose exec db-homolog psql -U task2 -d financeiro_homolog -c "\dt"
docker compose exec db-homolog psql -U task2 -d financeiro_homolog -c "SELECT COUNT(*) FROM lancamento;"
```

## 12. Atualizar Producao

Promove o mesmo commit validado em HML e confirma banco e dados em PROD.

```bash
./scripts/deploy.sh prod
docker compose exec db-prod psql -U task2 -d financeiro_prod -c "\dt"
docker compose exec db-prod psql -U task2 -d financeiro_prod -c "SELECT COUNT(*) FROM lancamento;"
```
