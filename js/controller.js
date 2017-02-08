app.controller('CRUDAppController', function ($scope, $rootScope, formService, daoService, utilService, configService, $timeout) {
    
    $(document).ready(function() {
        $("#formModal").on('hidden.bs.modal', function () {
            $scope.showForm = false;   
            $scope.$apply();
        })
        
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
            var dateType = configService.getMetadataByName(this.column).type;
            switch(dateType) {
                case 'textarea':
                case 'text':
                    this.showTextFilter();
                    break;
                case 'number':
                case 'date':
                    this.showRangeFilter(dateType);
                    break;
                case 'checkbox':
                    this.showCheckboxFilter();
                    break;
                case 'select':
                case 'multiselect':
                case 'radio':
                    this.showSelectFilter();
                    break;
            } 
        },
               
        showTextFilter: function() {
            $(".filter").hide();
            $("#textFilter").show();
            
            $("#textFilter").val(this.filterValues[this.column]);
        },

        showRangeFilter: function(type) {
            //alert("showNumberFilter");
            $(".filter").hide();
            $("#"+type+"FilterFrom").show();
            $("#"+type+"FilterTo").show();
            
            if (this.filterValues[this.column] != undefined) {
                $("#"+type+"FilterTo").val(this.filterValues[this.column].to);
                $("#"+type+"FilterFrom").val(this.filterValues[this.column].from);
            }
        },
        
        showCheckboxFilter: function() {
            //alert("showCheckboxFilter");
            $(".filter").hide();
            $("#checkboxFilter").show();
            
            if (this.filterValues[this.column] != undefined) {
                $("#checkboxFilter").val(this.filterValues[this.column]);
            }
        },
        
        showSelectFilter: function() {
            //alert("showSelectFilter");
            this.availableOpts = configService.getMetadataByName(this.column).availableOpts;
            $(".filter").hide();
            $("#selectFilterSelect").show();
            $("#selectFilterInput").show();
            
            if (this.filterValues[this.column] != undefined) {
                $("#selectFilterInput").val(this.filterValues[this.column]);
            }
        },
        
        updateSelectFilter: function() {
            var oldVal = $("#selectFilterInput").val();
            var separator = " ";
            if (oldVal!="") {
                separator = " or ";
            }
            var newVal = $("#selectFilterInput").val() + separator + $("#selectFilterSelect").val();
            if (oldVal.indexOf($("#selectFilterSelect").val()) == -1) {
                $("#selectFilterInput").val(newVal);
            }
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
                    if (!(utilService.isEmpty($("#numberFilterFrom").val())) || (utilService.isEmpty($("#numberFilterTo").val()))) {
                        this.filterValues[this.column] = {from: $("#numberFilterFrom").val(), to: $("#numberFilterTo").val()};
                    }
                    break;
                case 'date':
                    if (!(utilService.isEmpty($("#dateFilterFrom").val())) || (utilService.isEmpty($("#dateFilterTo").val()))) {
                        this.filterValues[this.column] = {from: $("#dateFilterFrom").val(), to: $("#dateFilterTo").val()};
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
                    if (!utilService.isEmpty($("#selectFilterInput").val())) {
                        this.filterValues[this.column] = $("#selectFilterInput").val();
                    }
                    break;
            } 
            $('#filterIcon_' + this.column).addClass("highlighted");
            //alert(JSON.stringify(this.filterValues[this.column]));
        },
        
        showAddFilterBtn: function() {
            return utilService.isEmpty(this.filterValues[this.column]);
        },
        
        delFilter: function() {
            $(".filter").val("");
            $('#filterIcon_' + this.column).removeClass("highlighted");
            this.filterValues[this.column] = null;
        },
        
        showFilter: function(name) {
            this.column = name;
            this.update();
        }
                 
    };
    
});