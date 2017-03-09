app.filter('regex', function() {
	return function(input, field, regex) {
		var patt = new RegExp(regex);      
		var out = [];
		for (var i = 0; i < input.length; i++){
			if(patt.test(input[i][field])) {
				out.push(input[i]);
			}
		}      
		return out;
	};
});

app.filter('tableFilter', function(utilService) {
    return function(input, val, md) {
        switch(md.type) {
            case 'multiselect':
                if ( Object.prototype.toString.call( input ) !== '[object Array]' ) {
                    return input;
                }
                var result = "";
                for (var i=0;i<input.length;i++) {
                    result += (utilService.getByValue(md.availableOpts, 'id', input[i]).name + ", ");
                }
                result = result.substring(0, result.length-2);
                return result;
            case 'radio':
            case 'select':
                var val = utilService.getByValue(md.availableOpts, 'id', input);
                if (!utilService.isEmpty(val)) {
                    return utilService.getByValue(md.availableOpts, 'id', input).name;
                }
                return input;
            case 'number':
                if (!utilService.isEmpty(md.suffix)) {
                    input += md.suffix;
                }
                if (!utilService.isEmpty(md.prefix)) {
                    input = md.prefix + input;
                }
                return input;
            case 'checkbox':
                if (!utilService.isEmpty(md.aliases)) {
                    return md.aliases[input];
                }
                return input;
            case 'date':
                if (!utilService.isEmpty(md.format)) {
                    return moment(input, 'dd-MM-yyy').format(md.format);
                }
                return input;
            default:
                return input;
        }
    }
});