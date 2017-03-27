app.controller('CRUDAppController', function ($scope, $rootScope, tableService, formService, daoService, utilService, configService, localizationService, $timeout) {
    
    $(document).ready(function() {
        $("#formModal").on('hidden.bs.modal', function () {
            $scope.showForm = false;   
            $scope.$apply();
        });
        
        $scope.filter.update();
        $scope.sort.update();
        $scope.paging.update(1);
    });
    
    /******************************* Scope Variables *******************************/
	
	$scope.metadata = configService.getMetadata();
	
	$scope.records = daoService.getRecords();
    
    $scope.numOfItems = daoService.countRecords();
	
	$scope.showForm = false;
	
	$scope.succMsg = "";
	
	$scope.errMsg = "";
	
	$scope.random = {'val': Math.random().toString(36).substring(7)};
    
    $scope.editRecordClicked = false;
    
    $scope.selectedRecords = [];
    
    $scope.viewedRecord;
    
    /******************************* Functions *******************************/
    
    var getPrimaryKey = function() {
        for (var i=0;i<$scope.metadata.length;i++) {
            if ($scope.metadata[i].primaryKey==true) {
                return $scope.metadata[i].name;
            }
        }
        return null;
    }
    
	var getRecord = function (key) {
		for (var i=$scope.records.length-1; i>=0; i--) {
			if( $scope.records[i][primaryKey] == key) {
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
            $scope.toggleForm("form");
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
    
    /******************************* Variables *******************************/ 
    
	var editedKey = "";
    
    var primaryKey = getPrimaryKey();
    
    var firstShowForm = true;
    
    
    /******************************* Scope Functions *******************************/
    
    $scope.initGlobalVariables = function () {
		$scope.recordForm.failedAttemted = false;
		$rootScope.form = $scope.recordForm;
	}
	
    $scope.viewRecord = function(record) {
        $scope.viewedRecord = record;
        $scope.toggleForm("view");
    }
    
	$scope.toggleForm = function(mode) {
        if (mode=="view") {
            $('#viewModal').modal('toggle');
            return;
        }
		$scope.recordForm.failedAttemted = false;
		$scope.showForm = !$scope.showForm;
        $('#formModal').modal('toggle');
        $('[data-toggle="tooltip"]').tooltip({
            trigger : 'hover'
        })  
        
        if (firstShowForm==true) {
            firstShowForm = false;
            
            //datepicker
            
            $('.datepicker').each(function() {
                $(this).datepicker({
                    format: 'dd-mm-yyyy',
                    autoclose: true,
                    startDate: $(this).attr('datemin'),
                    endDate: $(this).attr('datemax'),
                }).on('changeDate', function(ev){                 
                    $(this).datepicker('hide');
                    $scope.$broadcast('dateChanged', {
                        name: $(this).attr('name'),
                        newVal: $(this).val()
                    });
                }).on('keydown',function(e) {
                    e.preventDefault();
                });
            });
        }
        $scope.errMsg = "";
	}
		
	$scope.deleteRecord = function(record) {
		if (!daoService.deleteRecord(record)) {
			showErrMsg(messages.errors.delete);
			return;
		}
		var index = $scope.records.indexOf(record);
		if (index!=-1) {
			$scope.records.splice(index, 1);
		}
	}
    
    $scope.deleteRecords = function() {
        for (var i=0; i<$scope.selectedRecords.length; i++) {
            $scope.deleteRecord($scope.selectedRecords[i]);
        }
    }
    
    $scope.selectRecord = function(record) {
        $scope.selectedRecords.push(record);
    }
	
	$scope.editRecord = function(record) {
        $scope.editRecordClicked = true;
		preFillForm(utilService.copy(record));
		editedKey = record[primaryKey];
        $scope.modalTitle = messages.labels.editRecord;
        $timeout(function(){$scope.editRecordClicked = false;}, 100);
	}
	
	$scope.addRecord = function() {
		preFillForm(daoService.getEmptyRecord());
        $scope.modalTitle = messages.labels.addRecord;
		editedKey = "";
	}
	
	$scope.saveRecord = function() {
		if (!$scope.recordForm.$valid) {
            showErrMsg(messages.errors.validationErrors);
			$scope.recordForm.failedAttemted = true;
			return;
		}
		$scope.recordForm.failedAttemted = false;
		if (editedKey != "") {
			if(editedKey!=$scope.record[primaryKey]) {
				if (getRecord($scope.record[primaryKey])!=null) {
					showErrMsg(messages.errors.nonUniquePrimaryKey);
					return;
				}
			}
			if (!daoService.updateRecord($scope.record)) {
				showErrMsg(messages.errors.update);
				return;
			}
			var index = $scope.records.indexOf(getRecord(editedKey));
			$scope.records[index] = $scope.record;
		}
		else {
            if (getRecord($scope.record[primaryKey])!=null) {
                showErrMsg(messages.errors.nonUniquePrimaryKey);
                return;
            }
			if (!daoService.addRecord($scope.record)) {
				showErrMsg(messages.errors.add);
				return;
			}
			$scope.records.push($scope.record)
		}
		showSuccMsg(messages.communicates.successSaveForm);
		$scope.toggleForm("form");
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
    
    $scope.exportToPdf = function() {
        var doc = new jsPDF();
        doc.fromHTML($('#viewRecordContent').html(), 15, 15);
        doc.save($scope.viewedRecord[primaryKey]+'.pdf');
    }
    
    $scope.sort = tableService.sort;
    $scope.filter = tableService.filter;
    $scope.paging = tableService.paging;
    
});