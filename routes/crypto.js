module.exports = function (noodle, app, io, userList, recentMessages) {
  var auth = require('../lib/authenticate');
  var messageMaker = require('../lib/message-maker');

  app.post("/crypto/send/pubkey", function (req, res) {
    var channel = req.body.channel;
    var nick = req.body.nick;
    var pubKey = req.body.pubKey;
    if (req.body.pubKey) {
      // Need format a message that displays the pub key to the other user
      var message = messageMaker.getMessage(noodle, channel, req, io, userList);
      io.sockets.in(channel).emit('message', message);
      io.sockets.in(channel).emit('usercount', io.sockets.clients(channel).length);
      console.log(message);
      res.json(message);
    }
  });
};
