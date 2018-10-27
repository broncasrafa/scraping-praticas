var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var revistasSchema = new Schema({
    revista_id: {
        type: String,
        required: true
    },
    tipo: String,
    dataPublicacao: String,
    thumb_capa: String,
    model: String,
    edition: String,
    title: String,
    marca: String,
    description: String,
    count: Number,
    photos: [String]
});

var Revista = mongoose.model('revistas', revistasSchema);

module.exports = Revista;

/*
{
        "revista_id": "revista-sexy-outubro-flavia-tamayo",
        "tipo": "Revista Sexy",
        "dataPublicacao": "2018-10-10T17:56:59",
        "thumb_capa": "https://www.seujeca.com/wp-content/uploads/2018/10/revista-sexy-outubro-flavia-tamayo.jpg",
        "model": "Flavia Tamayo",
        "edition": "Revista Sexy Outubro 2018",
        "title": "Revista Sexy Outubro 2018 :: Flavia Tamayo",
        "marca": "Revista Sexy",
        "description": "A Musa da Eleições Flavia Tamayo é a capa e o recheio da Sexy de Outubro. Nada de Fake News! Essa loira gostosa, dona de uma bela bunda, encara qualquer votação.",
        "count": 37,
        "photos": [
                "https://www.seujeca.com/wp-content/uploads/2018/10/revista-sexy-outubro-flavia-tamayo.jpg"
        ]
}
*/