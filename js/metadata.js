var metadata = [
    {
        "name": "name",
        "type": "text",
        "errorMessages": {"required": "Field 'name' is required."},
        "assignParams": {
            "pseudonym":
                [
                    {"cond":"this[0]=='x'", "val":"this[0] + record.surname[0]"}, 
                    {"cond":"otherwise", "val":"this"}
                ],
            "vehicle":
                [
                    {"cond":"this[0]=='x'", "val":"bike"}, 
                    {"cond":"otherwise", "val":"motorbike"}
                ]
        },
        "validations": {"required":true},
        "desc": "Type your first name",
        "availableOpts": "",
        "label": "Name",
        "updateOn": "",
        "showInTable": true,
        "showInRecordView": true,
        "order": 1
    },
    {
        "name": "surname",
        "type": "text",
        "errorMessages": {"required": "Field 'surname' is required."},
        "assignParams": {"pseudonym":[{"cond":"true", "val":"record.name + this"}]},
        "validations": {"required":true},
        "desc": "Type your second name",
        "availableOpts": "",
        "label": "Surname",
        "updateOn": "",
        "showInTable": false,
        "showInRecordView": false,
        "order": 2
    },
    {
        "name": "pesel",
        "type": "text",
        "errorMessages": {"required": "Field 'pesel' is required.", "pattern": "Field 'pesel' should contains only number, and length: 11, and should match to field 'date of birth'"},
        "assignParams": {
            "sex":
                [
                    {"cond":"this.length==11 && this[9]%2==true", "val":"male"}, 
                    {"cond":"this.length==11 && this[9]%2==false", "val":"female"}, 
                    {"cond":"otherwise", "val":""}
                ], 
            "likeFootball":
                [
                    {"cond":"this.length==11 && this[9]%2==true", "val": "true"},
                    {"cond":"otherwise", "val":"false"}
                ],
            "dateOfBirth":
                [
                    {"cond":"this.length==11 && +(this[2]+this[3])>50", "val":"this[4]+this[5]+'-'+(+(this[2]+this[3])-80).toString()+'-18'+this[0]+this[1]"},
                    {"cond":"this.length==11 && +(this[2]+this[3])>20 && +(this[2]+this[3])<40", "val":"this[4]+this[5]+'-'+(+(this[2]+this[3])-20).toString()+'-20'+this[0]+this[1]"},
                    {"cond":"this.length==11 && +(this[2]+this[3])<20", "val":"this[4]+this[5]+'-'+this[2]+this[3]+'-19'+this[0]+this[1]"},
                    {"cond":"this.length==11", "val":"this[4]+this[5]+'-'+this[2]+this[3]+'-19'+this[0]+this[1]"},
                    {"cond":"otherwise", "val":""}
                ]
        },
        "validations": {"required":true, "pattern":"\\d{11}"},
        "desc": "Type your pesel (id) number",
        "availableOpts": "",
        "label": "Pesel",
        "updateOn": "blur",
        "showInTable": true,
        "showInRecordView": true,
        "order": 3,
        "primaryKey": true
    },
    {
        "name": "dateOfBirth",
        "type": "date",
        "errorMessages": {"required": "Field 'date of birth' is required.", "pattern": "Field 'date of birth' should contain valid date from year: 1900-2099 and match to pattern dd-mm-yyyy"},
        "assignParams": {
            "vehicle":
                [
                    {"cond": "(+this.substring(6, 10))<1998", "val":"car"},
                    {"cond": "otherwise", "val":"bike"}
                ]
        },
        "validations": {"required":true, "pattern":	"^(?:(?:31(-)(?:0?[13578]|1[02]))\\1|(?:(?:29|30)(-)(?:0?[1,3-9]|1[0-2])\\2))(?:(?:19|20)?\\d{2})$|^(?:29(-)0?2\\3(?:(?:(?:19|20)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\\d|2[0-8])(-)(?:(?:0?[1-9])|(?:1[0-2]))\\4(?:(?:19|20)?\\d{2})$"},
        "desc": "Type your date of bitrth",
        "availableOpts": "",
        "label": "Date of birth",
        "updateOn": "",
        "showInTable": true,
        "showInRecordView": false,
        "order": 4,
        "disabled": true,
        "format": "MMM Do YY"
    },
    {
        "name": "salary",
        "type": "number",
        "errorMessages": {"required": "Field 'salary' is required.", "number": "Value of field 'salary' should be the number", "min": "Value of field 'salary' is to less (should be bigger or equal than 0)", "max": "Value of this field is to big (should be less or equal than 1000)"},
        "assignParams": {},
        "validations": {"required":true, "min":"0", "max":"1000", "step":"10"},
        "desc": "Type your salary",
        "availableOpts": "",
        "label": "Salary",
        "updateOn": "",
        "showInTable": true,
        "showInRecordView": true,
        "order": 5,
        "prefix": "kaska:",
        "suffix":"$$$"
    },
    {
        "name": "sex",
        "type": "select",
        "errorMessages": {},
        "assignParams": {},
        "validations": {},
        "desc": "Type your sex",
        "availableOpts": [{"id":"male", "name":"Male"}, {"id":"female", "name":"Female"}],
        "label": "Sex",
        "updateOn": "blur",
        "showInTable": true,
        "showInRecordView": true,
        "disabled": true,
        "order": 6
    },
    {
        "name": "pseudonym",
        "type": "text",
        "errorMessages": {"required":"Pseudonym is required", "pattern": "Field 'pseudonym' should contains name or surname."},
        "assignParams": {},
        "validations": {"required":true, "pattern":"^.*(record.name|record.surname).*$"},
        "desc": "Type your pseudonym",
        "availableOpts": "",
        "label": "Pseudonym",
        "updateOn": "",
        "showInTable": true,
        "showInRecordView": true,
        "order": 8
    },
    {
        "name": "likeFootball",
        "type": "checkbox",
        "errorMessages": {"required": "You must love football!!"},
        "assignParams": {
            "pseudonym":
                [
                    {"cond": "this=='true'", "val":"record.pseudonym + ' RONALDO'"},
                    {"cond":"this!='true' && record.pseudonym.match('.* RONALDO')!=null", "val":"record.pseudonym.substring(0, record.pseudonym.indexOf(' RONALDO'))"}
                ]
        },
        "validations": {"required":true},
        "desc": "Check if you like football",
        "availableOpts": "",
        "label": "Like football",
        "updateOn": "",
        "showInTable": true,
        "showInRecordView": true,
        "order": 7,
        "aliases": {"true":"Yes", "false":"No"}
    },
    {
        "name": "vehicle",
        "type": "radio",
        "errorMessages": {"required":"Vehicle must be selected", "pattern":"Pattern is not fulfilled"},
        "assignParams": {
            "pseudonym":
                [
                    {"cond": "record.pseudonym==undefined || record.pseudonym==''", "val":"record.pseudonym"},
                    {"cond":"record.pseudonym.match('.*-.*er')==null", "val":"record.pseudonym + ' - ' + this + 'er'"},
                    {"cond":"otherwise", "val":"record.pseudonym.substring(0, record.pseudonym.indexOf('-')-1) + ' - ' + this + 'er'"}
                ],
            "advantages":
                [
                    {"cond": "this=='bike'", "val": "['smart']"},
                    {"cond": "this=='motorbike'", "val": "['punctual']"},
                    {"cond": "otherwise", "val": ""}
                ]
        },
        "validations": {"required":true, "pattern":"^.*ike$"},
        "desc": "Select your vehicle",
        "availableOpts": [{"id":"car", "name":"Car"}, {"id":"train", "name":"Train"}, {"id":"bike", "name":"Bike"}, {"id":"motorbike", "name":"Motorike"}],
        "label": "Vehicle",
        "updateOn": "",
        "showInTable": true,
        "showInRecordView": true,
        "order": 10
    },
    {
        "name": "advantages",
        "type": "multiselect",
        "errorMessages": {"required":"Dont you have any advantages?", "pattern": "There is lack of 's' letter"},
        "assignParams": {
            "salary":
                [
                    {"cond": "this.contains('smart')", "val": "5000"},
                    {"cond": "otherwise", "val": "500"}
                ]
        },
        "validations": {"required":true, "pattern":"^.*s|S|e.*$"},
        "desc": "Check your advantages (don't check punctual)",
        "availableOpts": [{"id":"punctual", "name":"Punctual"}, {"id":"clever", "name":"Clever"}, {"id":"conscientious", "name":"Conscientious"}, {"id":"smart", "name":"Smart"}],
        "label": "Advantages",
        "updateOn": "blur",
        "showInTable": true,
        "showInRecordView": true,
        "order": 11
    },
    {
        "name": "dateOfAffiliating",
        "type": "date",
        "errorMessages": {"pattern": "Field 'date of affiliating' should contain valid date from year: 1900-2099 and match to pattern dd-mm-yyyy"},
        "assignParams": {},
        "validations": {"pattern":"^(?:(?:31(-)(?:0?[13578]|1[02]))\\1|(?:(?:29|30)(-)(?:0?[1,3-9]|1[0-2])\\2))(?:(?:19|20)?\\d{2})$|^(?:29(-)0?2\\3(?:(?:(?:19|20)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\\d|2[0-8])(-)(?:(?:0?[1-9])|(?:1[0-2]))\\4(?:(?:19|20)?\\d{2})$"},
        "desc": "Type your date of affiliating",
        "availableOpts": "",
        "label": "Date of affiliating",
        "updateOn": "blur",
        "showInTable": true,
        "showInRecordView": true,
        "order": 12,
        "format": "DD-MM-YYYY"
    }
];