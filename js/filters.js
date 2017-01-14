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

app.filter('arrayToString', function() {
	return function(input) {
		var result = "";
		for (var i=0;i<input.length;i++) {
			result += (input[i] + ", ");
		}
		result = result.substring(0, result.length-2);
		return result;
	}
});

app.filter('booleanToYesNo', function() {
	return function(input) {
		if (input==true) {
			return "Yes";
		}
		else if (input==false) {
			return "No";
		}
	}
});