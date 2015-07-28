var Settings = require('./settings');
var EmailService = require('../../../include/services/email_service');

function EmailSettings(){
    this.service = new EmailService();
}

util.inherits(EmailSettings, Settings);

EmailSettings.prototype.getPageSettings = function(callback){
    this.service.getSettings(callback);
};

EmailSettings.prototype.getTemplate = function(){
    return '/admin/settings/email_settings';
};

EmailSettings.prototype.getPills = function(){
    return this._getPills('emailer_settings');
};

EmailSettings.prototype.getNavLevel = function(){
    return ['contact_form', 'emailer_settings'];
};

EmailSettings.getRoutes = function(callback){
    var routes = [
        {
            method: 'get',
            path: '/admin/plugins/contactform-pencilblue/settings/email',
            auth_required: true,
            access_level: ACCESS_EDITOR,
            content_type: 'text/html'
        }
    ];
    callback(null, routes);
};

module.exports = EmailSettings;
