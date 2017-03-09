app.controller('CRUDAppController', function ($scope, $rootScope, formService, daoService, utilService, configService, $timeout) {
    
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
    
	var getPerson = function (pesel) {
		for (var i=$scope.persons.length-1; i>=0; i--) {
			if( $scope.persons[i].pesel == pesel) {
				return $scope.persons[i];
			}
		}
		return null;
	}
	
	var preFillForm = function(person) {
		//fill form with data provided in 'person' variable
		$scope.personForm.$setPristine();
        $scope.person = person;
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
	
	$scope.persons = daoService.getRecords();
	
	$scope.showForm = false;
	
	$scope.succMsg = "";
	
	$scope.errMsg = "";
	
	$scope.random = {'val': Math.random().toString(36).substring(7)};
    
    $scope.editPersonClicked = false;
    
    
    /******************************* Scope Functions *******************************/
    
    $scope.initGlobalVariables = function () {
		$scope.personForm.failedAttemted = false;
		$rootScope.form = $scope.personForm;
	}
	
	$scope.toggleForm = function() {
		$scope.personForm.failedAttemted = false;
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
		
	$scope.deletePerson = function(pesel) {
		if (!daoService.deleteRecord(getPerson(pesel))) {
			showErrMsg(messages.errors.delete);
			return;
		}
		var index = $scope.persons.indexOf(getPerson(pesel));
		if (index!=-1) {
			$scope.persons.splice(index, 1);
		}
	}
	
	$scope.editPerson = function(pesel) {
		//fill form with selected record
        $scope.editPersonClicked = true;
		preFillForm(utilService.copy(getPerson(pesel)));
		editedPesel = pesel;
        $scope.modalTitle = messages.labels.editRecord;
        $timeout(function(){$scope.editPersonClicked = false;}, 100);
	}
	
	$scope.addPerson = function() {
		//fill form with empty record
		preFillForm(daoService.getEmptyRecord());
        $scope.modalTitle = messages.labels.addRecord;
		editedPesel = "";
	}
	
	$scope.savePerson = function() {
		if (!$scope.personForm.$valid) {
            showErrMsg(messages.errors.validationErrors);
			$scope.personForm.failedAttemted = true;
			return;
		}
		$scope.personForm.failedAttemted = false;
		if (editedPesel != "") {
			if(editedPesel!=$scope.person.pesel) {
				if (getPerson($scope.person.pesel)!=null) {
					showErrMsg(messages.errors.nonUniquePrimaryKey);
					return;
				}
			}
			if (!daoService.updateRecord($scope.person)) {
				showErrMsg(messages.errors.update);
				return;
			}
			var index = $scope.persons.indexOf(getPerson(editedPesel));
			$scope.persons[index] = $scope.person;
		}
		else {
			if (!daoService.addRecord($scope.person)) {
				showErrMsg(messages.errors.add);
				return;
			}
			$scope.persons.push($scope.person)
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
        if (!$scope.editPersonClicked) {
            formService.assign(obj, $scope.person);
        }
        //changing random variable to trigger $onChange event on each component which want to listen
        $scope.random = {'val': Math.random().toString(36).substring(7)};
	}		
	
	$scope.evalPattern = function(obj) {
		return utilService.evalPatternCondition(obj, $scope.person);
	}
    
    $scope.$watch('personForm.$valid', function(newVal, oldVal) {
        if (newVal==true) {
            $scope.deleteMsg('err');
        }
        else if ($scope.personForm.failedAttemted==true) {
            showErrMsg(messages.errors.validationErrors);
        }
    });
    
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
                    placeholder: "Filter by: "+columnName,
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