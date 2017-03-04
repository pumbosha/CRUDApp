
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
		records: [
			{"name":"Tomasz", "surname":"Wilk", "pesel":"88021405057", "dateOfBirth":"14-02-1988", "salary":1000, "sex":"male", 'pseudonym':'Wilku', 'likeFootball':false, 'vehicle':'car', 'advantages':['smart', 'conscientious'], 'dateOfAffiliating':'12-02-2008'},
			{"name":"Maria", "surname":"Nowak", "pesel":"92121265498", "dateOfBirth":"12-12-1998", "salary":1500, "sex":"female", 'pseudonym':'MariaSkłodowska', 'likeFootball':true, 'vehicle':'bike', 'advantages':['smart'], 'dateOfAffiliating':'02-12-2010'},
			{"name":"Mirosław", "surname":"Kowalski", "pesel":"75100912398", "dateOfBirth":"09-10-1975", "salary":750, "sex":"male", 'pseudonym':'Kowalskij', 'likeFootball':false, 'vehicle':'motorbike', 'advantages':['punctual', 'conscientious'], 'dateOfAffiliating':'03-05-2009'},
			{"name":"Marek", "surname":"Bielski", "pesel":"69021585394", "dateOfBirth":"15-02-1969", "salary":1250, "sex":"male", 'pseudonym':'Bielskis', 'likeFootball':false, 'vehicle':'train', 'advantages':['smart', 'conscientious', 'punctual'], 'dateOfAffiliating':'17-09-2016'},
			{"name":"Anna", "surname":"Stępień", "pesel":"80061985263", "dateOfBirth":"19-06-1980", "salary":500, "sex":"female", 'pseudonym':'Hanna', 'likeFootball':true, 'vehicle':'', 'advantages':['punctual'], 'dateOfAffiliating':'13-06-2012'},
			{"name":"Roman", "surname":"Bełski", "pesel":"87091874965", "dateOfBirth":"18-09-1987", "salary":2000, "sex":"male", 'pseudonym':'Romanov', 'likeFootball':true, 'vehicle':'car', 'advantages':[], 'dateOfAffiliating':'27-08-2013'}
		],
		
		emptyRecord: {"name":"", "surname":"", "pesel":"", "dateOfBirth":"", "salary":0, "sex":"", "pseudonym":"", "interestings":[], "vehicle":"", "advantages":[], "dateOfAffiliating":""},
		
		getEmptyRecord: function() {
			return utilService.copy(this.emptyRecord);
		},
		
		getRecords: function() {
			//should be got from outer service
			return this.records;
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
		}
	}
});