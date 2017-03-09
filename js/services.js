
app.factory('configService', function() {
    "use strict";
	return {
        getMetadata: function() {
            return metadata;
        },
        
        getMetadataByName: function(name) {
            for (var i in metadata) {
                if (metadata[i].name==name) {
                    return metadata[i];
                }
            }
        },
        
        retrieveFirstVisibleField: function() {
            for (var i in metadata) {
                if (metadata[i].showInTable==true) {
                    return metadata[i].name;
                }
            }
        }
	}
});

app.factory('tableService', function(utilService) {
    return {}
});

app.factory('formService', function(utilService) {
	return {
		assign: function(obj, record) {
			if (record==undefined) {
				return;
			}
			//alert("obj: "+JSON.stringify(obj)+" record: "+JSON.stringify(record));
			for (var fieldName in obj) {
				items = obj[fieldName];
				var assigned = false;
				for (var i in items) {
					var item = items[i];
					var cond = utilService.evalOrReturn(item.cond, record);
					
					//alert("item.con: "+item.cond+" cond: "+cond);
					if (cond==1 && assigned==false) {
						record[fieldName] = utilService.removeKeyword(utilService.evalOrReturn(item.val, record), "undefined");
						assigned = true;
					}
					else if (cond=='otherwise' && assigned==false) {
						record[fieldName] = utilService.removeKeyword(utilService.evalOrReturn(item.val, record), "undefined");
					}
				}
			}
		}
	}
});						

app.factory('localizationService', function() {
	return {
        getMessage: function(domain, key) {
            return messages[domain][key];
        }
    }
});

app.factory('utilService', function() {
	return {
        isEmpty: function(obj) {
            return obj===null || obj===undefined || obj==="";
        },
        
		copy: function(obj) {
			return JSON.parse(JSON.stringify(obj));
		},
        
		evalPatternCondition: function(obj, record) {
			if (obj==undefined) {
				return '';
			}
			var condArr = obj.split(/\||\&|\=\=\!\=|\!|\^|\$|\(|\)/);
			for (var i = 0;i<condArr.length;i++) {
				var evaledCond = this.evalOrReturn(condArr[i], record);
				evaledCond = evaledCond==undefined ? "" : evaledCond;
				obj = obj.replace(condArr[i], evaledCond);
			}
			return obj;
		},
        
		evalOrReturn: function(obj, record) {
			//alert("eval obj: "+JSON.stringify(obj)+" record: "+JSON.stringify(record));
			if (obj==undefined || obj==null || obj=="") {
				return "";
			}
			try {
				return eval(obj);
			} catch(err) {
				return obj;
			}
		},
        
		replaceThisKeyword: function(obj, replacement) {
			return this.replaceKeyword(obj, "'"+replacement+"'", "this");
		},
        
		replaceKeyword: function (obj, replacement, word) {
			//alert("obj: "+obj+" word: "+word+" replacement: "+replacement);
			if (obj==undefined) {
				return obj;
			}
			return JSON.parse(JSON.stringify(obj).split(word).join(replacement));
		}, 
        
		removeKeyword: function(obj, word) {
			return this.replaceKeyword(obj, "", word);
		}
	}
});

app.factory('daoService', function(utilService) {
	return {
		emptyRecord: {"name":"", "surname":"", "pesel":"", "dateOfBirth":"", "salary":0, "sex":"", "pseudonym":"", "interestings":[], "vehicle":"", "advantages":[], "dateOfAffiliating":""},
		
		getEmptyRecord: function() {
			return utilService.copy(this.emptyRecord);
		},
		
		getRecords: function() {
			//should be got from outer service
			return records;
		},
		
		addRecord: function(record) {
			//adding record to records in database
			return true;
		},
		
		updateRecord: function(record) {
			//updating record to records in database
			return true;
		},
		
		deleteRecord: function(record) {
			//deleting record from records in database
			return true;
		},
        
        getMinValOf: function(column) {
            return Math.min.apply(Math,this.getRecords().map(function(o){return o[column];}))
        },
        
        getMaxValOf: function(column) {
            return Math.max.apply(Math,this.getRecords().map(function(o){return o[column];}))
        }
	}
});