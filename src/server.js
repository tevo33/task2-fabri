require('dotenv').config();

const pool = require('./db');
const { createApp } = require('./app');
const port = Number(process.env.PORT || 3000);
const app = createApp({ pool });

app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});
