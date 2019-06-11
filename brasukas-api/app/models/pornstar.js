var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ensaiosSchema = new Schema({    
    ensaio_id: String,
    img_capa: String
});
var filmografiaSchema = new Schema({    
    filme_id: String,
    title: String,
    img_capa: String
});
var cenasSchema = new Schema({    
    title: String,
    img: String,
    link: String,
    description: String,
    num_cena: String,
});
var linksSchema = new Schema({    
    ensaio: String,
    videos: String
});

var pornstarSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    name: String,
    thumb: String,
    info: String,
    views: String,
    nota: String,
    votos: String,
    ensaios:[ensaiosSchema],
    filmografia: [filmografiaSchema],
    cenas: [cenasSchema],
    links: [linksSchema]
})

var Pornstar = mongoose.model('pornstar', pornstarSchema)
module.exports = Pornstar
