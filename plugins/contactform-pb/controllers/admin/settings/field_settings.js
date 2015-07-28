var Settings = require('./settings');
var CustomObjectService = require('../../../include/services/custom_object_service');

function FieldSettings(){
    this.service = new CustomObjectService();
}

util.inherits(FieldSettings, Settings);

FieldSettings.prototype.getPageSettings = function(callback){
    this.service.getSettings(callback);
};

FieldSettings.prototype.getTemplate = function(){
    return '/admin/settings/field_settings';
};

FieldSettings.prototype.getPills = function(){
    return this._getPills('field_settings');
};

FieldSettings.prototype.getNavLevel = function(){
    return ['contact_form', 'field_settings'];
};

FieldSettings.getRoutes = function(callback){
    var routes = [
        {
            method: 'get',
            path: '/admin/plugins/contactform-pencilblue/settings/fields',
            auth_required: true,
            access_level: ACCESS_EDITOR,
            content_type: 'text/html'
        }
    ];
    callback(null, routes);
};

module.exports = FieldSettings;
