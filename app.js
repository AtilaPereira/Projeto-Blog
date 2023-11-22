import express from "express";
import expressHandlebars from "express-handlebars";
import bodyParser from "body-parser";
import path, { dirname } from 'path'
import { fileURLToPath } from "url";
import { router } from "./routes/adm.js";//Importo as rotas do adm do arquivo de rotas
import mongoose from "mongoose";
import session from "express-session";
import flash from 'connect-flash'
import moment from "moment/moment.js";
import { postagem } from "./models/Postagem.js";
import { categoria } from "./models/Categoria.js";
import { routerUsuario } from "./routes/user.js";
import dotenv from "dotenv"
import passport from "passport";
import passportFunc from "./config/passport.js";
passportFunc(passport)//Faço isso pq o parâmetro da minha func passport é o passport


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const user = routerUsuario;
const adm = router; //Atribuo as rotas que importei a uma variável com o mesmo nome do arquivo de onde elas vieram

//Config
//Sessão
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: false

    //          resave: Força o salvamento da sessão no registro de sessões, mesmo se a sessão não foi modificada durante a requisição. 
    //          Pode criar problemas quando são feitas duas requisições em paralelo pelo cliente, 
    //          pois uma requisição pode sobrescrever-se à outra ao fim da requisição, mesmo que não forem feitas mudanças significativas.
    //          saveUnitialized: Força o salvamento de uma sessão não inicializada no registro de sessões. 
    //          Uma sessão é dita não inicializada quando ela é nova, porém não é modificada. 
    //          A documentação ainda diz que "false" é indicado para logins.

}))
//É importante que o passport seja configurado abaixo da sessão e acima do flash
app.use(passport.initialize())
app.use(passport.session())
//Flash -- DEVE SER CONFIGURADO ABAIXO DA SESSÃO
app.use(flash())
//Middleware
app.use((req, res, next) => {
    //O 'locals' serve para criar variáveis globais, que podem ser acessadas de qualquer parte do meu programa
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')

    //Essa variável 'user' vai armazenar os dados do usuário autenticado, esse req.user é uma coisa que o passport
    //cria automaticamente que armazena dados do usuário logado, e o null é porque caso não exista nenhum usuário logado
    //o que vai ser passado pra essa variável vai ser o valor null
    res.locals.user = req.user || null;

    next()
})
//Body Parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//Handlebars
app.engine('handlebars', expressHandlebars.engine({
    defaultLayout: 'main',
    helpers: {
        //Aqui faço uma config para formatação de datas
        formatDate: (date) => {
            return moment(date).format('DD/MM/YYYY HH:mm')
        }
    }
}));
app.set('view engine', 'handlebars');
//Mongoose
mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Conectado ao mongo')
    })
    .catch((err) => {
        console.log('Erro ao conectar: ' + err)
    })
// Public
app.use(express.static(path.join(__dirname, 'node_modules')))

//Rotas
app.get('/', (req, res) => {


    postagem.find().populate('categoria').sort({ date: "desc" }).lean()
        .then((postagem) => {
            res.render('user/index', { postagem: postagem })
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/404')
        })

})

app.get('/postagem/:id', (req, res) => {
    postagem.findOne({ _id: req.params.id }).sort({ date: "desc" }).lean().then((postagem) => {
        if (postagem) {
            res.render('postagem/index', { postagem: postagem })
        } else {
            req.flash('error_msg', 'Esta postagem não existe')
            res.redirect('/')
        }
    })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
})

app.get('/categorias', (req, res) => {
   
    categoria.find().sort({ date: "desc" }).lean()
        .then((categorias) => {

            

            res.render('categoria/index', {
                categorias: categorias,
           
                
            })
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao listar as categorias')
            res.redirect('/')
        })
})

app.get('/categorias/:id', (req, res) => {
    categoria.findOne({ _id: req.params.id }).lean()
        .then((categoria) => {
            if (categoria) {//Se achou a categoria

                postagem.find({ categoria: categoria }).lean().then((postagem) => {
                    res.render('categoria/postagens', {
                        categoria: categoria,
                        postagem: postagem
                    })

                })
                    .catch((err) => {
                        req.flash('error_msg', 'Houve um erro ao listar os posts!')
                        res.redirect('/')
                    })

            } else {
                req.flash('error_msg', 'Esta categoria não existe')
                res.redirect('/')
            }

        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria')
            res.redirect('/')
        })
})

app.get('/404', (req, res) => {
    res.send('Erro 404!')
})

app.use('/usuario', user)
app.use('/admin', adm)//Quando eu crio um grupo de rotas eu passo um prefixo pra essas rotas, que nesse caso é '/admin'

//Outros

//Nesse caso eu estou usando uma porta local, porém no servidor vai ser uma porta que ele vai decidir, por padrão todo 
//servidor tem no process.env uma variável chamada PORT, importante notar que EU não criei essa variável PORT no meu .env
//eu coloquei aqui dessa forma por que em qualquer servidor já vai ter essa variável PORT em que ele vai definir uma porta.
//Então com isso eu quero dizer que a minha variável port é uma porta que em qualquer servidor que eu colocar ela pra rodar
//ela vai pegar a porta padrão desse servidor e vai adicionar nessa varável e vai rodar o meu projeto sem problemas 
// E o operador || significa que se não tiver nada em process.env.PORT ele vai colocar na porta 8081, caso tenha algo 
//ele vai priorizar pegar o que está no process.env
const PORT = process.env.PORT || 8081
app.listen(PORT, () => {
    console.log('Servidor rodando! ')
})