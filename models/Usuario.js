import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcrypt"
import { randomInt } from 'node:crypto';

const Usuario = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true

    },
    senha: {
        type: String,
        required: true,
        select: false //Serve para que quando eu puxe os dados desse usuário o campo de senha não venha junto
        
    },
    eAdm: {
        type: Boolean,
        default: false
    },
    date: {
        type : Date,
        default: Date.now()
    }
})

//Criptografando a senha
    const randomSalt = randomInt(10, 16)//Randomizo um numero entre 10 e 16
    
    Usuario.pre('save',  async function (next) { //Aqui eu não devo usar a Arrow Func
        
        //O primeiro argumento é o que eu quero criptografar, e o segundo é quantidade de 'rodadas' 
        //de criptografia eu quero realizar, posso colocar qualquer número porém menos de 10 não é bom,
        //e muito mais que 10 vai fazer com que demore muito pra realizar a criptografia e vai deixar o sistema lento
    
        this.senha = await bcrypt.hash(this.senha, randomSalt) //Como isso ocorre de forma assíncrona eu devo usar async/await
    
        next();//Esse .pre() vai ficar parado executando o que eu mandei até que eu mande ele seguir para o próximo código, utilizando o next()
    })

export const usuario = mongoose.model('usuarios', Usuario)