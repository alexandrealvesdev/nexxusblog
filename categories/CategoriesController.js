const express = require("express");
const app = express();
const Category = require("./Category");
const slugify = require("slugify");
const adminAuth = require("../middlewares/adminauth");

app.get("/admin/categories",adminAuth, (req, res) => {
    Category.findAll({order: [['id', 'DESC']]}).then(categories => {
        res.render("admin/categories/list.ejs", { categories: categories });
    });
});

app.get("/admin/categories/new",adminAuth, (req, res) => {
    res.render("admin/categories/new.ejs");
});

app.post("/categories/save",adminAuth, (req, res) => {
    var title = req.body.title;
    if (title != undefined) {
        Category.create({
            title: title,
            slug: slugify(title, { lower: true })
        }).then(() => {
            res.redirect("/admin/categories")
        })
    } else {
        res.redirect("/admin/categories/new");
    }
});

app.post("/categories/delete",adminAuth, (req, res) => {
    var id = req.body.id;
    if (id != undefined) {
        if (!isNaN(id)) {
            Category.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect("/admin/categories");
            });
        } else {
            res.redirect("/admin/categories");
        }
    }
});

app.get("/admin/categories/edit/:id",adminAuth, (req,res) => {
    var id = req.params.id;
    if(isNaN(id)) {
        res.redirect("/admin/categories");
    }
    Category.findByPk(id).then(category => {
        if(category != undefined) {
            res.render("admin/categories/edit", {category: category});
        } else {
            res.redirect("/admin/categories");
        }
    }).catch(error => {
        res.redirect("/admin/categories")
    })
});

app.post("/categories/update",adminAuth, (req,res) => {
    var id = req.body.id;
    var title = req.body.title;
    Category.update({title: title, slug: slugify(title, {lower: true})}, {
        where: {
            id: id
        }
    }).then(() => {
        res.redirect("/admin/categories");
    })
});

module.exports = app;