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

exec(`rm log.txt`);
var testFileContent = readFileContent("../../test-files/test-50KB.txt")

var client = new faye.Client(endpoint);

setTimeout(() => {
  publishMessageToClients();
}, 5000);

client.bind('transport:down', function() {
  console.log('[CONNECTION DOWN]');
});

client.bind('transport:up', function() {
  console.log('[CONNECTION UP]');
});

timeSync.on('change', function (offset) {
  console.log('time offset changed:', offset);
});

var publishMessageToClients = () => {
  setInterval(function() {
    client.publish('/ch1', {
      user:     'client-1',
      serverTime: new Date(timeSync.now()).getTime(),
      message: testFileContent
    });
  }, 500)
}

function readFileContent(filename) {
  return fs.readFileSync(filename, function read(err, data) {
      if (err) {
          throw err;
      }
      return data;
  });
}