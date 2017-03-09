app.controller('CRUDAppController', function ($scope, $rootScope, formService, daoService, utilService, configService, localizationService, $timeout) {
    
    $(document).ready(function() {
        $("#formModal").on('hidden.bs.modal', function () {
            $scope.showForm = false;   
            $scope.$apply();
        });
        
        $scope.filter.update();
    });
	
    /******************************* Variables *******************************/ 
    
	var editedPesel = "";
    
    var firstShowForm = true;
	
    
    /******************************* Functions *******************************/
    
	var getRecord = function (pesel) {
		for (var i=$scope.records.length-1; i>=0; i--) {
			if( $scope.records[i].pesel == pesel) {
				return $scope.records[i];
			}
		}
		return null;
	}
	
	var preFillForm = function(record) {
		//fill form with data provided in 'record' variable
		$scope.recordForm.$setPristine();
        $scope.record = record;
        if (!$scope.showForm) {
            $scope.toggleForm();
        }
	}
	
	var showErrMsg = function(msg) {
		$scope.succMsg = "";
		$scope.errMsg = msg;
	}
	
	var showSuccMsg = function(msg) {
		$scope.succMsg = msg;
		$scope.errMsg = "";
	}
    
    /******************************* Scope Variables *******************************/
	
	$scope.metadata = configService.getMetadata();
	
	$scope.records = daoService.getRecords();
	
	$scope.showForm = false;
	
	$scope.succMsg = "";
	
	$scope.errMsg = "";
	
	$scope.random = {'val': Math.random().toString(36).substring(7)};
    
    $scope.editRecordClicked = false;
    
    
    /******************************* Scope Functions *******************************/
    
    $scope.initGlobalVariables = function () {
		$scope.recordForm.failedAttemted = false;
		$rootScope.form = $scope.recordForm;
	}
	
	$scope.toggleForm = function() {
		$scope.recordForm.failedAttemted = false;
		$scope.showForm = !$scope.showForm;
        $('#formModal').modal('toggle');
        $('[data-toggle="tooltip"]').tooltip({
            trigger : 'hover'
        })  
        
        if (firstShowForm==true) {
            firstShowForm = false;
            
            //datepicker
            $('.datepicker').datepicker({
                format: 'dd-mm-yyyy',
                autoclose: true,
            }).on('changeDate', function(ev){                 
                $(this).datepicker('hide');
                $scope.$broadcast('dateChanged', {
                    name: $(this).attr('name'),
                    newVal: $(this).val()
                });
            });
        }
        $scope.errMsg = "";
	}
		
	$scope.deleteRecord = function(pesel) {
		if (!daoService.deleteRecord(getRecord(pesel))) {
			showErrMsg(messages.errors.delete);
			return;
		}
		var index = $scope.records.indexOf(getRecord(pesel));
		if (index!=-1) {
			$scope.records.splice(index, 1);
		}
	}
	
	$scope.editRecord = function(pesel) {
		//fill form with selected record
        $scope.editRecordClicked = true;
		preFillForm(utilService.copy(getRecord(pesel)));
		editedPesel = pesel;
        $scope.modalTitle = messages.labels.editRecord;
        $timeout(function(){$scope.editRecordClicked = false;}, 100);
	}
	
	$scope.addRecord = function() {
		//fill form with empty record
		preFillForm(daoService.getEmptyRecord());
        $scope.modalTitle = messages.labels.addRecord;
		editedPesel = "";
	}
	
	$scope.saveRecord = function() {
		if (!$scope.recordForm.$valid) {
            showErrMsg(messages.errors.validationErrors);
			$scope.recordForm.failedAttemted = true;
			return;
		}
		$scope.recordForm.failedAttemted = false;
		if (editedPesel != "") {
			if(editedPesel!=$scope.record.pesel) {
				if (getRecord($scope.record.pesel)!=null) {
					showErrMsg(messages.errors.nonUniquePrimaryKey);
					return;
				}
			}
			if (!daoService.updateRecord($scope.record)) {
				showErrMsg(messages.errors.update);
				return;
			}
			var index = $scope.records.indexOf(getRecord(editedPesel));
			$scope.records[index] = $scope.record;
		}
		else {
			if (!daoService.addRecord($scope.record)) {
				showErrMsg(messages.errors.add);
				return;
			}
			$scope.records.push($scope.record)
		}
		showSuccMsg(messages.communicates.successSaveForm);
		$scope.toggleForm();
	}
	
	$scope.deleteMsg = function(msg) {
		if (msg=='succ') {
			$scope.succMsg = '';
		}
		else if (msg=='err') {
			$scope.errMsg = '';
		}
	}
	
	$scope.assign = function(obj) {
        //call asign only when user directly changed particular field
        if (!$scope.editRecordClicked) {
            formService.assign(obj, $scope.record);
        }
        //changing random variable to trigger $onChange event on each component which want to listen
        $scope.random = {'val': Math.random().toString(36).substring(7)};
	}		
	
	$scope.evalPattern = function(obj) {
		return utilService.evalPatternCondition(obj, $scope.record);
	}
    
    $scope.$watch('recordForm.$valid', function(newVal, oldVal) {
        if (newVal==true) {
            $scope.deleteMsg('err');
        }
        else if ($scope.recordForm.failedAttemted==true) {
            showErrMsg(messages.errors.validationErrors);
        }
    });
    
    $scope.locale = {
        getMessage: function(domain, key) {
            return localizationService.getMessage(domain, key);
        }
    };
    
    $scope.filter = {
        filterValues: {},
        checkboxFilter: 'true',
        column: configService.retrieveFirstVisibleField(),
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
            $("input#numberFilter").ionRangeSlider({
                type: "double",
                min: min,
                max: max
            });
            
            var from = min;
            var to = max;
            
            if (this.filterValues[this.column]!=undefined) {
                from = this.filterValues[this.column].from;
                to = this.filterValues[this.column].to;
            }
            
            var slider = $("input#numberFilter").data("ionRangeSlider");
            slider.update({
                from: from,
                to: to
            });
            
            $timeout(function(){
                $("#filterContainer > div > span.irs").addClass("filter");
                $("#filterContainer > div > span.irs").prop("id", "numberFilter");
                $("#numberFilter").css("display", "block");
            }, 100);
            
            if (this.filterValues[this.column] != undefined) {
                slider.update({
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
                    placeholder: $scope.locale.getMessage("labels", "filterBy") + " "+columnName,
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
                    break;
                case 'select':
                case 'multiselect':
                case 'radio':
                    if (!utilService.isEmpty($("#multiselectFilter").val())) {
                        this.filterValues[this.column] = $("#multiselectFilter").val();
                    }
                    break;
            } 
            if (!this.showAddFilterBtn()) {
                $('#filterIcon_' + this.column).addClass("highlighted");
            }
            //alert(JSON.stringify(this.filterValues[this.column]));
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
            this.column = name;
            this.update();
        }
                 
    };
    
});