var PluginService = require('../../../include/services/plugin_service');

function Settings(){}

util.inherits(Settings, pb.BaseController);

Settings.prototype.render = function(callback) {
    this.getPageSettings(function(err, settings){
        if(!settings){ settings = { enabled: false }; }
        
        var pills = this.getPills();
        var navLevel = this.getNavLevel();
        var objects = {
            navigation: pb.AdminNavigation.get(this.session, navLevel, this.ls),
            pills: pills,
            settings: settings
        };

        this.ts.registerLocal('angular_script', '');

        var angularObjects = new pb.TemplateValue(pb.js.getAngularObjects(objects), false);
        this.ts.registerLocal('angular_objects', angularObjects);

        var template = this.getTemplate();
        this.ts.load(template, function(err, result) {
            callback({ content: result });
        });

    }.bind(this));
};

Settings.prototype.getNavLevel = function(){
    return ['contact_form'];
};

Settings.prototype.getPageSettings = function(callback){
    return callback();
};

Settings.prototype.getTemplate = function(){
    return '';
};

Settings.prototype.getPills = function(){
    return [];
};

Settings.getRoutes = function(callback){
    callback(null, []);
};


Settings.prototype._getPills = function(target){
    var pills = this._getAllPills();
    var index = this._findPill(pills, target);
    var spliced = pills.splice(index, 1);
    var backPill = this._getBackPill(spliced[0].title);
    pills.unshift(backPill);
    return pills
};

Settings.prototype._findPill = function(pills, name){
    for (var i = 0; i < pills.length; i++) {
        var pill = pills[i]
        if(pill.name === name){
            return i;
        }
    };
};

Settings.prototype._getBackPill = function(title){
    return {
        name: 'content_settings',
        title: title,
        icon: 'chevron-left',
        href: '/admin/plugins/contactform-pencilblue/settings'
    };
};

Settings.prototype._getAllPills = function(){
    var service = new PluginService();
    return service.getSettingsNavigation();
};


module.exports = Settings;
