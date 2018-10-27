var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var mulheresSchema = new Schema({
    famosa_id: {
        type: String, required: true
    },
    tipo: String,
    dataPublicacao: String,
    thumb: String,
    description: String,
    photos: [String],
    videos: [String],
});

var Mulher = mongoose.model('mulheres', mulheresSchema)
module.exports = Mulher;

/*
{
        "famosa_id": "torcedora-gremista-nua-whatsapp",
        "tipo": "Caiu na net",
        "dataPublicacao": "2016-09-08T20:25:22",
        "thumb": "https://www.seujeca.com/wp-content/uploads/2016/09/torcedora-gremista-nua.jpg",
        "description": "Torcedora gremista gostosa nua caiu no WhatsApp. A bela loira, peituda e rabuda, aparece pelada em várias fotos que vazaram no aplicativo.",
        "photos": [
            "https://www.seujeca.com/wp-content/uploads/2016/09/torcedora-gremista-nua.jpg"
        ],
        "videos": []
}
*/