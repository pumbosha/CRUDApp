$(document).ready(function() {
    $("#tableContent table thead td.operationsColumn").height($("#tableContent table thead").height()-12);

    $("#tableName i").click(function() {
        if ($("#tableName i").hasClass("fa-chevron-down")) {
            $("#tableName i").removeClass("fa-chevron-down").addClass("fa-chevron-up");
            $("#tableDesc").show('fast');
        }
        else {
            $("#tableName i").removeClass("fa-chevron-up").addClass("fa-chevron-down");
            $("#tableDesc").hide('fast');
        }
    });

    $('[data-toggle="tooltip"]').tooltip({
        trigger : 'hover'
    })  

    $(".dataCol").click(function() {
        $(this).parent().toggleClass("highlighted");
    })

    $("#tableContent table thead th").each(function() {
       $(this).css('min-width', $(this).width()+50); 
    });

    $("#multiselectFilter").select2({
        placeholder: "",
    });

    $("#dateFilter").daterangepicker({
        showDropdowns: true,
         linkedCalendars: false,
        locale: {
            format: "DD-MM-YYYY",
            cancelLabel: messages.labels.cancelDateRangePicker,
            applyLabel: messages.labels.applyDateRangePicker
        }
    });

    $("#dateFilter").on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
    });

});