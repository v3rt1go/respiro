var Settings = require('./settings');
var CustomObjectService = require('../../../include/services/custom_object_service');

function ObjectSettings(){
    this.service = new CustomObjectService();
}

util.inherits(ObjectSettings, Settings);

ObjectSettings.prototype.getPageSettings = function(callback){
    this.service.getSettings(callback);
};

ObjectSettings.prototype.getTemplate = function(){
    return '/admin/settings/object_settings';
};

ObjectSettings.prototype.getPills = function(){
    return this._getPills('custom_object_settings');
};

ObjectSettings.prototype.getNavLevel = function(){
    return ['contact_form', 'custom_object_settings'];
};

ObjectSettings.getRoutes = function(callback){
    var routes = [
        {
            method: 'get',
            path: '/admin/plugins/contactform-pencilblue/settings/objects',
            auth_required: true,
            access_level: ACCESS_EDITOR,
            content_type: 'text/html'
        }
    ];
    callback(null, routes);
};

module.exports = ObjectSettings;
