var http = require('http'),
    timesyncServer = require('timesync/server'),
    faye = require('faye');
    
var fayeServer = new faye.NodeAdapter({ mount: '/bayeux', timeout: 20 });

var handleRequest = function(request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello, non-Bayeux request');
}

var server = http.createServer(handleRequest);

fayeServer.attach(server);
server.listen(8000);
timesyncServer.attachServer(server);

fayeServer.on('subscribe', function(clientId, channel) {
  console.log('[SUBSCRIBE] ' + clientId + ' -> ' + channel);
});

fayeServer.on('unsubscribe', function(clientId, channel) {
  console.log('[UNSUBSCRIBE] ' + clientId + ' -> ' + channel);
});

fayeServer.on('disconnect', function(clientId) {
  console.log('[DISCONNECT] ' + clientId);
});

console.log('Listening on port 8000');



