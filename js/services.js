
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

app.factory('tableService', function(utilService, configService) {
    return {
        filter: function(item, filterValues) {
            
            var metadata = configService.getMetadata();
            var result = true;
            for (var i=0;i<metadata.length;i++) {
                if (!utilService.isEmpty(filterValues[metadata[i].name])) {
                    var colName = metadata[i].name;
                    switch (metadata[i].type) {
                        case 'text':
                            result = item[colName].toLowerCase().match(filterValues[colName].toLowerCase());
                            break;
                        case 'date':
                        case 'number':
                        case 'select':
                        case 'radio':
                            for (var j=0;j<filterValues[colName].length;j++) {
                                if (filterValues[colName][j]==item[colName]) {
                                    result = true;
                                    break;
                                }
                                result = false;
                            }
                        case 'multiselect':
                            for (var j=0;j<filterValues[colName].length;j++) {
                                if (item[colName].indexOf(filterValues[colName][j])!=-1) {
                                    result = true;
                                    break;
                                }
                                result = false;
                            }
                        case 'checkbox':
                            var val = filterValues[colName]=='true';
                            if (val!==item[colName]) {
                                result = false;
                                break;
                            }
                    }
                }
                if (!result) {
                    return false;
                }
            }
            return true;
        }
    }
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
		},
        
        getByValue: function(arr, property, value) {
            for (var i=0, iLen=arr.length; i<iLen; i++) {
                if (arr[i][property] == value) {
                    return arr[i];
                }
            }
        }
	}
});

app.factory('daoService', function(utilService, configService) {
	return {
		emptyRecord: {"name":"", "surname":"", "pesel":"", "dateOfBirth":"", "salary":0, "sex":"", "pseudonym":"", "interestings":[], "vehicle":"", "advantages":[], "dateOfAffiliating":""},
		
		getEmptyRecord: function() {
			return utilService.copy(this.emptyRecord);
		},
		
		getRecords: function() {
			//should be got from outer service
            var metadata = configService.getMetadata();
            for (var i = 0;i<records.length;i++) {
                for (var j = 0;j<metadata.length;j++) {
                    if (metadata[j].type=='date') {
                        var date = records[i][metadata[j].name].split('-');
                        if (!utilService.isEmpty(date)) {
                            records[i][metadata[j].name] = new Date(date[2], +date[1]-1, date[0]);
                        }
                    }
                }
            }
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