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

var subscription = client.subscribe('/ping', function(message) {
  var user = message.user;
  console.log(`[MESSAGE RECEIVED (${message.user})]: ${message.message}`);
  console.log(JSON.stringify(message, null, 4));
  var publicationPong = client.publish('/pong', {
    user:     'client-1',
    message:  'Pong!'
  });
  publicationPong.callback(function() {
    console.log('[PONG SENT]');
  });
});

subscription.callback(function() {
  console.log('[SUBSCRIBE SUCCEEDED]');

  var publication = client.publish('/ping', {
    user:     'client-1',
    message:  'Ping!'
  });
  publication.callback(function() {
    console.log('[PUBLISH SUCCEEDED]');
  });
  publication.errback(function(error) {
    console.log('[PUBLISH FAILED]', error);
  });
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