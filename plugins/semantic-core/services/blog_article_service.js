'use strict';

//dependencies
var util  = require('../../../include/util.js');

module.exports = function BlogArticleServiceModule(pb) {

	//pb dependencies
	var ArticleService = pb.ArticleService;

	function BlogArticleService() { }

	BlogArticleService.init = function (cb) {
		pb.log.debug("BlogArticleService: Initialized");
		cb(null, true);
  };

	var ARTICLE_TYPE = 'article';

	/**
     * Retrieves data necessary for displaying an articles and appends it to the
     * article object
     *
     * @method processArticleForDisplay
     * @param {Object}   article         The artice to process
     * @param {Number}   articleCount    The total number of articles
     * @param {Array}    authors         Available authors retrieved from the database
     * @param {Object}   contentSettings Content settings to use for processing
     * @param {object} [options]
     * @param {Function} cb              Callback function
     */
	ArticleService.prototype.processArticleForDisplay = function (article, articleCount, authors, contentSettings, options, cb) {
		if (util.isFunction(options)) {
			cb = options;
			options = cb;
		}

		var self = this;
		console.log('ARTICLE IS: >>>', article);

		if (this.getContentType() === ARTICLE_TYPE) {
			if (contentSettings.display_bylines) {

				for (var j = 0; j < authors.length; j++) {

					if (pb.DAO.areIdsEqual(authors[j][pb.DAO.getIdField()], article.author)) {
						if (authors[j].photo && contentSettings.display_author_photo) {
							article.author_photo = authors[j].photo;
							article.media_body_style = '';
						}

						article.author_name = pb.users.getFormattedName(authors[j]);
						article.author_position = (authors[j].position && contentSettings.display_author_position) ? authors[j].position : '';
						break;
					}
				}
			}

			if (contentSettings.display_timestamp) {
				article.timestamp = pb.ContentService.getTimestampTextFromSettings(
					article.publish_date,
					contentSettings
				);
			}

			if (article.article_layout.indexOf('^read_more^') > -1) {
				if (articleCount > 1) {
					article.article_layout = article.article_layout.substr(0, article.article_layout.indexOf('^read_more^')) + ' <div class="post-more font-inc"><a href="' + pb.config.siteRoot + '/article/' + article.url + '" class="more-link"><small>' + contentSettings.read_more_text + '...</small></a></div>';
				}
				else {
					article.article_layout = article.article_layout.split('^read_more^').join('');
				}
			}
			else if (articleCount > 1 && contentSettings.auto_break_articles) {
				var breakString = '<br>';
				var tempLayout;

				// Firefox uses br and Chrome uses div in content editables.
				// We need to see which one is being used
				var brIndex = article.article_layout.indexOf('<br>');
				if (brIndex === -1) {
					brIndex = article.article_layout.indexOf('<br />');
					breakString = '<br />';
				}
				var divIndex = article.article_layout.indexOf('</div>');

				// Temporarily replace double breaks with a directive so we don't mess up the count
				if (divIndex === -1 || (brIndex > -1 && divIndex > -1 && brIndex < divIndex)) {
					tempLayout = article.article_layout.split(breakString + breakString).join(breakString + '^dbl_pgf_break^');
				}
				else {
					breakString = '</div>';
					tempLayout = article.article_layout.split('<div><br></div>').join(breakString + '^dbl_pgf_break^')
						.split('<div><br /></div>').join(breakString + '^dbl_pgf_break^');
				}

				// Split the layout by paragraphs and remove any empty indices
				var tempLayoutArray = tempLayout.split(breakString);
				for (var i = 0; i < tempLayoutArray.length; i++) {
					if (!tempLayoutArray[i].length) {
						tempLayoutArray.splice(i, 1);
						i--;
					}
				}

				// Only continue if we have more than 1 paragraph
				if (tempLayoutArray.length > 1) {
					var newLayout = '';

					// Cutoff the article at the right number of paragraphs
					for (i = 0; i < tempLayoutArray.length && i < contentSettings.auto_break_articles; i++) {
						if (i === contentSettings.auto_break_articles - 1 && i !== tempLayoutArray.length - 1) {
							newLayout += tempLayoutArray[i] + '&nbsp;<a href="' + pb.config.siteRoot + '/article/' + article.url + '">' + contentSettings.read_more_text + '...</a>' + breakString;
							continue;
						}
						newLayout += tempLayoutArray[i] + breakString;
					}

					if (breakString === '</div>') {
						breakString = '<div><br /></div>';
					}

					// Replace the double breaks
					newLayout = newLayout.split('^dbl_pgf_break^').join(breakString);

					article.article_layout = newLayout;
				}
			}
		}

		article.layout = article.article_layout;
		var mediaLoader = new pb.MediaLoader({ site: self.site, onlyThisSite: self.onlyThisSite });
		mediaLoader.start(article[this.getContentType() + '_layout'], options, function (err, newLayout) {
			article.layout = newLayout;
			delete article.article_layout;

			if (self.getContentType() === ARTICLE_TYPE && ArticleService.allowComments(contentSettings, article)) {

				var opts = {
					where: {
						article: article[pb.DAO.getIdField()].toString()
					},
					order: [['created', pb.DAO.ASC]]
				};
				var dao = new pb.DAO();
				dao.q('comment', opts, function (err, comments) {
					if (util.isError(err) || comments.length === 0) {
						return cb(null, null);
					}

					self.getCommenters(comments, contentSettings, function (err, commentsWithCommenters) {
						article.comments = commentsWithCommenters;
						cb(null, null);
					});
				});
			}
			else {
				cb(null, null);
			}
		});
	};

	//exports
  return BlogArticleService;
}