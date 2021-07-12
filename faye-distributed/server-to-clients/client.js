const { exec } = require('child_process');

var fs      = require('fs'),
    timesync = require('timesync'),
    faye    = require('faye'),

    port     = process.argv[2] || 8000,
    path     = process.argv[3] || 'bayeux',
    scheme   = process.argv[4] === 'tls' ? 'https' : 'http',
    endpoint = scheme + '://localhost:' + port + '/' + path;  

console.log('Connecting to ' + endpoint);

var timeSync = timesync.create({
  server: 'http://localhost:8000/timesync',
  interval: 1000,
  delay: 0
});

exec(`rm *test-log*`);

var client = new faye.Client(endpoint);
var subCh1 = client.subscribe('/ch1', (message) => {
  let sendingTime = new Date(timeSync.now()).getTime() - message.serverTime;
  exec(`echo ${sendingTime} >> test-log.txt`);
});

subCh1.callback(function() {
  console.log('[SUBSCRIBE SUCCEEDED]');
});

subCh1.errback(function(error) {
  console.log('[SUBSCRIBE FAILED]', error);
});

client.bind('transport:down', function() {
  console.log('[CONNECTION DOWN]');
});

client.bind('transport:up', function() {
  console.log('[CONNECTION UP]');
});

timeSync.on('change', function (offset) {
  console.log('time offset changed:', offset);
});