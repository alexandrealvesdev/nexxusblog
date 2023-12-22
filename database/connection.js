const Sequelize = require("sequelize");

const connection = new Sequelize('Nexxus', 'root', 'sqlpro99', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
    timezone: "-03:00"
});

module.exports = connection;