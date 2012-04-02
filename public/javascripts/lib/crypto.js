// DOMCrypt support
const DOM_PROPERTY = "mozCipher";
const DOM_PARENT = window;

function CryptoAPI() {
  if (DOM_PARENT[DOM_PROPERTY]) {
    this.cryptoAPISupport = true;
    this.api = window.mozCipher;
  }
}

CryptoAPI.prototype = {
  cryptoAPISupport: false,

  publicKey: function publicKey() {
    var pubKeyExists = false;
    var pubK = localStorage.getItem("noodlePubKey");
    if (pubK) {
      pubKeyExists = true;
    }

    var callback = function pubKcallback(aPubKey) {
      if (!pubKeyExists) {
        localStorage.setItem("noodlePubKey", aPubKey);
      }
      // send this up to the server to keep with the logged in user metadata
      $.ajax({
        type: 'POST',
        url: "/crypto/send/pubkey",
               data: { pubKey: aPubKey,
                       senderNickname: "????",
                       channel: "????",  },
        success: function (data) {

        },
        failure: function (data) {
          throw new Error("NoodleTalk: Public Key exchange failed");
        },
        dataType: 'json'
      });
    };

    if (!this.cryptoAPISupport) {
      throw new Error("The DOMCrypt API is not present, get DOMCrypt at https://addons.mozilla.org/en-US/firefox/addon/domcrypt/");
    }

    this.api.pk.getPublicKey(callback);
  },

  encryptMessage: function encryptMessage(aNick, aMessage) {
    // see if the user aNick has published her publicKey
    var self = this;
    $ajax({
      type: "GET",
      url: "/get-pub-key",
      data: {
        nick: aNick
      },
      success: function (data) {
        // encrypt the message
        // data should be the pub key
        self.api.pk.encrypt(aMessage, data, function callback(aCipherMessage) {
          self.sendCipherMessage(aCipherMessage, aNick);
        });
      },
      failure: function (data) {
        // TODO...
      }
    });
  },

  sendCipherMessage: function sendCipherMessage(aCipherMessage, aNick) {
    // XXXddahl: i imagine we can just call the normal message sending mechanism? or
    // perhaps not as the structure here is not the same
    $ajax({
      type: "POST",
      url: "/send/cipher/message",
      data: {
        message: aCipherMessage,
        nick: aNick
      },
      success: function (data) {
        // TODO: display the message
      }
    });
  },

  decryptMessage: function decryptMessage(aMessage, aFromNick) {
    // you always decrypt a message with your own pub key
    // TODO: we need to detect that a message in the page is for us and that
    // it is encrypted
    // There is probably a UI indicator to use that tells us the message was
    // encrypted (colored background?) and we can read it.
    // Perhaps we should have to click a "unlock" button above/below
    // the message to decrypt it

    var msg = JSON.parse(aMessage);
    this.api.pk.decrypt(msg, function callback(aPlainText){
      // display the plain text message and who it is from...
    });
  }
};
