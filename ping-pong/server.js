var 
    http    = require('http'),
    https   = require('https'),
    faye    = require('faye');

    bayeux     = new faye.NodeAdapter({ mount: '/bayeux', timeout: 20 }),
    port       = process.argv[2] || '8000',
    secure     = process.argv[3] === 'tls';

var handleRequest = function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello, non-Bayeux request');
}

var server = secure
           ? https.createServer({}, handleRequest)
           : http.createServer(handleRequest);

bayeux.attach(server);
server.listen(Number(port));

bayeux.getClient().subscribe('/ping', function(message) {
  console.log('[' + message.user + ']: ' + message.message);
});
bayeux.getClient().subscribe('/pong', function(message) {
  console.log('[' + message.user + ']: ' + message.message);
});

bayeux.on('subscribe', function(clientId, channel) {
  console.log('[SUBSCRIBE] ' + clientId + ' -> ' + channel);
});

bayeux.on('unsubscribe', function(clientId, channel) {
  console.log('[UNSUBSCRIBE] ' + clientId + ' -> ' + channel);
});

bayeux.on('disconnect', function(clientId) {
  console.log('[DISCONNECT] ' + clientId);
});

console.log('Listening on ' + port + (secure? ' (https)' : ''));