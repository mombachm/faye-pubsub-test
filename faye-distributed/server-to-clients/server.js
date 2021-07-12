var fs      = require('fs'),
    http    = require('http'),
    https   = require('https'),
    timesyncServer = require('timesync/server'),
    { performance } = require('perf_hooks');
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
timesyncServer.attachServer(server);

var testFileContent = readFileContent("../../test-files/test-100KB.txt").toString();
console.log(testFileContent);
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

var publishMessageToClients = () => {
  setInterval(function() {
    bayeux.getClient().publish('/ch1', {
      user:     'server',
      serverTime:  Date.now(),
      message: testFileContent
    });
  }, 500)
}
publishMessageToClients();

function readFileContent(filename) {
  return fs.readFileSync(filename);
}