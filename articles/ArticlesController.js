const express = require("express");
const app = express();
const Category = require("../categories/Category");
const Article = require("./Article");
const slugify = require("slugify");
const upload = require('../database/multerConfig');
const fs = require('fs');
const path = require('path');
const adminAuth = require("../middlewares/adminauth");

app.get("/admin/articles",adminAuth, (req,res) => {
    Article.findAll({
        include: [{model: Category}],
        order: [['id', 'DESC']]
    }).then(articles => {
        res.render("admin/articles/list.ejs", {articles: articles});
    });
});

app.get("/admin/articles/new",adminAuth, (req,res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new.ejs", {categories: categories});
    })
});

app.post("/articles/save",adminAuth, upload.single('file'), (req, res) => {
    const title = req.body.title;
    const body = req.body.body;
    const category = req.body.category;
    const imageUrl = req.file ? req.file.filename : null;

    Article.create({
        title: title,
        slug: slugify(title, { lower: true }),
        body: body,
        categoryId: category,
        image: imageUrl
    }).then(() => {
        res.redirect("/admin/articles");
    }).catch((error) => {
        console.error(error);
        res.redirect("/");
    });
});


app.post("/articles/upload",adminAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo foi enviado.');
    }
    
    const imageUrl = req.file.filename;
    
    res.status(200).json({ imageUrl });
});

app.post("/articles/delete",adminAuth, (req, res) => {
    var id = req.body.id;
    if (id != undefined) {
        if (!isNaN(id)) {
            Article.findByPk(id).then((article) => {
                if (article) {
                    const imageNameToDelete = article.image;

                    Article.destroy({
                        where: {
                            id: id
                        }
                    }).then(() => {
                        res.redirect("/admin/articles");
                    });
                } else {
                    res.redirect("/admin/articles");
                }
            });
        } else {
            res.redirect("/admin/articles");
        }
    }
});


app.get("/admin/articles/edit/:id",adminAuth, (req,res) => {
    var id = req.params.id;

    if(isNaN(id)) {
        res.redirect("/admin/articles");
    }

    Article.findByPk(id).then(article => {
        if(article != undefined) {
            Category.findAll().then(categories => {
                res.render("admin/articles/edit", {article: article, categories: categories});
            });
        } else {
            res.redirect("/admin/articles");
        }
    }).catch(error => {
        res.redirect("/admin/articles");
    })
});

app.post("/articles/update",adminAuth, upload.single('file'), (req,res) => {
    var id = req.body.id;
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;

    if (req.file) {
        Article.findByPk(id).then(article => {
            if (article != undefined) {
                const previousImage = article.image;

                if (previousImage) {
                    const imagePathToDelete = path.join(uploadFolderPath, previousImage);
                    fs.unlink(imagePathToDelete, (err) => {
                        if (err) {
                            console.error('Erro ao excluir a imagem anterior:', err);
                        } else {
                            console.log('Imagem anterior excluída com sucesso.');
                        }
                    });
                }
            }
        });

        const imageUrl = req.file.filename;
        Article.update({
            title: title,
            body: body,
            categoryId: category,
            image: imageUrl
        }, {
            where: {
                id: id
            }
        }).then(() => {
            res.redirect("/admin/articles");
        }).catch(error => {
            console.error(error);
            res.redirect("/");
        });
    } else {
        Article.update({
            title: title,
            body: body,
            categoryId: category,
        }, {
            where: {
                id: id
            }
        }).then(() => {
            res.redirect("/admin/articles");
        }).catch(error => {
            console.error(error);
            res.redirect("/");
        });
    }
});

app.get("/blog/pagina/:num", (req,res) => {
    var pagina = req.params.num;
    var offset = 0;

    if(isNaN(pagina) || pagina == 1) {
        offset = 0;
    } else {
        offset = (parseInt(pagina) - 1) * 6;
    } 

    Article.findAndCountAll({
        limit: 6,
        offset: offset,
        order: [['id', 'DESC']],
        include: [{model: Category}],
    }).then(articles => {

        var next;
        if(offset + 6 >= articles.count) {
            next = false;
        } else {
            next = true
        }

        var result = {
            pagina: parseInt(pagina),
            next: next,
            articles: articles
        }

        Category.findAll().then(categories => {
            res.render("admin/articles/page", {result: result, categories: categories})
        });
    })
});

module.exports = app;