app.filter('tableFilter', function(tableService) {
    return function(items, filterValues) {
        var result = [];
        var filtered = 0;
        for (var i=0;i<items.length;i++) {
            if (tableService.filter.classify(items[i], filterValues)) {
                result.push(items[i]);
                filtered++;
            }
        }
        if(tableService.paging.numOfItems!=filtered) {
            tableService.paging.numOfItems = filtered;
            tableService.paging.update(1);
        }
        return result;
    }
});

app.filter('pagingFilter', function(tableService) {
    return function(items) {
        var result = [];
        var last = Math.min(tableService.paging.indexLast, items.length);
        for (var i=tableService.paging.indexFirst;i<last;i++) {
            result.push(items[i]);
        }
        return result;
    }
});

app.filter('sortFilter', function($filter, configService, utilService) {
    return function(items, property, order) {
        if (configService.getMetadataByName(property).type=='date') {  
            return $filter("orderBy")(items, property, order, function(fst, sec) {
                //copied from Angular specs
                if (fst.type !== 'string' || sec.type !== 'string') {
                    return (fst.index < sec.index) ? -1 : 1;
                }
                //
                if (fst.value===sec.value || utilService.isEmpty(fst.value) && utilService.isEmpty(sec.value)) {
                    return 0;
                }
                if (utilService.isEmpty(fst.value)) {
                    return -1;
                }
                if (utilService.isEmpty(sec.value)) {
                    return 1;
                }
               
                return (utilService.stringToDate(fst.value) < utilService.stringToDate(sec.value)) ? -1 : 1;
            });
        }
        return $filter("orderBy")(items, property, order);
    }
});       

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

app.filter('tableValueFilter', function(utilService) {
    return function(input, val, md) {
        switch(md.type) {
            case 'multiselect':
                if ( Object.prototype.toString.call(input) !== '[object Array]' ) {
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
                    if (!utilService.isEmpty(input)) {
                        return md.aliases[input];
                    }
                    else {
                        return md.aliases["false"];
                    }
                }
                return input;
            case 'text':
            case 'textarea':
                if (!utilService.isEmpty(input)) {
                    if (input.length>50) {
                        input = input.substring(0, 50)+"...";
                    }
                }
                return input;
            case 'date':
                input = utilService.stringToDate(input);
                if (!utilService.isEmpty(md.format) && !utilService.isEmpty(input)) {
                    return moment(input, 'dd-MM-yyy').format(md.format);
                }
                return input;
            default:
                return input;
        }
    }
});