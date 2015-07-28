function Settings(){}

Settings.prototype.getSettingsType = function(){
    return '';
};

Settings.prototype.getSettingsDocument = function(){
    return 'contact_form_settings';
};  

Settings.prototype.isEnabled = function(callback){
    this.getSettings(function(err, settings){
        if(err){ return callback(err); }
        if(!settings){ return callback(null, false); }
        return callback(null, settings.enabled);
    });
};

Settings.prototype.getSettings = function(callback){
    var type = this.getSettingsType();
    var doc = this.getSettingsDocument();
    var options = { where: { settings_type: type } };
    var dao  = new pb.DAO();
    dao.q(doc, options, function(err, settings){
        if(settings && settings.length > 0){ settings = settings[0]; }
        else { settings = null; }
        return callback(err, settings);
    });
};

Settings.prototype.setSettings = function(settings, callback){
    delete settings._id;
    var type = this.getSettingsType();
    var doc = this.getSettingsDocument();
    var options = { where: { settings_type: type } };
    var dao  = new pb.DAO();
    dao.q(doc, options, function(err, settingObject){
        if(err){ return callback(err); }
        if(settingObject.length > 0){
            settingObject = settingObject[0];
            pb.DocumentCreator.update(settings, settingObject);
        }
        else {
            settingObject = pb.DocumentCreator.create(doc, settings);
            settingObject.settings_type = type;
        }
        dao.save(settingObject, callback);
    });
};

Settings.prototype.removeAllSettings = function(callback){
    var doc = this.getSettingsDocument();
    var dao  = new pb.DAO();
    dao.delete({}, doc, callback);
};

module.exports = Settings;
