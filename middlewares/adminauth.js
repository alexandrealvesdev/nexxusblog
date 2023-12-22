function adminAuth(req,res,next){
    if(req.session.user != undefined){
        next(); //Esse next é usado em middlewares para dar continuidade a requisição, então use sempre no final da req
    }else{
        res.redirect("/blog");
    }
};

module.exports = adminAuth;