const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/connection");
const session = require("express-session"); //NOVONOVO

const CategoriesController = require("./categories/CategoriesController");
const ArticlesController = require("./articles/ArticlesController");
const UsersController = require("./users/UsersController"); //NOVONOVO

const Article = require("./articles/Article");
const Category = require("./categories/Category");
const User = require("./users/User"); //NOVONOVO

//View Engine
app.set("view engine", "ejs");

//Sessions
app.use(session({ //NOVONOVO
    secret: "$S\K1HR3Zq7[w$Y£{\)vnLEQw6t#8+@p^nv*VBOj?p6W(g*13;",
    resave: false, // Evita regravar a sessão se nada foi alterado
    saveUninitialized: false, // Evita criar sessões para visitantes que não fizeram login
    cookie: { maxAge: 3000000 }
}));

//Static Itens
app.use(express.static("public"));

//BodyParser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Database
connection
    .authenticate()
    .then(() => {
        console.log("Conexão feita com sucesso!");
    }).catch((error) => {
        console.log(error)
});

app.use("/", CategoriesController);
app.use("/", ArticlesController);
app.use("/", UsersController); //NOVONOVO

app.get("/blog", (req,res) => {
    Article.findAll({
        order: [['id', 'DESC']],
        include: [{model: Category}],
        limit: 6
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render("blog", {articles: articles, categories: categories})
        });
    });
});

app.get("/blog/:slug", (req,res) => {
    var slug = req.params.slug;
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if(article != undefined) {
            res.render("article", {article: article});
        } else {
            res.redirect("/");
        }
    }).catch(error => {
        res.redirect("/");
    });
});

app.get("/blog/categoria/:slug", (req,res) => {
    var slug = req.params.slug;
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{model: Article}],
    }).then(category => {
        if(category != undefined) {
            Category.findAll().then(categories => {
                res.render("blog", {articles: category.articles, categories: categories});
            });
        }else {
            res.redirect("/");
        }
    }).catch(error =>{
        res.redirect("/");
    });
});

//Servidor
app.listen(6060, () => {
    console.log("O servidor está funcionando!")
});