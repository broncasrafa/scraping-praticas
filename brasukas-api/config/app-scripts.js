
module.exports.getTotal = function(textoCount) {
    if(textoCount == null) {
        return 0;
    }

    return parseInt(textoCount.match(/\d+/gi).join(''));
};

module.exports.getTextWithinDoubleQuotes = function(texto){
    if(texto == null) {
        return null;
    }
    var pattern = /"((?:\\.|[^"\\])*)"/;
    return texto.match(pattern)[1];
};

module.exports.capitalizeFirstLetter = function(value) {
    if(value == null) {
        return null;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
};

module.exports.getTextWithinParenthesis = function(texto) {
    if(texto == null) {
        return null;
    }
    var pattern = /\(([^)]+)\)/;
    return texto.match(pattern)[1];
};

module.exports.getParams = function(queryString) {
    var arr = [];
    for (var propName in queryString) {
        if (queryString.hasOwnProperty(propName)) {            
            arr.push(`${propName}=${queryString[propName]}`)            
        }
    }    
    return arr.join('&');
}

module.exports.getUrl = function(baseUrl, params) {    
    var url = baseUrl;

    if (params.length > 0) {
        url = `${url}?${params}`;
    }
    
    return url;
}

module.exports.isMan = function(starname) {
    var caras = ['Alexandre Frota', 'Kid Bengala', 'Big Macky', 'Roge Ferro', 'Carlos Bazuca', 'Pitt Garcia', 'Oliver', 'Cowboy', 'Zezinho', 'Loupan', 'Ed Júnior', 'Alex Ferraz', 'Don Picone', 'Jazz Duro', 'Juliano Ferraz', 'Tony Tigrão', 'Falcon']
    return caras.includes(starname);
}

module.exports.mensCount = function () {
    var caras = ['Alexandre Frota', 'Kid Bengala', 'Big Macky', 'Roge Ferro', 'Carlos Bazuca', 'Pitt Garcia', 'Oliver', 'Cowboy', 'Zezinho', 'Loupan', 'Ed Júnior', 'Alex Ferraz', 'Don Picone', 'Jazz Duro', 'Juliano Ferraz', 'Tony Tigrão', 'Falcon']
    return caras.length;
}