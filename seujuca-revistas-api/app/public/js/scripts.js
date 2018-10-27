function getCategorias() {
    var jqXHR = $.ajax({
        url: '/api/v1/seujeca/revistas/categorias',
        type: 'GET',
        async: false,
        dataType: 'json',
        success: function(resp) { console.log(resp); },
        error: function(error) { console.log(error); }
    })
    var json = JSON.parse(jqXHR.responseText);
    return json;
}

function getRevistas(marca, page) {
    var jqXHR = $.ajax({
        url: '/api/v1/seujeca/revistas/marca/' + marca,
        data: {
            "page": page == null ? 1 : page
        },
        type: 'GET',
        async: false,
        dataType: 'json',
        success: function(resp) {
            console.log(resp);
        },
        error: function(error) {
            console.log(error);
        }
    });
    var json = JSON.parse(jqXHR.responseText);
    return json;
}

function getMulheres(url, page) {
    var jqXHR = $.ajax({
        url: url,
        data: {
            "page": page == null ? 1 : page
        },
        type: 'GET',
        async: false,
        dataType: 'json',
        success: function(resp) {
            console.log(resp);
        },
        error: function(error) {
            console.log(error);
        }
    });
    var json = JSON.parse(jqXHR.responseText);
    return json;
}

function createHtmlContent(models) {
    var strHtml = '';
    models.forEach(item => {
        var model = item;
        strHtml += '<div class="col-md-3 col-xs-6">';
        strHtml += '    <a href="#" class="thumbnail" style="border: 0px solid #ddd !important">';
        strHtml += '        <img alt="'+ model.id + '"  src="'+ model.img + '" style="height: 180px; width: 100%; display: block;" />';
        strHtml += '    </a>';
        strHtml += '</div>'; 
    });
    return strHtml;
}

/**
 * Separa um array em partes (Um array de array). Você definide o tamanho que quer o array (chunk_size). Ex.: um array com 100 registros, você divide esse array
 * em arrays contendo 10 registros dentro, ou seja, 10 arrays com 10 registros dentro.
 * @param {any} myArray  - o array a ser dividido
 * @param {int} chunk_size - a quantidade desejada para conter cada array dividido
 */
var splitArrayInParts = function (myArray, chunk_size) {
    var results = [];
    while(myArray.length) {
        results.push(myArray.splice(0, chunk_size));
    }
    return results;
}

function salvarRevistas(revistas) {
    for(var i = 0; i < revistas.length; i++) {
        
        var revista = revistas[i];

        if(revista.isBitLy) {
            var jqXHR = $.ajax({
                type: 'GET',
                url: '/api/v1/seujeca/save/bitly/' + revista.revista_id,
                dataType: 'json',
                async: false,
                success: function(resp) {
                },
                error: function(err) {
                }
            });
        } else {
            var jqXHR = $.ajax({
                type: 'GET',
                url: '/api/v1/seujeca/save/revistas/' + revista.revista_id,
                dataType: 'json',
                async: false,
                success: function(resp) {
                },
                error: function(err) {
                }
            });
        }
        
    }    
    var jsonObj = { status: 'OK', message: 'Revistas salvas com sucesso'}
    var json = jsonObj;
    return json;
}

function salvarOutras(url) {
    var jqXHR = $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        async: false,
        success: function(resp) {
        },
        error: function(err) {
        }
    });
    var jsonObj = { status: 'OK', message: 'Revistas salvas com sucesso'}
    var json = jsonObj;
    return json;
}

function downloadRevistas(name, revistas) {

    // por medidas de segurança, iremos quebrar a lista em partes de 50
    var partes_lista_medias = splitArrayInParts(revistas, 50);

    for(var i = 0; i < partes_lista_medias.length; i++) {
        
        var medias = partes_lista_medias[i];

        var jqXHR = $.ajax({
            type: 'GET',
            url: '/api/v1/seujeca/save/download/' + name,
            data: {
                'medias': JSON.stringify(medias)
            },
            dataType: 'json',
            async: false,
            success: function(resp) {
            },
            error: function(err) {
            }
        });
    }
    
    var jsonObj = { status: 'OK', message: 'Medias salvas com sucesso'}
    var json = jsonObj;
    return json;
}

function getAllRevistas() {
    var jqXHR = $.ajax({
        url: '/api/v1/seujeca/save/revistas',
        type: 'GET',
        async: false,
        dataType: 'json',
        success: function(resp) { console.log(resp); },
        error: function(error) { console.log(error); }
    })
    var json = JSON.parse(jqXHR.responseText);
    return json;
}

//#region Toast
/* Toast Type */
var TYPE_MSG_SUCCESS = "success";
var TYPE_MSG_INFO = "info";
var TYPE_MSG_WARNING = "warning";
var TYPE_MSG_ERROR = "error";

/**
 * Mostra um alert popup baseado no toastr.
 * @param {string} title - o titulo do alert
 * @param {string} message - a mensagem do alert
 * @param {string} type_msg - o tipo de mensagem. Tipo possíveis (TYPE_MSG_SUCCESS, TYPE_MSG_INFO, TYPE_MSG_WARNING, TYPE_MSG_ERROR)
 */
var showAlertMessage = function (title, message, type_msg) {

    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    var strType = "";

    switch (type_msg) {
        case "success": strType = "success"; break;
        case "info": strType = "info"; break;
        case "warning": strType = "warning"; break;
        case "error": strType = "error"; break;
        default:
            strType = "error"; break;
    }

    toastr[strType](message, title);
};
//#endregion