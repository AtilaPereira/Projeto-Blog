import mongoose from "mongoose";
import { Schema } from "mongoose";

const Categoria = new Schema({
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

export const categoria = mongoose.model('categorias', Categoria)