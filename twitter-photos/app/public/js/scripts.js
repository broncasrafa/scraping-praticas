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

//#region Split in Parts
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
//#endregion

//#region functions
function getDataInit(username) {
    var url = '/user/timeline_init/' + username;
    var jqXHR = $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        async: false,
        success: function(response) {},
        error: function(err){}
    });
    var json = JSON.parse(jqXHR.responseText)
    return json;
}
function getDataOthers(username, max_id) {
    var url = '/user/timeline_others/' + username + '?max_id='+ max_id;
    var jqXHR = $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        async: false,
        success: function(response) {},
        error: function(err){}
    });
    var json = JSON.parse(jqXHR.responseText)
    return json;
}
function hasNextData(username, id) {
    var url = '/user/timeline/has_next?screen_name=' + username + '&max_id='+ id;
    var jqXHR = $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        async: false,
        success: function(response) {},
        error: function(err){}
    });
    var json = JSON.parse(jqXHR.responseText)
    return json;
}

function downloadMedias(username, mediasDownload) {

    // por medidas de segurança, iremos quebrar a lista em partes de 50
    var partes_lista_medias = splitArrayInParts(mediasDownload, 50);

    for(var i = 0; i < partes_lista_medias.length; i++) {
        
        var medias = partes_lista_medias[i];

        var jqXHR = $.ajax({
            type: 'GET',
            url: '/download/' + username,
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
//#endregion