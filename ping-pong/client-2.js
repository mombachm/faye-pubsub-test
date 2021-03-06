// This script demonstrates a logger for the chat app. First, start the chat
// server in one terminal then run this in another:
//
//   $ node examples/node/server.js
//   $ node examples/node/client.js
//
// The client connects to the chat server and logs all messages sent by all
// connected users.

var fs      = require('fs'),
    // deflate = require('permessage-deflate'),
    faye    = require('faye'),

    port     = process.argv[2] || 8000,
    path     = process.argv[3] || 'bayeux',
    scheme   = process.argv[4] === 'tls' ? 'https' : 'http',
    endpoint = scheme + '://localhost:' + port + '/' + path;
    // cert     = fs.readFileSync(__dirname + '/../server.crt'),
    // proxy    = { headers: { 'User-Agent': 'Faye' }, tls: { ca: cert }};

console.log('Connecting to ' + endpoint);

var client = new faye.Client(endpoint);
// client.addWebsocketExtension(deflate);

var subscription = client.subscribe('/pong', function(message) {
    var user = message.user;
    console.log(`[MESSAGE RECEIVED (${message.user})]: ${message.message}`);
    var publicationPing = client.publish('/ping', {
      user:     'client-2',
      message:  'Ping!'
    });
    publicationPing.callback(function() {
      console.log('[PING SENT]');
    });
  });

subscription.callback(function() {
  console.log('[SUBSCRIBE SUCCEEDED]');
});
subscription.errback(function(error) {
  console.log('[SUBSCRIBE FAILED]', error);
});

client.bind('transport:down', function() {
  console.log('[CONNECTION DOWN]');
});
client.bind('transport:up', function() {
  console.log('[CONNECTION UP]');
});