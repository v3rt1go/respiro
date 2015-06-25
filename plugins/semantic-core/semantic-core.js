module.exports = function SemanticCoreModule(pb) {

  /**
   * SamplePlugin - A sample for exemplifying what the main module file should
   * look like.
   *
   * @author Brian Hyder <brian@pencilblue.org>
   * @copyright 2015 PencilBlue, LLC
   */
  function SemanticCore() {}

  //pb dependencies
  var PluginService = pb.PluginService;

  /**
   * Called when the application is being installed for the first time.
   *
   * @param cb A callback that must be called upon completion.  cb(Error, Boolean).
   * The result should be TRUE on success and FALSE on failure
   */
  SemanticCore.onInstall = function(cb) {
    cb(null, true);
  };

  /**
   * Called when the application is uninstalling this plugin.  The plugin should
   * make every effort to clean up any plugin-specific DB items or any in function
   * overrides it makes.
   *
   * @param cb A callback that must be called upon completion.  cb(Error, Boolean).
   * The result should be TRUE on success and FALSE on failure
   */
  SemanticCore.onUninstall = function(cb) {
    cb(null, true);
  };

  /**
   * Called when the application is starting up. The function is also called at
   * the end of a successful install. It is guaranteed that all core PB services
   * will be available including access to the core DB.
   *
   * @param cb A callback that must be called upon completion.  cb(Error, Boolean).
   * The result should be TRUE on success and FALSE on failure
   */
  SemanticCore.onStartup = function(cb) {
    // Register config directives
    var pluginService = new PluginService();

    // CSS directives
    pb.TemplateService.registerGlobal('semantic_core_simpletextrotator_css_src', function(flag, cb) {
      pluginService.getSetting('simpletextrotator_css_src', 'semantic-core', function(err, simpletextrotator_css_src) {
        cb(err, simpletextrotator_css_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_et_line_font_css_src', function(flag, cb) {
      pluginService.getSetting('et_line_font_css_src', 'semantic-core', function(err, etLineFontCSS) {
        cb(err, etLineFontCSS);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_magnific_popup_css_src', function(flag, cb) {
      pluginService.getSetting('magnific_popup_css_src', 'semantic-core', function(err, magnific_popup_css_src) {
        cb(err, magnific_popup_css_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_flexslider_css_src', function(flag, cb) {
      pluginService.getSetting('flexslider_css_src', 'semantic-core', function(err, flexslider_css_src) {
        cb(err, flexslider_css_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_animate_css_src', function(flag, cb) {
      pluginService.getSetting('animate_css_src', 'semantic-core', function(err, animate_css_src) {
        cb(err, animate_css_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_style_css_src', function(flag, cb) {
      pluginService.getSetting('style_css_src', 'semantic-core', function(err, style_css_src) {
        cb(err, style_css_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_custom_css_src', function(flag, cb) {
      pluginService.getSetting('custom_css_src', 'semantic-core', function(err, custom_css_src) {
        cb(err, custom_css_src);
      });
    });

    // JS directives
    pb.TemplateService.registerGlobal('semantic_core_YTPlayer_js_src', function(flag, cb) {
      pluginService.getSetting('YTPlayer_js_src', 'semantic-core', function(err, YTPlayer_js_src) {
        cb(err, YTPlayer_js_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_appear_js_src', function(flag, cb) {
      pluginService.getSetting('appear_js_src', 'semantic-core', function(err, appear_js_src) {
        cb(err, appear_js_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_simple_text_rotator_js_src', function(flag, cb) {
      pluginService.getSetting('simple_text_rotator_js_src', 'semantic-core', function(err, simple_text_rotator_js_src) {
        cb(err, simple_text_rotator_js_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_jq_bootstrap_validation_js_src', function(flag, cb) {
      pluginService.getSetting('jq_bootstrap_validation_js_src', 'semantic-core', function(err, jq_bootstrap_validation_js_src) {
        cb(err, jq_bootstrap_validation_js_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_gmaps_api_js_src', function(flag, cb) {
      pluginService.getSetting('gmaps_api_js_src', 'semantic-core', function(err, gmaps_api_js_src) {
        cb(err, gmaps_api_js_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_gmaps_custom_js_src', function(flag, cb) {
      pluginService.getSetting('gmaps_custom_js_src', 'semantic-core', function(err, gmaps_custom_js_src) {
        cb(err, gmaps_custom_js_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_isotope_js_src', function(flag, cb) {
      pluginService.getSetting('isotope_js_src', 'semantic-core', function(err, isotope_js_src) {
        cb(err, isotope_js_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_images_loaded_js_src', function(flag, cb) {
      pluginService.getSetting('images_loaded_js_src', 'semantic-core', function(err, images_loaded_js_src) {
        cb(err, images_loaded_js_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_jquery_flexislider_js_src', function(flag, cb) {
      pluginService.getSetting('jquery_flexislider_js_src', 'semantic-core', function(err, jquery_flexislider_js_src) {
        cb(err, jquery_flexislider_js_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_jquery_magnific_popup_js_src', function(flag, cb) {
      pluginService.getSetting('jquery_magnific_popup_js_src', 'semantic-core', function(err, jquery_magnific_popup_js_src) {
        cb(err, jquery_magnific_popup_js_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_jquery_fitvids_js_src', function(flag, cb) {
      pluginService.getSetting('jquery_fitvids_js_src', 'semantic-core', function(err, jquery_fitvids_js_src) {
        cb(err, jquery_fitvids_js_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_smoothscroll_js_src', function(flag, cb) {
      pluginService.getSetting('smoothscroll_js_src', 'semantic-core', function(err, smoothscroll_js_src) {
        cb(err, smoothscroll_js_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_wow_js_src', function(flag, cb) {
      pluginService.getSetting('wow_js_src', 'semantic-core', function(err, wow_js_src) {
        cb(err, wow_js_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_contact_js_src', function(flag, cb) {
      pluginService.getSetting('contact_js_src', 'semantic-core', function(err, contact_js_src) {
        cb(err, contact_js_src);
      });
    });
    pb.TemplateService.registerGlobal('semantic_core_custom_js_src', function(flag, cb) {
      pluginService.getSetting('custom_js_src', 'semantic-core', function(err, custom_js_src) {
        cb(err, custom_js_src);
      });
    });

    cb(null, true);
  };

  /**
   * Called when the application is gracefully shutting down.  No guarantees are
   * provided for how much time will be provided the plugin to shut down.
   *
   * @param cb A callback that must be called upon completion.  cb(Error, Boolean).
   * The result should be TRUE on success and FALSE on failure
   */
  SemanticCore.onShutdown = function(cb) {
    cb(null, true);
  };

  //exports
  return SemanticCore;
};
