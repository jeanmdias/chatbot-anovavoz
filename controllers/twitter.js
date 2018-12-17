var Twitter = require('twitter');
var facebook = require('../controllers/facebook');

require('dotenv').config();

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET
});

exports.postTweet = function(message) {

  var messageStatus = message.substr(0, 280);

  if (process.env.NODE_ENV == 'production') {

    client.post('statuses/update', {status: messageStatus},  function(error, tweet, response) {
      if(error) {
        console.log('** Error at Twitter.postTweet',error);

        facebook.sendList(1553273071358884, '** Error at Twitter.postTweet. ' + error, function(res) {
          facebook.sendList(1561693973871939, '** Error at Twitter.postTweet. ' + error, function(res) {
            //callback();
          });
        });

      } else {
        console.log('** Twitter.postTweet',messageStatus);
      }
    });

  } else {

    console.log('** Twitter OFF',messageStatus);

  }
}
