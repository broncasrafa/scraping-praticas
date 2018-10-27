
module.exports.getTotal = function(textoCount) {
    if(textoCount == null) {
        return 0;
    }

    return parseInt(textoCount.match(/\d+/gi).join(''));
}

module.exports.getTextWithinDoubleQuotes = function(texto){
    if(texto == null) {
        return null;
    }
    var pattern = /"((?:\\.|[^"\\])*)"/;
    return texto.match(pattern)[1];
}

module.exports.capitalizeFirstLetter = function(value) {
    if(value == null) {
        return null;
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
}

module.exports.getTextWithinParenthesis = function(texto) {
    if(texto == null) {
        return null;
    }
    var pattern = /\(([^)]+)\)/;
    return texto.match(pattern)[1];
}