import localStrategy from "passport-local"
import { usuario } from "../models/Usuario.js"
import bcrypt from 'bcrypt';



export default function passportFunc(passport) {

    //Ali em usernameField eu estou dizendo qual vai ser o campo que eu vou querer analisar
    //Preciso usar o passwordField por que o meu campo de senha se chama 'senha', e como o passport trabalha
    //com tudo em inglês ele iria reconhecer automaticamente se o meu campo se chamasse 'password'
    passport.use(new localStrategy.Strategy({ usernameField: 'email', passwordField: 'senha' }, (email, senha, done) => {
     
        usuario.findOne({ email: email }).select('+senha').lean().then((usuario) => {
            if (!usuario) {
                //No done eu passo 3 argumentos, os dados da conta que foi autenticada que nesse
                //caso como não foi encontrado nenhum usuário então eu coloco null como 1° argumento.
                //O segundo é se a autenticação aconteceu com sucesso como nesse caso ela não aconteceu então eu 
                //coloco false.
                //E o terceiro é uma mensagem 
                return done(null, false, { message: 'Credenciais inválidas' })
            } else {

                //Aqui eu comparo a senha que o usuário digitou com a senha que está no bd
                //Utilizo o .compareSync para fazer essa comparação de forma síncrona, mas caso eu quisesse fazer isso de forma
                // assíncrona eu utilizaria só o .compare, que por sua vez iria me retornar uma promise
                const senhaValida = bcrypt.compareSync(senha, usuario.senha)

                if (!senhaValida) {
                    return done(null, false, { message: 'Credenciais inválidas' })

                } else {
                    return done(null, usuario)
                }

            }
        })
            .catch((err) => {
                done(null, false, { message: 'Erro interno!: ' + err })
            })

    })

    )

    passport.serializeUser((usuario, done) => {

        done(null, usuario._id)

    })

    passport.deserializeUser((id, done) => {


        usuario.findById(id).lean().then((usuario) => {
            done(null, usuario)
        })
            .catch((err) => {
                done(null, false, { message: 'Erro interno!: ' + err })
            })
    })

}

