import express from "express";
import { categoria } from "../models/Categoria.js";
import { postagem } from "../models/Postagem.js";
import { eAdm } from "../middlewares/eAdm.js";

export const router = express.Router()//Tenho que usar isso pra criar rotas em arquivos separados

//Quando eu uso 'res.render()' eu não devo colocar '/' no início da  url
//Mas quando eu uso 'res.redirect()' eu devo colocar '/' no início da url

router.get('/categorias' , eAdm , (req, res) => {
    
    //{date: 'desc'} dentro do sort serve para ordenar as postagens da mais recente para a mais antiga.

    //O método 'lean()' deve ser usado ao trazer dados do bd por que o que acontece é que as consultas do Mongoose
    //retornam um Mongoose Document e eles são muito pesados para o JS. O método .lean() resolve esse problema retornando um objeto simples, um JSON.
    
    categoria.find().sort({date: 'desc'}).lean().then((categorias) => { 
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias: " + err)
        res.redirect("/admin")
    })
    
})

router.get('/categorias/add', eAdm , (req, res) => {
   
    res.render('admin/addcategorias')
})

router.post('/categorias/nova' ,eAdm, (req, res) => {

     


    //Sistema de validação - obs: existem bibliotecas que fazem validação, esta é apenas uma forma manual
        let erros = [];
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ){
            erros.push({texto: 'Nome inválido'})

        }else if(req.body.nome.length <= 2){
            erros.push({texto: 'Nome da categoria é muito pequeno'})
        }

        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null ){      
           erros.push({texto: 'slug inválido'})
        }
    
    //Caso haja erros eu irei mostrar, caso não haja então eu posso armazenar os dados no BD
    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
          const novaCategoria = {
          nome: req.body.nome,
          slug: req.body.slug
    }

          new categoria(novaCategoria).save()
          .then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!')//Atribuo uma mensagem de sucesso a minha variável global 'success_msg'
            res.redirect('/admin/categorias')
          })
          .catch((err) => {
            req.flash('error_msg', 'Erro ao salvar a categoria!: ' + err)//Atribuo uma mensagem de erro a minha variável global 'error_msg'
            res.redirect('/admin/categorias')
          })
    }


  
})

router.get('/categorias/edit/:id',eAdm, (req, res) => {
    //Aqui eu pego o registro que tenha o id igual ao que for passado na url
    categoria.findOne({_id:req.params.id}).lean()
    .then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    })
    .catch((err) => {
        req.flash('error_msg', 'Esta categoria não existe')
        res.redirect('/admin/categorias')
    })
    
})

router.post('/categorias/edit',eAdm, (req, res) => {

    let erros = [];
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null ){
        erros.push({texto: 'Nome inválido'})

    }else if(req.body.nome.length <= 2){
        erros.push({texto: 'Nome da categoria é muito pequeno'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null ){      
       erros.push({texto: 'slug inválido'})
    }


    if(erros.length > 0){
        res.render('admin/editcategorias', {erros: erros})
    }else{

        categoria.findOne({_id: req.body.id})
        .then((categoria) => {
        
        categoria.nome = req.body.nome  //Estou dizendo que o campo 'nome' lá no bd vai receber o valor de 'req.body.nome'
        categoria.slug = req.body.slug

        //Aqui eu não devo usar o método '.lean()' .Quando eu trago os dados do bd esses dados vem no formato 
        //Mongoose Document e eles são muito pesados para o JS. O método '.lean()' resolve esse problema retornando um objeto simples, um JSON.
        //Porém na hora de enviar ou atualizar dados no BD eu preciso que esses dados estejam no formato 'Mongoose Document' que é o formato
        //que o BD aceita e o que vai fazer essa conversão é a função '.save()', ou seja, se eu usar o '.lean()' eu estarei tentando mandar os
        //dados para o bd no formato errado, o que vai me ocasionar um erro.
        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria editada com sucesso!')
            res.redirect('/admin/categorias')
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria: ' + err)
            res.redirect('/admin/categorias')
        })

    })

    .catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar a categoria: ' + err)
        res.redirect('/admin/categorias')
    })

    }
    
})

router.post('/categorias/deletar',eAdm, (req, res) => {
    
    categoria.deleteOne({_id: req.body.id})
    .then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso!')-
        res.redirect('/admin/categorias')

    })
    .catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a categoria: ' + err)
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens',eAdm, (req, res) => {
    //O populate trás informações do objeto que foi atribuído ao campo em que fiz relação com o outro documento
    //No populate eu uso o nome do campo ao qual eu fiz a relação com o outro documento, que nesse caso o nome do campo foi 'categoria'
    postagem.find().populate('categoria').sort({date: "desc"}).lean()
    .then((postagens) => {
         res.render('admin/postagens', {postagens: postagens})
    })
    .catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens: ' +err)
        res.redirect("/admin")
    })
})

router.get('/postagens/add', eAdm , (req, res) => {
    categoria.find().sort({_id: "desc"}).lean()
    .then((categorias) => {//Aqui eu irei carregar as categorias já existentes para o meu formulário
        res.render('admin/addpostagem', {categorias: categorias})
    })
    .catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário')
        res.redirect('/admin/postagens')
    })
    
})

router.post('/postagens/nova', eAdm, (req, res) => {
    let erros = [];

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: 'Título inválido'})
    }else if(req.body.titulo.length < 3){
        erros.push({texto: 'Título pequeno demais'})
    }

   if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'})
    }else if(req.body.slug.length < 3){
        erros.push({texto: 'Slug pequeno demais'})
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: 'Descrição inválido'})
    }else if(req.body.descricao.length < 5){
        erros.push({texto: 'Descrição pequeno demais'})
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: 'Conteudo inválido'})
    }else if(req.body.conteudo.length < 6){
        erros.push({texto: 'Conteudo pequeno demais'})
    }

    if(req.body.categoria == '0'){
        erros.push({texto: 'Categoria inválida, registre uma categoria'})
    }

    if(erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new postagem(novaPostagem).save()
        .then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        })
        .catch((err) => {
            req.flash('error_msg', 'Erro ao salvar a postagem!: ' + err)
            res.redirect('/admin/postagens')
        })

    }

})

router.get('/postagens/edit/:id',eAdm, (req, res) => {
    postagem.findOne({_id: req.params.id}).lean()
    .then((postagem) => {

        categoria.find().sort({_id: "desc"}).lean()
        .then((categorias) => {//Aqui eu irei carregar as categorias já existentes para o meu formulário
            res.render('admin/editpostagens', {
                postagem: postagem,
                categorias: categorias
            })
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar as categorias')
            res.redirect('/admin/postagens')
        })

        
    })
    .catch((err) => {
        req.flash('error_msg', 'Esta postagem não existe')
        res.redirect('/admin/postagens')
    })
   
})

router.post('/postagens/edit', eAdm , (req, res) => {
    let erros = [];

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: 'Título inválido'})
    }else if(req.body.titulo.length < 3){
        erros.push({texto: 'Título pequeno demais'})
    }

   if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'})
    }else if(req.body.slug.length < 3){
        erros.push({texto: 'Slug pequeno demais'})
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: 'Descrição inválido'})
    }else if(req.body.descricao.length < 5){
        erros.push({texto: 'Descrição pequeno demais'})
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: 'Conteudo inválido'})
    }else if(req.body.conteudo.length < 6){
        erros.push({texto: 'Conteudo pequeno demais'})
    }

    if(erros.length > 0){
        res.render('admin/editpostagens', {erros: erros})
    }else{

        postagem.findOne({_id: req.body.id})
        .then((postagem) => {

            postagem.titulo = req.body.titulo;
            postagem.slug = req.body.slug;
            postagem.descricao = req.body.descricao;
            postagem.conteudo = req.body.conteudo;
            postagem.categoria = req.body.categoria;

            postagem.save().then(() => {
                req.flash('success_msg', 'Postagem editada com sucesso!');
                res.redirect('/admin/postagens');
            })
            .catch((err) => {
                req.flash('error_msg', 'Houve um erro interno ao salvar a edição da postagem: '+err);
                res.redirect('/admin/postagens');
                
            })
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um erro ao editar a postagem: ' + err)
            res.redirect('/admin/postagens')
        })

    }
})

router.post('/postagens/deletar',eAdm, (req, res) => {
    postagem.deleteOne({_id: req.body.id})
    .then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso!');
        res.redirect('/admin/postagens')
    })
    .catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a postagem: '+err)
        res.redirect('/admin/postagens')
    })
})

