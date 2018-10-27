function getModels(page) {
    var jqXHR = $.ajax({
        url: '/api/v1/models',
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

