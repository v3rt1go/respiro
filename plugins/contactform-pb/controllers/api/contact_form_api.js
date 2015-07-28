var util = require('util');
var async = require('async');
var sanitizeHtml = require('sanitize-html');
var CaptchaService = require('../../include/services/captcha_service');
var EmailService = require('../../include/services/email_service');
var CustomObjectService = require('../../include/services/custom_object_service');

var BaseController      = pb.BaseController;
var ApiActionController = pb.ApiActionController;

function ContactForm(){}

util.inherits(ContactForm, pb.ApiActionController);

/**
 * The hash of actions that are available to execute for this controller. When
 * the key's value is TRUE, it indicates that a valid object ID must be part of
 * the request as a path variable "id".
 */
var ACTIONS = {
    send : false
};

ContactForm.prototype.getActions = function(){
    return ACTIONS;
};

ContactForm.prototype.getPostParams = function(callback){
    this.getJSONPostParams(function(err, params){
        return callback(null, params);
    });
};

ContactForm.prototype.validatePostParameters = function(action, post, callback) {
    return callback(null, []);
};

ContactForm.prototype.send = function(callback){
    var post = this.post;
    if(this.checkValidationErrors(post)){
        return this.sendValidationError(post, callback);
    }
    this.validateCaptcha(post, function(err, validCaptcha){
        if(err){ return this.sendApiError(post, callback); }
        if(!validCaptcha){ return this.sendCaptchaError(post, callback); }

        //Validated + Captcha Ok.
        var sanitized = this.sanitize(post);
        
        var handlers = this.getHandlers();

        this.handle(handlers, sanitized, function(err){
            if(err){ return this.sendApiError(sanitized, callback); }
            return this.sendApiSuccess(sanitized, callback);
        }.bind(this));

    }.bind(this));
};

ContactForm.prototype.sendApiSuccess = function(data, callback){
    var result = this._getSuccess(data, 'CF_API_SENT');
    return callback(result);
};

ContactForm.prototype.sendValidationError = function(data, callback){
    var error = this._getError(data, 'CF_API_VALIDATION');
    return callback(error);
};

ContactForm.prototype.sendCaptchaError = function(data, callback){
    var error = this._getError(data, 'CF_API_CAPTCHA_VALIDATION');
    return callback(error);
};

ContactForm.prototype.sendApiError = function(data, callback){
    var error = this._getError(data, 'CF_API_ERROR');
    return callback(error);
};

ContactForm.prototype.handle = function(handlers, data, callback){
    var handled = false;
    async.each(handlers, function(handler, cb){
        handler.isEnabled(function(err, enabled){
            if(!enabled){ return cb(); }
            handler.handle(data, cb);
            handled = true;
        });
    }, function(err){
        if(!err && !handled){ err = new Error('No Handlers Enabled'); }
        return callback(err);
    });
};

ContactForm.prototype.getHandlers = function(){
    return [
        new EmailService(),
        new CustomObjectService()
    ];
};

ContactForm.prototype.validateCaptcha = function(data, callback){
    var captcha = new CaptchaService();
    captcha.isEnabled(function(err, enabled){
        if(err){ return callback(err); }
        if(!enabled){ return callback(null, true); }
        var key = data.sckey;
        var value = data.scvalue;
        if(!key || !value){ return callback(null, false); }
        return captcha.validate(key, value, callback);
    });
};

ContactForm.prototype.checkValidationErrors = function(data){
    if(!data){ return true; }
    return this.hasRequiredParams(data, [
        'name',
        'email',
        'subject',
        'message'
    ]);
};

ContactForm.prototype.sanitize = function(data){
    var options = {
        allowedTags: false,
        allowedAttributes: false
    };
    return {
        name:       sanitizeHtml(data.name, options),
        phone:      sanitizeHtml(data.phone, options),
        email:      sanitizeHtml(data.email, options),
        subject:    sanitizeHtml(data.subject, options),
        message:    sanitizeHtml(data.message, options),
    };
};

ContactForm.prototype._getError = function(data, message){
    var loc = this.ls.get(message);
    var err = BaseController.apiResponse(BaseController.API_FAILURE, loc, data);
    return { code: 500, content: err };
};

ContactForm.prototype._getSuccess = function(data, message){
    var loc = this.ls.get(message);
    var message = BaseController.apiResponse(BaseController.API_SUCCESS, loc, data);
    return { content: message };
};

ContactForm.getRoutes = function(callback){
    var routes = [
        {
            method:         'post',
            path:           '/plugin/contact/api/contact/:action',
            auth_required:  false,
            content_type:   'application/json'
        }
    ];
    callback(null, routes);
};

module.exports = ContactForm;
