import express from "express";
import { usuario } from './../models/Usuario.js';
import   bcrypt  from 'bcrypt';
import  Jwt  from "jsonwebtoken";
import session from "express-session";
import passport from "passport";



export const routerUsuario = express.Router();

//O JWT-Json Web Token serve para guardar a sessão do usuário, e principalmente fazer com que o nosso sistema/frontend/cliente saiba 
//qual é o usuário que esta nessa sessão, porém eu não posso expor os dados do meu usuário então eu utilizo o JWT pra isso, aqui ele estará
//sendo usado de forma básica, mas ele pode ir bem mais fundo do que isso.

//A primeira coisa que o .sing() pede é o payload, que é qual dado do usuário eu quero criptografar e adicionar dentro dessa 
//chave Json, que nesse caso vai ser o Id do usuário, e esse Id eu vou receber quando eu chamar o 'gerarToken'.

//A segunda coisa é a secretOrPrivateKey, essa chave secreta pode ser qualquer coisa, só que essa chave secreta vai ser responsável
//por decodificar esse Json, esse JWT, então não pode ser apenas uma string qualquer, então pra criar essa secret eu posso utilizar
//'criptografia' MD5, porém é importante ter em mente que esse tipo de 'criptografia' é reversível então eu não posso deixar diretamente
//aqui dentro da minha função para que todos vejam, por isso irei armazenar em uma variável global 

//O ultimo item que ele pede são algumas configurações que eu posso colocar na hora de criar esse jwt, e eu vou colocar
//apenas uma opção que é o tempo de expiração, que é em quanto tempo esse jwt vai parar de ser valido e eu vou precisar 
//criar um novo a partir dessas mesmas informações 
const gerarToken = (id) => Jwt.sign({id: id}, process.env.SECRET_JWT, {expiresIn: 86400})//Essa quantidade de segundos é equivalente a 24hrs




routerUsuario.get('/registro', (req, res) => {
    res.render('user/registro')
})
//Bom notar que apesar das rotas serem iguais, os métodos são diferentes
//um é get e o outro é post, então não tem problema ser igual 
routerUsuario.post('/registro', (req, res) => {
    let erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: 'Nome inválido' })
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: 'E-mail inválido' })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: 'Nome inválido' })
    } else if (req.body.senha.length <= 4) {
        erros.push({ texto: 'Senha muito curta' })
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: 'As senhas são diferentes. tente novamente!' })
    }

    if (erros.length > 0) {
        res.render('user/registro', { erros: erros })
    } else {
        //Aqui verifico se o email que esta sendo cadastrado já existe no bd
        usuario.findOne({ email: req.body.email }).lean()
            .then((email) => {
                if (email) {//"Caso tenha vindo algum email"

                    req.flash('error_msg', 'Email já cadastrado!')
                    res.redirect('/usuario/registro')

                    //As duas formas funcionam

                    // erros.push({ texto: 'Email já cadastrado' })
                    // res.render('user/registro', { erros: erros })

                } else {//Caso não tenha nenhum email igual no bd

                    const novoUsuario = {
                        nome: req.body.nome,
                        email: req.body.email,
                        senha: req.body.senha                  
                    }

                    new usuario(novoUsuario).save()
                        .then(() => {
                            req.flash('success_msg', 'Cadastro efetuado com sucesso!')//Atribuo uma mensagem de sucesso a minha variável global 'success_msg'
                            res.redirect('/')
                        })
                        .catch((err) => {
                            req.flash('error_msg', 'Erro ao efetuar cadastro!: ' + err)//Atribuo uma mensagem de erro a minha variável global 'error_msg'
                            res.redirect('/')
                        })

                }
            })
            .catch((err) => {
                req.flash('error_msg', 'Erro ao efetuar cadastro!: ' + err)
                res.redirect('/')
            })


    }

})

routerUsuario.get('/login', (req, res) => {
    res.render('user/login')
})

routerUsuario.post('/login', (req, res) => {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuario/login',
        failureFlash: true
    })(req,res)



//Forma utilizando o JWT - Não continuei com esta forma pois não estava servindo para o que eu queria no momento
    //Aqui eu estou desestruturando o objeto body e pegando os dados que quero e armazenando em variáveis diretamente
    //É importante que as variáveis tenham os mesmos nomes dos campos que eu quero pegar 

    // const {email, senha} = req.body; 

    // //Uso o .select('+senha') porque no model de usuário o campo de senha está com o select: false, ou seja, quando eu puxo o usuário
    // //aqui com o findOne, o campo de senha não vem junto e isso iria ocasionar em um erro ao comparar as senhas, já que ao usar o 
    // //'usuario.senha' eu não teria nenhum valor armazenado dentro disso

    // usuario.findOne({email: email}).select('+senha').lean()
    // .then((usuario) => {

    //     if(!usuario){
    //         req.flash('error_msg', 'Credenciais incorretas!')
    //         res.redirect('/usuario/login')
    //     }else{

    //         //Aqui eu comparo a senha que o usuário digitou com a senha que está no bd
    //         //Utilizo o .compareSync para fazer essa comparação de forma síncrona, mas caso eu quisesse fazer isso de forma
    //         // assíncrona eu utilizaria só o .compare, que por sua vez iria me retornar uma promise
    //         const senhaValida = bcrypt.compareSync(senha, usuario.senha)
            
            
    //         if(!senhaValida){
    //             req.flash('error_msg', 'Credenciais incorretas!')
    //             res.redirect('/usuario/login')
                
    //         }else{         
    //              const token = gerarToken(usuario._id)
    //              //Na hora de mandar o token é bom que eu coloque ele dentro de um objeto, assim {token},
    //              //para que fique mais fácil a manipulação dele
                 
                         
    //              req.session.authToken = {token}
    //              req.session.isLogged = true
                
                 
    //              res.redirect('/')
    //         }

    //     }

    // })
})

routerUsuario.get('/logout', (req, res) => {
    
    //Automaticamente o passport ele vai fazer o logout por mim
    req.logout((err) => {
        if(err){
            req.flash('error_msg', 'Erro no Logout!: ' + err)
        }
    })
    req.flash('success_msg', 'Até mais!')
    res.redirect('/')
})