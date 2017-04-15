
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

app.factory('tableService', function(utilService, configService, $timeout, daoService, localizationService) {
    return {
        sort: {
            order: "asc",
            column: configService.retrieveFirstVisibleField(),

            update: function() {
                this.setSort(this.column);
            },

            setSort: function(column) {
                if (this.column==column) {
                    order = this.toggleOrder();
                }
                else {
                    this.column = column;
                    order = "asc";
                }
                $("#tableContent table th i.sortIcon").each(function() {
                    $(this).removeClass("highlighted");
                });
                $('#sortIcon_' + this.column).addClass("highlighted");
                $('#sortIcon_' + column).tooltip();
            },

            toggleOrder: function() {
                if (this.order=="asc") {
                    this.order = "desc";
                    $('#sortIcon_' + this.column).removeClass("fa-sort-amount-asc").addClass("fa-sort-amount-desc");
                }
                else {
                    this.order = "asc";
                    $('#sortIcon_' + this.column).removeClass("fa-sort-amount-desc").addClass("fa-sort-amount-asc");
                }
            }
        },
        
        filter: {
            filterValues: {},
            checkboxFilter: 'true',
            column: configService.retrieveFirstVisibleField(),
            slider: null,
            update: function() {
                $(".filter").val("");
                $(".filter").hide();
                $("span.select2").hide();
                $("#tableContent table th i.filterIcon").each(function() {
                    $(this).removeClass("highlighted2");
                });
                $('#filterIcon_' + this.column).addClass("highlighted2");

                var dateType = configService.getMetadataByName(this.column).type;
                switch(dateType) {
                    case 'textarea':
                    case 'text':
                        this.showTextFilter();
                        break;
                    case 'number':
                        var min = configService.getMetadataByName(this.column)
                        this.showNumberRangeFilter();
                        break;
                    case 'date':
                        this.showDateRangeFilter();
                        break;
                    case 'checkbox':
                        this.showCheckboxFilter();
                        break;
                    case 'select':
                    case 'multiselect':
                    case 'radio':
                        this.showMultielectFilter();
                        break;
                } 

            },

            showTextFilter: function() {
                $("#textFilter").show();
                $("#textFilter").val(this.filterValues[this.column]);
            },

            showNumberRangeFilter: function() {
                var min = daoService.getMinValOf(this.column);
                var max = daoService.getMaxValOf(this.column);
                if (this.slider!=null) {
                    this.slider.destroy();
                }
                $("input#numberFilter").ionRangeSlider({
                    type: "double",
                    min: min,
                    max: max,
                    force_edges: true,
                    grid: true,
                    hide_min_max: true
                });

                var from = min;
                var to = max;

                if (this.filterValues[this.column]!=undefined) {
                    from = this.filterValues[this.column].from;
                    to = this.filterValues[this.column].to;
                }

                this.slider = $("input#numberFilter").data("ionRangeSlider");
                this.slider.update({
                    from: from,
                    to: to
                });

                $timeout(function(){
                    $("#filterContainer > div > span.irs").addClass("filter");
                    $("#filterContainer > div > span.irs").prop("id", "numberFilter");
                    $("#numberFilter").css("display", "block");
                }, 100);

                if (this.filterValues[this.column] != undefined) {
                    this.slider.update({
                        from: this.filterValues[this.column].from,
                        to: this.filterValues[this.column].to
                    });
                }
            },

            showDateRangeFilter: function() {

                $("#dateFilter").show();
                if (this.filterValues[this.column] != undefined) {
                    $("#dateFilter").data('daterangepicker').setStartDate(this.filterValues[this.column].from);
                    $("#dateFilter").data('daterangepicker').setEndDate(this.filterValues[this.column].to);
                }
                else {
                    $("#dateFilter").data('daterangepicker').setStartDate(moment());
                    $("#dateFilter").data('daterangepicker').setEndDate(moment());
                    $("#dateFilter").val("");
                }
            },

            showCheckboxFilter: function() {
                $("#checkboxFilter").show();
                if (this.filterValues[this.column] != undefined) {
                    $("#checkboxFilter").val(this.filterValues[this.column]);
                }
            },

            showMultielectFilter: function() {
                this.availableOpts = configService.getMetadataByName(this.column).availableOpts;
                var value = this.filterValues[this.column];
                var columnName = this.column;
                if (value==null) {
                    value=[];
                }
                $timeout(function(){
                    $("#multiselectFilter").val(value);
                    if (value!=undefined) {
                        $("#multiselectFilter").trigger("change");
                    }
                    $("#multiselectFilter").show();
                    $("#multiselectFilter + span.select2").show();
                    $("#multiselectFilter").select2({
                        placeholder: localizationService.getMessage("labels", "filterBy") + " "+columnName,
                    });
                }, 100);

            },

            addFilter: function() {
                var dateType = configService.getMetadataByName(this.column).type;
                switch(dateType) {
                    case 'textarea':
                    case 'text':
                        if (!utilService.isEmpty($("#textFilter").val())) {
                            this.filterValues[this.column] = $("#textFilter").val();
                        }
                        else {
                            this.delFilter();
                        }
                        break;
                    case 'number':
                        var range = $("input#numberFilter").data("ionRangeSlider");
                        this.filterValues[this.column] = {from: range.old_from, to: range.old_to};
                        break;
                    case 'date':
                        if (!utilService.isEmpty($("#dateFilter").val())) {
                            var dateData = $("#dateFilter").data('daterangepicker');
                            var startDate = dateData["startDate"];
                            var endDate = dateData["endDate"];
                            this.filterValues[this.column] = {from: startDate, to: endDate};
                        }
                        break;
                    case 'checkbox':
                        if (!utilService.isEmpty($("#checkboxFilter").val())) {
                            this.filterValues[this.column] = $("#checkboxFilter").val();
                        }
                        else {
                            this.delFilter();
                        }
                        break;
                    case 'select':
                    case 'multiselect':
                    case 'radio':
                        if (!utilService.isEmpty($("#multiselectFilter").val())) {
                            this.filterValues[this.column] = $("#multiselectFilter").val();
                        }
                        else {
                            this.delFilter();
                        }
                        break;
                } 
                if (!this.showAddFilterBtn()) {
                    $('#filterIcon_' + this.column).addClass("highlighted");
                } 
            },

            showAddFilterBtn: function() {
                return utilService.isEmpty(this.filterValues[this.column]);
            },

            delFilter: function() {
                $(".filter").val("");
                $('#filterIcon_' + this.column).removeClass("highlighted");
                this.filterValues[this.column] = null;
                this.update();
            },

            showFilter: function(name) {
                $('html, body').animate({
                    'scrollTop': $('#operations').offset().top-10
                }, 600);
                this.column = name;
                this.update();
                if (configService.getMetadataByName(this.column).type!='date') {
                    $('.filter').focus();
                }
            },
            
            classify: function(item, filterValues) {
                var metadata = configService.getMetadata();
                var result = true;
                for (var i=0;i<metadata.length;i++) {
                    if (!utilService.isEmpty(filterValues[metadata[i].name])) {
                        var colName = metadata[i].name;
                        var it = item[colName];
                        if (utilService.isEmpty(it)) {
                            it = "";
                        }
                        switch (metadata[i].type) {
                            case 'text':
                            case 'textarea':
                                result = it.toLowerCase().match(filterValues[colName].toLowerCase());
                                break;
                            case 'date':
                                var from = new Date(filterValues[colName].from);
                                var to = new Date(filterValues[colName].to);
                                var val = utilService.stringToDate(it);
                                //console.log("From: "+from+" to: "+ to+" val: "+val);
                                result = val>=from && val<=to;
                                break;
                            case 'number':
                                var from = +filterValues[colName].from;
                                var to = +filterValues[colName].to;
                                var val = +it;
                                result = val>=from && val<=to;
                                break;
                            case 'select':
                            case 'radio':
                                for (var j=0;j<filterValues[colName].length;j++) {
                                    if (filterValues[colName][j]==it) {
                                        result = true;
                                        break;
                                    }
                                    result = false;
                                }
                                break;
                            case 'multiselect':
                                for (var j=0;j<filterValues[colName].length;j++) {
                                    if (it.indexOf(filterValues[colName][j])!=-1) {
                                        result = true;
                                        break;
                                    }
                                    result = false;
                                }
                                break;
                            case 'checkbox':
                                var val = filterValues[colName]=='true';
                                if (val!==it) {
                                    result = false;
                                    break;
                                }
                                break;
                        }
                    }
                    if (!result) {
                        return false;
                    }
                }
                return true;
            }
        },
        
        paging: {
            page: 1,
            numOfItems: 0,
            itemsOnPage: "10",
            visiblePages: [],
            last: 0,
            indexFirst: 1,
            indexLast: +this.itemsOnPage,
            calculateVisiblePages: function() {
                this.visiblePages = [];
                //console.log("last: "+this.last+" page: "+this.page+" indexFirst: "+this.indexFirst+" last: "+this.indexLast);
                if (this.page==this.last && this.page>2) {
                    this.visiblePages.push(this.page-2);
                }
                if (this.page>1) {
                    this.visiblePages.push(this.page-1);
                }
                this.visiblePages.push(this.page);
                if (this.page!=this.last) {
                    this.visiblePages.push(this.page+1);
                }
                if (this.page==1 && this.last>2) {
                    this.visiblePages.push(this.page+2);
                }
            },
            update: function(page) {
                this.last = Math.ceil(this.numOfItems/this.itemsOnPage);
                this.page = page;
                this.indexFirst = (this.page-1)*this.itemsOnPage;
                this.indexLast = this.indexFirst+this.itemsOnPage;
                this.calculateVisiblePages();
            },
            calculateClass(page) {
                if (page!=this.page) {
                    return "clickable";
                }
                return "non-clickable";
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

app.factory('localizationService', function() {
	return {
        getMessage: function(domain, key) {
            return messages[domain][key];
        }
    }
});

app.factory('utilService', function() {
	return {
        stringToDate: function(str) {
            if (this.isEmpty(str)) {
                return str;
            }
            var date = str.split('-');
            return new Date(date[2], +date[1]-1, date[0]);
        },
        
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
			var condArr = obj.split("`");
            for (var i = 1;i<condArr.length;i+=2) {
                var evaledCond = this.evalOrReturn(condArr[i], record);
                evaledCond = evaledCond==undefined ? "" : evaledCond;
				obj = obj.replace(condArr[i], evaledCond);
			}
			return obj.split("`").join("");
		},
        
		evalOrReturn: function(obj, record) {
			//console.log("eval obj: "+JSON.stringify(obj)+" record: "+JSON.stringify(record));
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
        
        countRecords: function() {
            return records.length;
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