const MATCH_NICK = /^(\/nick\s?$)/i;
const MATCH_ME = /^(\/me\s?$)/i;
const EMOTI_HEART = '&lt;3';
const MATCH_CHANNEL = /^#\w+/i;
const VIDEO_HEIGHT = 281;
const VIDEO_WIDTH = 500;

/* Embed media if it matches any of the following:
 * 1. Is a Youtube link
 * 2. Is a Vimeo link
 * 3. Is a general link
 * 4. Is a file with a jpg|jpeg|png|gif extension
 * 5. Is an video or audio extension matching mp3|ogg|webm|ogv|mp4
*/
exports.generate = function(content) {
  var result = '';
  var matchYoutube = require('./remixes/youtube');
  var matchVimeo = require('./remixes/vimeo');
  var matchImages = require('./remixes/images');
  var matchAudio = require('./remixes/audio');
  var matchVideo = require('./remixes/video');
  var matchLinks = require('./remixes/links');

  // set null anything that is supposed to be a command but is followed by nothing
  this.removeDummies = function(result) {
    if (result.match(MATCH_NICK) || result.match(MATCH_ME)) {
      return '';
    }
    return result;
  }

  // parse the current url to determine where to process it.
  this.parseWords = function(media) {
    var url = media.split('/');
    var protocol = url[0].toLowerCase();
    var remix = { result: '', isMatched: false };

    // get rid of any html
    media = media.replace(/</gm, '&lt;');
    media = media.replace(/>/gm, '&gt;');
    media = media.replace(/\"/gm, '&quot;');
    media = media.replace(/;base64/gm, '');

    if (protocol === 'http:' || protocol === 'https:') {
      // this is a link, so let's do some more analysis
      try {
        remix = matchYoutube.process(media, remix, url, { width: VIDEO_WIDTH, height: VIDEO_HEIGHT });
        remix = matchVimeo.process(media, remix, url, { width: VIDEO_WIDTH, height: VIDEO_HEIGHT });
        remix = matchImages.process(media, remix);
        remix = matchAudio.process(media, remix);
        remix = matchVideo.process(media, remix);
        remix = matchLinks.process(media, remix);

        result = remix.result;

      } catch(e) {
        // Invalid link attempt, falling back to regular text
        result = media;
      }

    } else if (media.match(MATCH_CHANNEL)) {
      result = '<a href="/about/' + escape(media.split('#')[1]) + '" target="_blank">' + media + '</a>';

    } else if (media === EMOTI_HEART) {
      result = '<img src="/images/heart.png">';

    } else {
      result = media;
    }

    return result;
  };

  // break the string up by spaces
  var newContent = '';
  content = this.removeDummies(content);
  var contentArray = content.split(/\s/);

  for (var i=0; i < contentArray.length; i++) {
    newContent += ' ' + this.parseWords(contentArray[i]);
  }

  return newContent;
};

// Set a nickname
exports.getNickName = function(content) {
  var nickMatcher = new RegExp(/^(\/nick\s)([a-zA-Z0-9_]+)/i);
  var nickname = '';
  var matches = nickMatcher.exec(content);

  if (matches !== null){
    nickname = matches[2].replace(/\s/, '');
    if (nickname.length > 1) {
      nickname = nickname.replace(/[^\w]/g, '_');
    }
  }

  return nickname;
};
