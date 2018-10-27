var mongoose = require('mongoose')

var mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/seujeca-revistas'

mongoose.Promise = global.Promise;

module.exports = mongoose.connect(mongoUrl, { useNewUrlParser: true }, (err) => {
    if(err) {
        console.log('[database]: Não conectado a base de dados: '+ err.message)
    } else {
        console.log('[database] Conectado a base de dados MongoDB...')
    }
})
