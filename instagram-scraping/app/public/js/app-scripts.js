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