app.controller('CRUDAppController', function ($scope, $rootScope, formService, daoService, utilService, configService, $timeout) {
    
    $(document).ready(function() {
        $("#formModal").on('hidden.bs.modal', function () {
            $scope.showForm = false;   
            $scope.$apply();
        })
    });
	
    /******************************* Variables *******************************/ 
    
	var editedPesel = "";
	
    
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
});