const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  pgHost: process.env.PG_HOST,
  pgPort: process.env.PG_PORT,
  pgUser: process.env.PG_USER,
  pgUser: process.env.PG_USER,
  pgPass: process.env.PG_PASS,
  pgDatabase: process.env.PG_DATABASE,
};