app.component('crudLabel', {
	templateUrl: 'templates/crudLabel.htm',
	controller: function() {
		var ctrl = this;
		ctrl.isRequiredMark = (ctrl.requiredMark!='' && ctrl.requiredMark!=undefined && ctrl.requiredMark!='false');
		ctrl.isDescDefined = (ctrl.desc!='');
	},
	bindings: {
		desc: '@',
		requiredMark: '@'
	},
	transclude: true
});

app.component('crudInput', {
	templateUrl: 'templates/crudInput.htm',
	bindings: {
		type: '@',
		assignParams: '<assignparams',
		updateOn: '@updateon',
		model: '=',
		onchange: '&change',
		evalParamsMethod: '&valid',
		name: '@',
		validations: '<',
		desc: '@',
		errorMessages: '<errormessages',
		disabled: '@',
		availableOpts: '<availableopts',
		validationMode: '@validationmode',
		listener: '<listenon'
	},
	controller: function($scope, $rootScope, utilService) {
		var ctrl = this;
		ctrl.form = $rootScope.form;
		ctrl.required = ctrl.validations!=undefined ? ctrl.validations.required : false;
		ctrl.pattern = ctrl.evalParamsMethod({params: ctrl.validations!=undefined ? ctrl.validations.pattern: ''});
        ctrl.componentClass = 'form-control ';
		
		if (ctrl.listener!=undefined) {
			ctrl.$onChanges = function(changeObj) {
				//Trigerring updating pattern by changed 'listener' variable
                //'Called whenever one-way bindings are updated.'
				if (changeObj.listener) {
                    //alert('ONCHANGES: '+ctrl.name);
					ctrl.pattern = ctrl.evalParamsMethod({params: ctrl.validations!=undefined ? ctrl.validations.pattern: ''});
				}
			}
		}
		
		if (ctrl.type==='number') {
			this.templateUrl = 'crudInput.htm';
			ctrl.pattern = null;
			ctrl.min = ctrl.validations!=undefined ? ctrl.validations.min: null;
			ctrl.max = ctrl.validations!=undefined ? ctrl.validations.max: null;
			ctrl.step = ctrl.validations!=undefined ? ctrl.validations.step: null;
		} else if (ctrl.type==='date') {
            ctrl.componentClass += 'datepicker';
        }
		
        if (ctrl.updateOn!='') { 
            ctrl.modelOptions = {updateOn:ctrl.updateOn};
        } 
        else {
            ctrl.modelOptions = {updateOn:'default'};
        }
        
		ctrl.getClass = function(item) {
			if (!item.id.match(ctrl.pattern)) {
				return 'disabled';
			}
			return '';
		};
		
		$scope.$watch('$ctrl.model', function() {
            //alert('WATCH: '+ctrl.model);
			if (ctrl.assignParams!=undefined) {
				ctrl.onchange({assgnprms: utilService.replaceThisKeyword(ctrl.assignParams, ctrl.model)});
			}
		});
        
        if (ctrl.type==='date') {
            $scope.$on('dateChanged', function (event, data) {
                if (data.name==ctrl.name) {
                    ctrl.model = data.newVal;
                }
                //alert("changed: "+ctrl.model+" name: "+data.name); 
            });
        }
		
		ctrl.getTemplate = function() {
			if (ctrl.type==='text' || ctrl.type==='number') {
				return 'templates/crudSimpleInput.htm';
			}
            else if (ctrl.type==='date') {
				return 'templates/crudDateInput.htm';
			}
			else if (ctrl.type==='radio') {
				return 'templates/crudRadioInput.htm';
			}
			else if (ctrl.type==='checkbox') {
				return 'templates/crudChbxInput.htm';
			}
            else if (ctrl.type==='select' || ctrl.type==='multiselect') {
				return 'templates/crudSelectInput.htm';
			}
		};
	},
	transclude: true
});

app.component('crudError', {
	templateUrl: 'templates/crudError.htm',
	controller: function() {
		var ctrl = this;
		ctrl.dirty = 'true';
		ctrl.showError = function() {
			var error = ctrl.field.$error;
			for (var key in error) {
				if (error[key]==true) {
					return ctrl.errorMessages[key];
				}
			}
		};
		ctrl.ifShowError = function() {
			var isDirty = ctrl.field==undefined ? false : ctrl.field.$dirty;
			var isInvalid = ctrl.field==undefined ? ctrl.required : ctrl.field.$invalid;
			return ((ctrl.dirty=='false' || ctrl.submitAttempted) || isDirty==true) && isInvalid==true
		}
	},
	bindings: {
		dirty: '@',
		field: '<',
		errorMessages: '<errormessages',
		submitAttempted: '<submitattempted'
	}
});	