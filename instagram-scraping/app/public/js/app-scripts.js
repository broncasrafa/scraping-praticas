function before(valor, a) {
    var posA = valor.indexOf(a);
    if (posA == -1) {
        return "";
    }
    return valor.substring(0, posA);
}

function after(valor, a) {
    var posA = valor.lastIndexOf(a);
    if (posA == -1) {
        return "";
    }
    var adjustedA = posA + a.length;
    if (adjustedA >= valor.length) {
        return "";
    }
    return valor.substring(adjustedA);
}

String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
}

function formatNumber(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + '.' + '$2');
	}
	return x1 + x2;
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

function formattedNumbers(value) {
    if (value === null)
        return null;

    var retorno = "";

    var tamanho = parseInt(value.length);

    switch (tamanho) {
        case 1: retorno = value; break;
        case 2: retorno = value; break;
        case 3: retorno = value; break;
        case 4: retorno = String.format("{0}.{1}", value.substring(0, tamanho - 3), value.substring(1, 4)); break;
        case 5: retorno = String.format("{0}.{1}", value.substring(0, tamanho - 3), value.substring(2, 5)); break;
        case 6: retorno = String.format("{0}.{1}", value.substring(0, tamanho - 3), value.substring(3, 6)); break;
        case 7: retorno = String.format("{0}.{1}.{2}", value.substring(0, tamanho - 6), value.substring(1, 4), value.substring(4, 7)); break;
        case 8: retorno = String.format("{0}.{1}.{2}", value.substring(0, tamanho - 6), value.substring(2, 5), value.substring(5, 8)); break;
        case 9: retorno = String.format("{0}.{1}.{2}", value.substring(0, tamanho - 6), value.substring(3, 6), value.substring(6, 9)); break;
        case 10: retorno = String.format("{0}.{1}.{2}.{3}", value.substring(0, tamanho - 9), value.substring(1, 4), value.substring(4, 7), value.substring(7, 10)); break;
        case 11: retorno = String.format("{0}.{1}.{2}.{3}", value.substring(0, tamanho - 9), value.substring(2, 5), value.substring(5, 8), value.substring(8, 11)); break;
        case 12: retorno = String.format("{0}.{1}.{2}.{3}", value.substring(0, tamanho - 9), value.substring(3, 6), value.substring(6, 9), value.substring(9, 12)); break;
        case 13: retorno = String.format("{0}.{1}.{2}.{3}.{4}", value.substring(0, tamanho - 12), value.substring(1, 4), value.substring(4, 7), value.substring(7, 10), value.substring(10, 13)); break;
        default:
            retorno = "Not formatted";
            break;
    }

    return retorno;
}
String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
}


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

function getDataInit(username) {
    var url = '/getInstagramInit/' + username;

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

    var json = JSON.parse(jqXHR.responseText);
    return json;
}
function getOtherData(params) {
    var url = '/getInstagramMore/' + params;

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

    var json = JSON.parse(jqXHR.responseText);
    return json;
}

function downloadMedias(username, mediasDownload) {

    // por medidas de segurança, iremos quebrar a lista em partes de 50
    var partes_lista_medias = splitArrayInParts(mediasDownload, 50);

    for(var i = 0; i < partes_lista_medias.length; i++) {
        
        var medias = partes_lista_medias[i];

        var jqXHR = $.ajax({
            type: 'GET',
            url: '/downloadFotos',
            data: {
                'medias': JSON.stringify(medias),
                'username': username
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
    var json = jsonObj; //JSON.parse(jqXHR.responseText);
    return json;
}
function downloadSingleMedia(username, url) {
    var jqXHR = $.ajax({
        type: 'GET',
        url: '/downloadSingleMedia',
        data: {
            'media': url,
            'username': username
        },
        dataType: 'json',
        async: false,
        success: function(resp) {
        },
        error: function(err) {
        }
    });

    var json = JSON.parse(jqXHR.responseText);
    return json;
}

function getVideoUrl(shortcode) {
    var video_url = '';
    
    var url = 'https://www.instagram.com/p/' + shortcode + '/?__a=1';

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
    var json = JSON.parse(jqXHR.responseText);
    video_url = json.graphql.shortcode_media.video_url;
    return video_url;
}

function getSidecarImages(shortcode) {
    var shortcode_media = {};
    var url = 'https://www.instagram.com/p/' + shortcode + '/?__a=1';
    var jqXHR = $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        async: false,
        success: function(resp) {
            video_url = resp.graphql.shortcode_media;                    
        },
        error: function(err) {
        }
    });
    var json = JSON.parse(jqXHR.responseText);
    shortcode_media = json.graphql.shortcode_media.edge_sidecar_to_children;
    return shortcode_media;
}

function getRecentsStories(userId) {
    var url = '/getStoriesRecents/';

    var jqXHR = $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        data: {
            'id': userId
        },
        async: false,
        success: function(resp) {
        },
        error: function(err) {
        }
    });

    var json = JSON.parse(jqXHR.responseText);
    return json;
}
function getIdsStoriesDestaque(userId) {
    var url = '/getIdsStoriesDestaques/';

    var jqXHR = $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        data: {
            'id': userId
        },
        async: false,
        success: function(resp) {
        },
        error: function(err) {
        }
    });

    var json = JSON.parse(jqXHR.responseText);
    return json;
}
function getDataStoriesDestaque(ids) {
    var reels_media = [];
    var jqXHR = $.ajax({
        type: 'GET',
        url: '/getStoriesDestaques',
        dataType: 'json',
        data: {
            'ids': ids
        },
        async: false,
        success: function(resp) {
        },
        error: function(err) {
        }
    });
    var json = JSON.parse(jqXHR.responseText);
    reels_media = json.reels_media;
    return reels_media;
}