var CaptchaService = require('../../../include/services/captcha_service');
var EmailService = require('../../../include/services/email_service');
var CustomObjectService = require('../../../include/services/custom_object_service');

var BaseController      = pb.BaseController;
var ApiActionController = pb.ApiActionController;

/**
 * Controller to properly route and handle remote calls to Clean Media Service
 * @class SettingsApiController
 * @constructor
 * @extends ApiActionController
 */
function SettingsApiController(){
    this.service = new CaptchaService();
};

util.inherits(SettingsApiController, ApiActionController);

/**
 * The hash of actions that are available to execute for this controller. When
 * the key's value is TRUE, it indicates that a valid object ID must be part of
 * the request as a path variable "id".
 */
var ACTIONS = {
    captcha:    false,
    email:      false,
    objects:    false
};

SettingsApiController.prototype.getActions = function(){
    return ACTIONS;
};

SettingsApiController.prototype.getPostParams = function(callback){
    this.getJSONPostParams(function(err, params){
        return callback(null, params);
    });
};

SettingsApiController.prototype.validatePostParameters = function(action, post, callback) {
    callback(null, []);
};

SettingsApiController.prototype._getResponse = function(mode, data){
    var message = this.ls.get(mode) + ' ' + this.ls.get('SAVED');
    var content = BaseController.apiResponse(BaseController.API_SUCCESS, message, data);
    return { content: content };
};

SettingsApiController.prototype._getError = function(error){
    var loc = this.ls.get('ERROR_SAVING');
    var content = BaseController.apiResponse(BaseController.API_FAILURE, loc, error);
    return { code: 500, content: content };
};

SettingsApiController.prototype.captcha = function(callback) {
    var post = this.post;
    if(!post){ return callback(this._getError()); }
    var service = new CaptchaService();
    service.setSettings(post, function(err, result){
        if(util.isError(err)){ return callback(this._getError()); }
        return callback(this._getResponse('CF_ADMIN_CAPTCHA_SETTINGS', result));
    }.bind(this));
};

SettingsApiController.prototype.email = function(callback) {
    var post = this.post;
    if(!post){ return callback(this._getError()); }
    var service = new EmailService();
    service.setSettings(post, function(err, result){
        if(util.isError(err)){ return callback(this._getError()); }
        return callback(this._getResponse('CF_ADMIN_EMAILER_SETTINGS', result));
    }.bind(this));
};

SettingsApiController.prototype.objects = function(callback) {
    var post = this.post;
    if(!post){ return callback(this._getError()); }
    var service = new CustomObjectService();
    service.setSettings(post, function(err, result){
        if(util.isError(err)){ return callback(this._getError()); }
        return callback(this._getResponse('CF_ADMIN_CUSTOM_OBJECTS_SETTINGS', result));
    }.bind(this));
};

SettingsApiController.getRoutes = function(callback) {
    var routes = [
        {
            method: 'post',
            path: "/plugin/contact/api/settings/:action",
            auth_required: true,
            access_level: ACCESS_ADMINISTRATOR,
            content_type: 'application/json'
        }
    ];
    callback(null, routes);
};

module.exports = SettingsApiController;
