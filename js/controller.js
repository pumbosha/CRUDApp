app.controller('CRUDAppController', function($scope, $rootScope, formService, daoService, utilService, configService) {
			
	$scope.initGlobalVariables = function() {	
		$scope.personForm.failedAttemted = false;
		$rootScope.form = $scope.personForm;
	}
	
	var editedPesel = "";
	
	var getPerson = function(pesel) {
		for(var i=$scope.persons.length-1; i>=0; i--) {
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
	
	$scope.errorMessages = configService.getErrorMessages();
	
	$scope.assignParams = configService.getAssignParams();
	
	$scope.validations = configService.getValidations();
	
	$scope.persons = daoService.getRecords();
	
	$scope.showForm = false;
	
	$scope.succMsg = "";
	
	$scope.errMsg = "";
	
	$scope.toggleForm = function() {
		$scope.personForm.failedAttemted = false;
		$scope.showForm = !$scope.showForm;
	}
		
	$scope.deletePerson = function(pesel) {
		if (!daoService.deleteRecord(getPerson(pesel))) {
			showErrMsg(crudErrors.delete);
			return;
		}
		var index = $scope.persons.indexOf(getPerson(pesel));
		if (index!=-1) {
			$scope.persons.splice(index, 1);
		}
	}
	
	$scope.editPerson = function(pesel) {
		//fill form with selected record
		preFillForm(utilService.copy(getPerson(pesel)));
		editedPesel = pesel;
	}
	
	$scope.addPerson = function() {
		//fill form with empty record
		preFillForm(daoService.getEmptyRecord());
		editedPesel = "";
	}
	
	$scope.savePerson = function() {
		if (!$scope.personForm.$valid) {
			showErrMsg("Form contains validation errors.");
			$scope.personForm.failedAttemted = true;
			return;
		}
		$scope.personForm.failedAttemted = false;
		if (editedPesel != "") {
			if(editedPesel!=$scope.person.pesel) {
				if (getPerson($scope.person.pesel)!=null) {
					showErrMsg("Person with this pesel already exists");
					return;
				}
			}
			if (!daoService.updateRecord($scope.person)) {
				showErrMsg(crudErrors.update);
				return;
			}
			var index = $scope.persons.indexOf(getPerson(editedPesel));
			$scope.persons[index] = $scope.person;
		}
		else {
			if (!daoService.addRecord($scope.person)) {
				showErrMsg(crudErrors.add);
				return;
			}
			$scope.persons.push($scope.person)
		}
		
		showSuccMsg("Changes saved successfully.");
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
		formService.assign(obj, $scope.person);
	}
	
	$scope.evalPattern = function(obj) {
		//alert("COS SIE ZMIENILO: "+JSON.stringify(obj));
		if (typeof $scope.person === undefined) {
			return null;
		}
		return utilService.evalPatternCondition(obj, $scope.person);
	}
	
	$scope.updateModelChbx = function(field, id) {
		formService.updateModelChbx(field, id);
	}
});