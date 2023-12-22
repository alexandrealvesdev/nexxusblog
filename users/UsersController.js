const express = require("express");
const app = express();
const User = require("./User");
const bcrypt = require("bcryptjs");
const adminAuth = require("../middlewares/adminauth"); //NOVONOVO

app.get("/admin/users",adminAuth,(req,res) => {
    User.findAll().then(users => {
        res.render("admin/users/list",{users: users})
    });
});

app.get("/admin/users/create",adminAuth,(req,res) => {
    res.render("admin/users/create");
});

app.post("/users/create",(req,res) => {
    var email = req.body.email;
    var password = req.body.password;

    User.findOne({where:{email: email}}).then(user => {
        if(user == undefined){
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
        
            User.create({
                email: email,
                password: hash
            }).then(() => {
                res.redirect("/blog")
            }).catch(err => {
                console.log(err);
            })
        }else{
            res.redirect("/admin/users/create");
        }
    })

});

app.get("/login",(req,res) => {
    res.render("admin/users/login");
});

app.post("/authenticate",(req,res) => {
    var email = req.body.email;
    var password = req.body.password;

    User.findOne({where:{email: email}}).then(user => {
        if(user != undefined){
            var correct = bcrypt.compareSync(password, user.password); //Compara a senha inserida com a que está guardada no banco

            if(correct){ //Se estiver correta
                req.session.user = { //Todo usuário que tiver essa sessão consegue logar com sucesso
                    id: user.id,
                    email: user.email
                }
                res.redirect("/admin/articles");
            }else{
                res.redirect("/login");
            }
        }else{
            res.redirect("/login");
        }
    })
});

app.get("/logout", (req, res) => {
    req.session.user = undefined;
    res.redirect("/blog");
});



module.exports = app;