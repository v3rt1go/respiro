/*
    Copyright (C) 2016  PencilBlue, LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

//dependencies
var async = require('async');
var algolia = require('algoliasearch');
var algoliaClient = algolia('WR309NBEBA', '1ecc1de09e36c94a260704bba1927949');
var searchIndex = algoliaClient.initIndex('articlesIndex');

module.exports = function BlogModule(pb) {

    //pb dependencies
    var util = pb.util;
    var config = pb.config;
    var PluginService = pb.PluginService;
    var TopMenu = pb.TopMenuService;
    var Comments = pb.CommentService;
    var ArticleService = pb.ArticleService;
    var contentService = new pb.ContentService();
    var externalProfiles = PluginService.getService('external_profiles', 'semantic-core');
    var blogArticlesService = PluginService.getService('blog_article_service', 'semantic-core');

    /**
     * Blog page of the pencilblue theme
     *
     * @author Blake Callens <blake@pencilblue.org>
     */
    function Blog() { }
    util.inherits(Blog, pb.BaseController);

    Blog.prototype.render = function (cb) {
        var self = this;

        //determine and execute the proper call
        var section = self.req.pencilblue_section || null;
        var topic = self.req.pencilblue_topic || null;
        var article = self.req.pencilblue_article || null;
        var page = self.req.pencilblue_page || null;

        contentService.getSettings(function (err, contentSettings) {
            self.gatherData(function (err, data) {
                var articleService = new pb.ArticleService();
                articleService.getMetaInfo(data.content[0], function (metaKeywords, metaDescription, metaTitle, metaThumbnail) {

                    self.ts.reprocess = false;
                    self.ts.registerLocal('meta_keywords', metaKeywords);
                    self.ts.registerLocal('meta_desc', metaDescription);
                    self.ts.registerLocal('meta_title', metaTitle);
                    self.ts.registerLocal('meta_lang', config.localization.defaultLocale);
                    self.ts.registerLocal('meta_thumbnail', metaThumbnail);
                    self.ts.registerLocal('current_url', self.req.url);
                    self.ts.registerLocal('navigation', new pb.TemplateValue(data.nav.navigation, false));
                    self.ts.registerLocal('account_buttons', new pb.TemplateValue(data.nav.accountButtons, false));
                    self.ts.registerLocal('infinite_scroll', function (flag, cb) {
                        if (article || page) {
                            cb(null, '');
                        }
                        else {
                            var infiniteScrollScript = pb.ClientJs.includeJS('/js/infinite_article_scroll.js');
                            if (section) {
                                infiniteScrollScript += pb.ClientJs.getJSTag('var infiniteScrollSection = "' + section + '";');
                            }
                            else if (topic) {
                                infiniteScrollScript += pb.ClientJs.getJSTag('var infiniteScrollTopic = "' + topic + '";');
                            }
                            cb(null, new pb.TemplateValue(infiniteScrollScript, false));
                        }
                    });
                    self.ts.registerLocal('articles', function (flag, cb) {
                        var tasks = util.getTasks(data.content, function (content, i) {
                            return function (callback) {
                                if (i >= contentSettings.articles_per_page) {//TODO, limit articles in query, not throug hackery
                                    callback(null, '');
                                    return;
                                }

                                // We want to load only the blog articles
                                if (content[i].template === 'semantic-core|section') {
                                    // Add item to index
                                    searchIndex.addObject({
                                        headline: content[i].headline,
                                        subheading: content[i].subheading,
                                        url: content[i].url,
                                        seo_title: content[i].seo_title,
                                        meta_desc: content[i].meta_desc
                                    }, content[i].id, function(err, res) {
                                    });
                                    self.renderContent(content[i], contentSettings, data.nav.themeSettings, i, callback);
                                }
                            };
                        });
                        async.parallel(tasks, function (err, result) {
                            cb(err, new pb.TemplateValue(result.join(''), false));
                        });
                    });
                    self.ts.registerLocal('page_name', function (flag, cb) {
                        self.getContentSpecificPageName(util.isArray(data.content) && data.content.length > 0 ? data.content[0] : null, cb);
                    });

                    self.ts.registerLocal('angular', function(flag, cb) {

                        var objects = {
                            trustHTML: 'function(string){return $sce.trustAsHtml(string);}'
                        };
                        var angularData = pb.ClientJs.getAngularController(objects, ['ngSanitize']);
                        cb(null, angularData);
                    });

                    self.getTemplate(data.content, function (err, template) {
                        if (util.isError(err)) {
                            throw err;
                        }

                        externalProfiles.getProfiles(function (err, profiles) {
                            var loggedIn = pb.security.isAuthenticated(self.session);
                            var commentingUser = loggedIn ? Comments.getCommentingUser(self.session.authentication.user) : null;
                            var angularObjects = pb.ClientJs.getAngularObjects({
                                contentSettings: contentSettings,
                                loggedIn: loggedIn,
                                commentingUser: commentingUser,
                                articles: data.content,
                                profiles: profiles,
                                trustHTML: 'function(string){return $sce.trustAsHtml(string);}'
                            });
                            self.ts.registerLocal('angular_objects', new pb.TemplateValue(angularObjects, false));
                            self.ts.load(template, function (err, result) {
                                if (util.isError(err)) {
                                    throw err;
                                }
                                cb({ content: result });
                            });
                        });
                    });
                });
            });
        });
    };


    Blog.prototype.getTemplate = function (content, cb) {
        //check if we should just use whatever default there is.
        //this could fall back to an active theme or the default pencilblue theme.
        if (!this.req.pencilblue_article && !this.req.pencilblue_page) {
            cb(null, 'blog/index');
            return;
        }

        //now we are dealing with a single page or article. the template will be
        //judged based off the article's preference.
        if (util.isArray(content) && content.length > 0) {
            content = content[0];
        }
        var uidAndTemplate = content.template;

        //when no template is specified or is empty we no that the article has no
        //preference and we can fall back on the default (index).  We depend on the
        //template service to determine who has priority based on the active theme
        //then defaulting back to pencilblue.
        if (!pb.validation.validateNonEmptyStr(uidAndTemplate, true)) {
            pb.log.silly("ContentController: No template specified, defaulting to blog.");
            cb(null, "blog/index");
            return;
        }

        //we now know that the template was specified.  We have to split the value
        //to extract the intended theme and the template path
        var pieces = uidAndTemplate.split('|');

        //for backward compatibility we let the template service determine where to
        //find the template when no template is specified.  This mostly catches the
        //default case of "index"
        if (pieces.length === 1) {

            pb.log.silly("ContentController: No theme specified, Template Service will delegate [%s]", pieces[0]);
            cb(null, pieces[0]);
            return;
        }
        else if (pieces.length <= 0) {

            //shit's broke. This should never be the case but better safe than sorry
            cb(new Error("The content's template property provided an invalid value of [" + content.template + ']'), null);
            return;
        }

        //the theme is specified, we ensure that the theme is installed and
        //initialized otherwise we let the template service figure out how to
        //delegate.
        if (!pb.PluginService.isActivePlugin(pieces[0])) {
            pb.log.silly("ContentController: Theme [%s] is not active, Template Service will delegate [%s]", pieces[0], pieces[1]);
            cb(null, pieces[1]);
            return;
        }

        //the theme is OK. We don't gaurantee that the template is on the disk but we can testify that it SHOULD.  We set the
        //prioritized theme for the template service.
        pb.log.silly("ContentController: Prioritizing Theme [%s] for template [%s]", pieces[0], pieces[1]);
        this.ts.setTheme(pieces[0]);
        cb(null, pieces[1]);
    };


    Blog.prototype.gatherData = function (cb) {
        var self = this;
        var tasks = {

            //navigation
            nav: function (callback) {
                self.getNavigation(function (themeSettings, navigation, accountButtons) {
                    callback(null, { themeSettings: themeSettings, navigation: navigation, accountButtons: accountButtons });
                });
            },

            //articles, pages, etc.
            content: function (callback) {
                self.loadContent(callback);
            },
        };
        async.parallel(tasks, cb);
    };

    Blog.prototype.loadContent = function (articleCallback) {
        var section = this.req.pencilblue_section || null;
        var topic = this.req.pencilblue_topic || null;
        var article = this.req.pencilblue_article || null;
        var page = this.req.pencilblue_page || null;

        var service = new ArticleService();
        if (this.req.pencilblue_preview) {
            if (this.req.pencilblue_preview == page || article) {
                if (page) {
                    service.setContentType('page');
                }
                var where = pb.DAO.getIDWhere(page || article);
                where.draft = { $exists: true };
                where.publish_date = { $exists: true };
                service.find(where, articleCallback);
            }
            else {
                service.find({}, articleCallback);
            }
        }
        else if (section) {
            service.findBySection(section, articleCallback);
        }
        else if (topic) {
            service.findByTopic(topic, articleCallback);
        }
        else if (article) {
            service.findById(article, articleCallback);
        }
        else if (page) {
            service.setContentType('page');
            service.findById(page, articleCallback);
        }
        else {
            service.find({}, articleCallback);
        }
    };

    Blog.prototype.renderContent = function (content, contentSettings, themeSettings, index, cb) {
        var self = this;

        var isPage = content.object_type === 'page';
        var showByLine = contentSettings.display_bylines && !isPage;
        var showTimestamp = contentSettings.display_timestamp && !isPage;
        var ats = new pb.TemplateService(this.ls);
        self.ts.reprocess = false;
        ats.registerLocal('article_headline', new pb.TemplateValue('<a href="' + pb.UrlService.urlJoin('/article/', content.url) + '">' + content.headline + '</a>', false));
        ats.registerLocal('article_headline_nolink', content.headline);
        ats.registerLocal('article_subheading', content.subheading ? content.subheading : '');
        ats.registerLocal('article_subheading_display', content.subheading ? '' : 'display:none;');
        ats.registerLocal('article_id', content._id.toString());
        ats.registerLocal('article_index', index);
        ats.registerLocal('article_timestamp', showTimestamp && content.timestamp ? content.timestamp : '');
        ats.registerLocal('article_timestamp_display', showTimestamp ? '' : 'display:none;');
        ats.registerLocal('article_layout', new pb.TemplateValue(content.layout, false));
        ats.registerLocal('article_url', content.url);
        ats.registerLocal('display_byline', showByLine ? '' : 'display:none;');
        ats.registerLocal('author_photo', content.author_photo ? content.author_photo : '');
        ats.registerLocal('author_photo_display', content.author_photo ? '' : 'display:none;');
        ats.registerLocal('author_name', content.author_name ? content.author_name : '');
        ats.registerLocal('author_position', content.author_position ? content.author_position : '');
        ats.registerLocal('media_body_style', content.media_body_style ? content.media_body_style : '');

        ats.registerLocal('article_image', function(flag, cb) {
            console.log('checking media ...');
            if (content.article_media.length > 0) {
                console.log(content.article_media.length);
                var mediaService = new pb.MediaService();
                mediaService.renderById(content.article_media[0], function(err, html) {
                    if (err) {
                        cb(err);
                        return;
                    }

                    var mediaUrl = html.replace('<image src="', '').replace('" ></image>', '');
                    cb(null, mediaUrl);
                });
            } else {
                cb(null, '');
                return;
            }
        });
        ats.registerLocal('comments', function (flag, cb) {
            if (content.object_type === 'page' || !contentSettings.allow_comments) {
                cb(null, '');
                return;
            }

            self.renderComments(content, ats, function (err, comments) {
                cb(err, new pb.TemplateValue(comments, false));
            });
        });

        console.log('preparing to load view');
        ats.load('blog/articles', cb);
    };

    Blog.prototype.renderComments = function (content, ts, cb) {
        var self = this;
        var commentingUser = null;
        if (pb.security.isAuthenticated(this.session)) {
            commentingUser = Comments.getCommentingUser(this.session.authentication.user);
        }

        ts.registerLocal('user_photo', function (flag, cb) {
            if (commentingUser) {
                cb(null, commentingUser.photo ? commentingUser.photo : '');
            }
            else {
                cb(null, '');
            }
        });
        ts.registerLocal('user_position', function (flag, cb) {
            if (commentingUser && util.isArray(commentingUser.position) && commentingUser.position.length > 0) {
                cb(null, ', ' + commentingUser.position);
            }
            else {
                cb(null, '');
            }
        });
        ts.registerLocal('user_name', commentingUser ? commentingUser.name : '');
        ts.registerLocal('display_submit', commentingUser ? 'block' : 'none');
        ts.registerLocal('display_login', commentingUser ? 'none' : 'block');
        ts.registerLocal('comments_length', util.isArray(content.comments) ? content.comments.length : 0);
        ts.registerLocal('individual_comments', function (flag, cb) {
            if (!util.isArray(content.comments) || content.comments.length == 0) {
                cb(null, '');
                return;
            }

            var tasks = util.getTasks(content.comments, function (comments, i) {
                return function (callback) {
                    self.renderComment(comments[i], callback);
                };
            });
            async.parallel(tasks, function (err, results) {
                cb(err, new pb.TemplateValue(results.join(''), false));
            });
        });
        ts.load('elements/comments', cb);
    };

    Blog.prototype.renderComment = function (comment, cb) {

        var cts = new pb.TemplateService(this.ls);
        cts.reprocess = false;
        cts.registerLocal('commenter_photo', comment.commenter_photo ? comment.commenter_photo : '');
        cts.registerLocal('display_photo', comment.commenter_photo ? 'block' : 'none');
        cts.registerLocal('commenter_name', comment.commenter_name);
        cts.registerLocal('commenter_position', comment.commenter_position ? ', ' + comment.commenter_position : '');
        cts.registerLocal('content', comment.content);
        cts.registerLocal('timestamp', comment.timestamp);
        cts.load('elements/comments/comment', cb);
    };

    Blog.prototype.getContentSpecificPageName = function (content, cb) {


        if (this.req.pencilblue_article || this.req.pencilblue_page) {
            cb(null, content.headline + ' | ' + pb.config.siteName);
        }
        else if (searchId = this.req.pencilblue_section || this.req.pencilblue_topic) {

            var objType = this.req.pencilblue_section ? 'section' : 'topic';
            var dao = new pb.DAO();
            if (this.req.pencilblue_topic) {
                searchId = searchId.toString();
            }
            dao.loadById(searchId, objType, function (err, obj) {
                if (util.isError(err) || obj === null) {
                    cb(null, pb.config.siteName);
                    return;
                }

                cb(null, obj.name + ' | ' + pb.config.siteName);
            });
        }
        else {
            cb(null, pb.config.siteName);
        }
    };

    Blog.prototype.getNavigation = function (cb) {
        TopMenu.getTopMenu(this.session, this.ls, function (themeSettings, navigation, accountButtons) {
            TopMenu.getBootstrapNav(navigation, accountButtons, function (navigation, accountButtons) {
                cb(themeSettings, navigation, accountButtons);
            });
        });
    };

    /**
    * Provides the routes that are to be handled by an instance of this prototype.
    * The route provides a definition of path, permissions, authentication, and
    * expected content type.
    * Method is optional
    * Path is required
    * Permissions are optional
    * Access levels are optional
    * Content type is optional
    *
    * @param cb A callback of the form: cb(error, array of objects)
    */
    Blog.getRoutes = function (cb) {
        var routes = [
            {
                method: 'get',
                path: '/blog',
                auth_required: false,
                content_type: 'text/html'
            }
        ];
        cb(null, routes);
    };

    //exports
    return Blog;
}
