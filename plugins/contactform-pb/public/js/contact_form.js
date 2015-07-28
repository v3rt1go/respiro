window.ContactForm = (function($){

    'use strict';

    var contact = {
        url: '/plugin/contact/api/contact/send',
        errorElement: 'span',
        errorClass: 'help-block',
        rules: {
            name: {
                minlength: 3,
                maxlength: 25,
                required: true
            },
            phone: {
                simplePhone: true, 
                minlength: 3,
                maxlength: 15,
                required: false,
            },
            email: {
                minlength: 5,
                maxlength: 25,
                required: true,
                email: true
            },
            subject: {
                minlength: 4,
                maxlength: 30,
                required: true
            },
            message: {
                minlength: 3,
                maxlength: 5000,
                required: true
            },
        },
        alerts: {
            sending:    '#SendingAlert',
            error:      '#ErrorAlert',
            errormsg:   '#ErrorMessageAlert',
            success:    '#SuccessAlert'
        }
    };

    contact.onSubmit = function(form){
        var data = this.gatherData(form);
        var self = this;
        $.post(this.url, data, function(response){
            self.setAlert(form, 'success');
        })
        .fail(function(response, b, c){
            var json = response.responseJSON;
            if(json && json.message){
                var content = json.message;
                self.setAlert(form, 'errormsg', content);
            }
            else { self.setAlert(form, 'error'); }
            self.enableSubmit(form);
        });
    };

    contact.gatherData = function(form){
        var serialized =  form.serializeArray();
        var formObj = {};
        $.each(serialized, function(i, s){
            formObj[s['name']] = s['value']
        });
        return JSON.stringify(formObj);
    };

    contact.onInvalid = function(/*form*/){};

    contact.onHighlight = function(element){
        $(element).closest('.form-group').addClass('has-error');
    };

    contact.onUnHighlight = function(element) {
        $(element).closest('.form-group').removeClass('has-error');
    };

    contact.onErrorPlacement = function(error, element) {
        if(element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        }
        else { error.insertAfter(element); }
    };

    contact.clearAlerts = function(form){
        form.find('.alerter').hide();
    };

    contact.disableSubmit = function(form){
        form.find('#ContactSubmit').attr('disabled', true); 
    };

    contact.enableSubmit = function(form){
        form.find('#ContactSubmit').attr('disabled', false); 
    };

    contact.setAlert = function(form, id, content){
        this.clearAlerts(form);
        var alert = this.alerts[id];
        if(!alert) { return; }
        var el = form.find(alert);
        if(content) { el.text(content); }
        el.show();
    };

    contact._onSubmit = function(source){
        var form = $(source);
        this.setAlert(form, 'sending');
        this.disableSubmit(form);
        this.onSubmit(form);
    };

    contact._onInvalid = function(evnt){
        var form = $(evnt.target);
        this.clearAlerts(form);
        this.onInvalid(form);
    };

    $(function(){

        $.validator.addMethod("simplePhone", function(phone_number, element) {
            phone_number = phone_number.replace(/\s+/g, "");
            return this.optional(element) || phone_number.match(/^[0-9]+$/);
        }, "Please specify a valid phone number");

        $('#ContactForm').validate({
            rules:              contact.rules,
            highlight:          contact.onHighlight,
            unhighlight:        contact.onUnHighlight,
            errorElement:       contact.errorElement,
            errorClass:         contact.errorClass,
            errorPlacement:     contact.onErrorPlacement,
            submitHandler:      function(f){ contact._onSubmit(f); },
            invalidHandler:     function(f){ contact._onInvalid(f); }
        });
    });

    return contact;

})(jQuery);