const Sequelize = require("sequelize");
const connection = require("../database/connection");
const Category = require("../categories/Category");

const Article = connection.define("articles", {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },slug: {
        type: Sequelize.STRING,
        allowNull: false
    },body: {
        type:Sequelize.TEXT,
        allowNull: false
    },image: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

Category.hasMany(Article);
Article.belongsTo(Category);

//Article.sync({force: true});

module.exports = Article;