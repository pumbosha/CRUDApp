app.component('crudLabel', {
	template: "<label><ng-transclude ng-show=\"!$ctrl.isDescDefined\"></ng-transclude><abbr ng-show=\"$ctrl.isDescDefined\" title=\"{{$ctrl.desc}}\" class=\"hint\"><ng-transclude></ng-transclude></abbr><span ng-show=\"$ctrl.isRequiredMark\" class=\"requiredMark\">*</span></label>",
	controller: function() {
		var ctrl = this;
		ctrl.isRequiredMark = (ctrl.requiredMark!=undefined && ctrl.requiredMark!='false');
		ctrl.isDescDefined = (ctrl.desc!='');
	},
	bindings: {
		desc: '@',
		requiredMark: '@'
	},
	transclude: true
});

app.component('crudInput', {
	templateUrl: "crudInput.htm",
	bindings: {
		type: "@",
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
		updateOn: '@updateon',
		availableOpts: '<availableopts',
		validationMode: '@validationmode',
		listener: '<listenon'
	},
	controller: function($scope, $rootScope, utilService) {
		var ctrl = this;
		ctrl.form = $rootScope.form;
		ctrl.required = ctrl.validations!=undefined ? ctrl.validations.required : false;
		ctrl.pattern = ctrl.evalParamsMethod({params: ctrl.validations!=undefined ? ctrl.validations.pattern: ''});
		
		if (ctrl.listener!=undefined) {
			ctrl.$onChanges = function(changeObj) {
				//Trigerring updating pattern by changed 'listener' variable
				if (changeObj.listener) {
					ctrl.pattern = ctrl.evalParamsMethod({params: ctrl.validations!=undefined ? ctrl.validations.pattern: ''});
				}
			}
		}
		
		if (ctrl.type==="text") {
		}
		else if (ctrl.type==="number") {
			this.templateUrl = "crudInput.htm";
			ctrl.pattern = null;
			ctrl.min = ctrl.validations!=undefined ? ctrl.validations.min: null;
			ctrl.max = ctrl.validations!=undefined ? ctrl.validations.max: null;
			ctrl.step = ctrl.validations!=undefined ? ctrl.validations.step: null;
		}
		else if (ctrl.type==="radio") {	
		}
		
		ctrl.modelOptions = {updateOn:ctrl.updateOn};
		
		ctrl.getClass = function(item) {
			if (!item.id.match(ctrl.pattern)) {
				return "disabled";
			}
			return "";
		};
		
		$scope.$watch("$ctrl.model", function() {
			if (ctrl.assignParams!=undefined) {
				ctrl.onchange({assgnprms: utilService.replaceThisKeyword(ctrl.assignParams, ctrl.model)});
			}
		});
		
		ctrl.getTemplate = function() {
			if (ctrl.type==="text" || ctrl.type==="number") {
				return "crudSimpleInput.htm";
			}
			else if (ctrl.type==="radio") {
				return "crudRadioInput.htm";
			}
			else if (ctrl.type==="checkbox") {
				return "crudChbxInput.htm";
			}
		};
	},
	transclude: true
});

app.component('crudError', {
	template: "<div ng-show='$ctrl.ifShowError()' class='error'>{{$ctrl.showError()}}</div>",
	controller: function() {
		var ctrl = this;
		ctrl.dirty = "true";
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
			return ((ctrl.dirty=='false' || ctrl.submitAttempted) || isDirty==true) && isInvalid==true;
		}
	},
	bindings: {
		dirty: '@',
		field: '<',
		errorMessages: '<errormessages',
		submitAttempted: '<submitattempted'
	}
});	