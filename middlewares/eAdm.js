export const eAdm = (req, res, next) => {


    //Essa função é gerada pelo passport que serve para verificar se o usuário esta 
    //autenticado ou não
    if(req.isAuthenticated() && req.user.eAdm){
        return next()
    }

    req.flash('error_msg', "Ação não autorizada!")
    res.redirect('/')
}