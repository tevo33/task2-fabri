# Roteiro de registro e validacao de mudancas

Este roteiro serve para demonstrar o ciclo pedido na tarefa final: registrar mudanca, implementar, versionar, integrar, homologar e promover para producao.

## Mudanca 1: ajuste visual simples

Registro sugerido:

- Tipo: mudanca visual
- Descricao: alterar o texto do subtitulo da tela de login
- Arquivo esperado: `views/login.ejs`
- Exemplo de alteracao: trocar `Use o usuario cadastrado para acessar a aplicacao.` por `Acesse o ambiente financeiro da Task 2.`

Fluxo:

```bash
git checkout -b mudanca-visual-login
npm run ci
git add .
git commit -m "Ajusta texto da tela de login"
git push origin mudanca-visual-login
```

Depois do CI aprovado:

```bash
./scripts/deploy.sh homolog
./scripts/deploy.sh prod
```

## Mudanca 2: warning de qualidade de codigo

Registro sugerido:

- Tipo: validacao de Quality Code
- Descricao: inserir temporariamente um `console.log` para demonstrar warning do ESLint
- Arquivo sugerido: `src/server.js`
- Regra acionada: `no-console`

Exemplo temporario:

```js
console.log('Validacao de warning do Quality Code');
```

Comando para demonstrar:

```bash
npm run quality
```

Resultado esperado: o ESLint exibe warning de `no-console`. Remova a linha temporaria antes de promover para producao.

## Fluxo final de apresentacao

1. Mostrar o registro da mudanca neste arquivo ou no commit.
2. Fazer a alteracao no codigo.
3. Rodar `npm run ci` localmente.
4. Versionar com Git e enviar para GitHub.
5. Mostrar o GitHub Actions rodando testes, estatisticas e qualidade.
6. Na VM, rodar `./scripts/deploy.sh homolog`.
7. Acessar `http://177.44.248.58:3000/homolog`.
8. Conferir login `admin` / `123456` e dados do banco.
9. Na VM, rodar `./scripts/deploy.sh prod`.
10. Acessar `http://177.44.248.58:3000/prod`.
