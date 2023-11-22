import mongoose from "mongoose";
import { Schema } from "mongoose";

const Postagem = new Schema({
    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    //Aqui eu vou atribuir o valor da categoria a uma categoria que já existe, 
    //fazendo um relacionamento entre documentos
    categoria: {     
        type: Schema.Types.ObjectId, //Isso quer dizer que a categoria vai armazenar o id de algum objeto, basicamente esse campo vai armazenar o id de uma categoria
        //Quando eu crio um objeto desse tipo eu preciso criar uma referencia, ou seja, qual tipo do objeto
        //No caso o tipo de referencia vai ser para o tipo de objeto 'categorias', então aqui na referencia eu 
        //irei passar o nome que eu dei para o meu model de categorias, que foi 'categorias'
        ref: 'categorias',
        required: true
    },
    date: {
        type : Date,
        default: Date.now()
    }
})

export const postagem = mongoose.model('postagens', Postagem)