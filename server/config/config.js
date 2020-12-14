// Comentar para heroku
require('./mongoDBConexion');

// =====================================
// Puerto
// =====================================
process.env.PORT = process.env.PORT || 3000;

// =====================================
// Entorno
// =====================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// =====================================
// Vencimiento del Token
// =====================================
process.env.CADUCIDAD_TOKEN = '24h';

// =====================================
// SEED de autenticación
// =====================================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// =====================================
// Base de datos
// =====================================
if (process.env.NODE_ENV === 'dev') {
  // Descomentar para Desarrollo. Comentar para Heroku
  process.env.DB_URL = process.env.DB_Local_URL;
  // Descomentar para Heroku. Comentar para desarrollo
  //process.env.DB_URL = process.env.MONGO_URI;
} else {
  process.env.DB_URL = process.env.MONGO_URI;
}

// =====================================
// Google Client ID
// =====================================
process.env.CLIENT_ID =
  process.env.CLIENT_ID ||
  '430282003578-8mosggjs5ehn4qgs4ahji9c8p6k8e21a.apps.googleusercontent.com';
