app.factory('configService', function() {
	return {
		getErrorMessages: function() {
			return {
				'name': {'required': 'Field \'name\' is required.'},
				'surname': {'required': 'Field \'surname\' is required.'},
				'pesel': {'required': 'Field \'pesel\' is required.', 'pattern': 'Field \'pesel\' should contains only number, and length: 11, and should match to field \'date of birth\''},
				'dateOfBirth': {'required': 'Field \'date of birth\' is required.', 'pattern': 'Field \'date of birth\' should contain valid date from year: 1900-2099 and match to pattern dd-mm-yyyy'},
				'salary': {'required': 'Field \'salary\' is required.', 'number': 'Value of field \'salary\' should be the number', 'min': 'Value of field \'salary\' is to less (should be bigger or equal than 0)', 'max': 'Value of this field is to big (should be less or equal than 1000)'},
				'pseudonym': {'required':'Pseudonym is required', 'pattern': 'Field \'pseudonym\' should contains name or surname.'},
				'dateOfAffiliating': {'pattern': 'Field \'date of affiliating\' should contain valid date from year: 1900-2099 and match to pattern dd-mm-yyyy'},
				'vehicle': {'required':'Vehicle must be selected', 'pattern':'Pattern is not fulfilled'},
				'likeFootball': {'required':'You must love football!!'}
			};
		},
		getAssignParams: function() {
			return {
				'name': {
					'pseudonym':
						[
							{'cond':'this[0]==\'x\'', 'val':'this[0] + record.surname[0]'}, 
							{'cond':'otherwise', 'val':'this'}
						],
					'vehicle':
						[
							{'cond':'this[0]==\'x\'', 'val':'bike'}, 
							{'cond':'otherwise', 'val':'motorbike'}
						]
					},
				'surname': {'pseudonym':[{'cond':'true', 'val':'record.name + this'}]},
				'pseudonym':{},
				'dateOfAffiliating':{},
				'pesel': {
					'sex':
						[
							{'cond':'this.length==11 && this[9]%2==true', 'val':'male'}, 
							{'cond':'this.length==11 && this[9]%2==false', 'val':'female'}, 
							{'cond':'otherwise', 'val':''}
						], 
					'likeFootball':
						[
							{'cond':'this.length==11 && this[9]%2==true', 'val': 'true'},
							{'cond':'otherwise', 'val':'false'}
						],
					'dateOfBirth':
						[
							{'cond':'this.length==11 && +(this[2]+this[3])>50', 'val':'this[4]+this[5]+\'-\'+(+(this[2]+this[3])-80).toString()+\'-18\'+this[0]+this[1]'},
							{'cond':'this.length==11 && +(this[2]+this[3])>20 && +(this[2]+this[3])<40', 'val':'this[4]+this[5]+\'-\'+(+(this[2]+this[3])-20).toString()+\'-20\'+this[0]+this[1]'},
							{'cond':'this.length==11 && +(this[2]+this[3])<20', 'val':'this[4]+this[5]+\'-\'+this[2]+this[3]+\'-19\'+this[0]+this[1]'},
							{'cond':'this.length==11', 'val':'this[4]+this[5]+\'-\'+this[2]+this[3]+\'-19\'+this[0]+this[1]'},
							{'cond':'otherwise', 'val':''}
						]
					},
				'dateOfBirth': {
					'vehicle':
						[
							{'cond': '(+this.substring(6, 10))<1998', 'val':'car'},
							{'cond': 'otherwise', 'val':'bike'}
						]
				},
				'vehicle': {
					'pseudonym':
						[
							{'cond': 'record.pseudonym==undefined || record.pseudonym==\'\'', 'val':'record.pseudonym'},
							{'cond':'record.pseudonym.match(\'.*-.*er\')==null', 'val':'record.pseudonym + \' - \' + this + \'er\''},
							{'cond':'otherwise', 'val':'record.pseudonym.substring(0, record.pseudonym.indexOf(\'-\')-1) + \' - \' + this + \'er\''}
						]
					},
				'likeFootball': {
					'pseudonym':
						[
							{'cond': 'this==\'true\'', 'val':'record.pseudonym + \' RONALDO\''},
							{'cond':'this!=\'true\' && record.pseudonym.match(\'.* RONALDO\')!=null', 'val':'record.pseudonym.substring(0, record.pseudonym.indexOf(\' RONALDO\'))'}
						]
				}
			};
		},
		getValidations: function() {
			return {
				'name': {'required':true},
				'surname': {'required':true},
				'pesel': {'required':true, 'pattern':'\\d{11}'},
				'dateOfBirth': {'required':true, 'pattern':			'^(?:(?:31(-)(?:0?[13578]|1[02]))\\1|(?:(?:29|30)(-)(?:0?[1,3-9]|1[0-2])\\2))(?:(?:19|20)?\\d{2})$|^(?:29(-)0?2\\3(?:(?:(?:19|20)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\\d|2[0-8])(-)(?:(?:0?[1-9])|(?:1[0-2]))\\4(?:(?:19|20)?\\d{2})$'},
				'salary': {'required':true, 'min':'0', 'max':'1000', 'step':'10'},
				'pseudonym': {'required':true, 'pattern':'^.*(record.name|record.surname).*$'},
				'vehicle': {'required':true, 'pattern':'^.*ike$'},
				'dateOfAffiliating': {'pattern':'^(?:(?:31(-)(?:0?[13578]|1[02]))\\1|(?:(?:29|30)(-)(?:0?[1,3-9]|1[0-2])\\2))(?:(?:19|20)?\\d{2})$|^(?:29(-)0?2\\3(?:(?:(?:19|20)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\\d|2[0-8])(-)(?:(?:0?[1-9])|(?:1[0-2]))\\4(?:(?:19|20)?\\d{2})$'},
				'likeFootball': {'required':true}
			}
		},
		getAvailableOpts: function() {
			return {
				'vehicle': [{'id':'car', 'name':'Car'}, {'id':'train', 'name':'Train'}, {'id':'bike', 'name':'Bike'}, {'id':'motorbike', 'name':'Motorike'}]
			}
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

app.factory('utilService', function() {
	return {
		copy: function(obj) {
			return JSON.parse(JSON.stringify(obj));
		},
		evalPatternCondition: function(obj, record) {
			if (obj==undefined) {
				return '';
			}
			var condArr = obj.split(/\||\&|\=\=\!\=|\!|\^|\$|\(|\)/);
			//console.log(condArr);
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
			{"name":"Roman", "surname":"Bełski", "pesel":"87091874965", "dateOfBirth":"18-09-1987", "salary":2000, "sex":"male", 'pseudonym':'Romanov', 'likeFootball':true, 'vehicle':'car', 'advantages':'', 'dateOfAffiliating':'27-08-2013'}
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