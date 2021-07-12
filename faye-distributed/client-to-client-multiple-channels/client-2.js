var timesyncLib = require('timesync'),
    faye = require('faye'),
    { exec } = require('child_process');


const CH_CONT = 5;
var endpoint = 'http://localhost:8000/bayeux';  

console.log('Connecting to ' + endpoint);

var timesync = timesyncLib.create({
  server: 'http://localhost:8000/timesync',
  interval: 1000,
  delay: 0
});

var client = new faye.Client(endpoint);

for (let index = 1; index <= CH_CONT; index++) {
  client.subscribe(`/ch${index}`, (message) => {
    let sendingTime = new Date(timesync.now()).getTime() - message.serverTime;
    exec(`echo ${sendingTime} >> test-log-ch${index}.txt`);
  });
}

client.bind('transport:down', function() {
  console.log('[CONNECTION DOWN]');
});

client.bind('transport:up', function() {
  console.log('[CONNECTION UP]');
});

timesync.on('change', function (offset) {
  console.log('time sync offset changed:', offset);
});




