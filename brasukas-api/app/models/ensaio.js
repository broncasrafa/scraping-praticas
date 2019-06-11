var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ensaioSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    name: String,
    count: Number,
    fotos: [String]
})

var Ensaio = mongoose.model('ensaio', ensaioSchema)
module.exports = Ensaio
