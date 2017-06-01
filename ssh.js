


// push, fetch, nuke, pave


var ssh2 = require('ssh2').Client;
var scp2 = require('scp2');
var fs = require('fs');

var key = fs.readFileSync('ibis.pem');

function remote (path) {
  return {
    port: 22,
    host: '52.20.143.110',
    path: path,
    username: 'ubuntu',
    privateKey: key
  };
}

var init = (function(action){
  switch(action) {
    
  }
})();



var conn = new ssh2();
conn.on('ready', function() {
  console.log('Client :: ready');
  conn.exec('rm -r public/', function(err, stream) {
    if (err) throw err;
    stream.on('close', function(code, signal) {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
      scp2.scp('public',
        {
        port: 22,
        host: '52.20.143.110',
        path: 'public',
        username: 'ubuntu',
        privateKey: require('fs').readFileSync('ibis.pem')
        },
        function(err) {
          if (err) console.log('ERROR', err);
          console.log('COMPLETED')
        })

    }).on('data', function(data) {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', function(data) {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '52.20.143.110',
  port: 22,
  username: 'ubuntu',
  privateKey: require('fs').readFileSync('ibis.pem')
});




// client.defaults({
//   port: 22,
//   host: '52.20.143.110',
//   path: 'public/',
//   username: 'ubuntu',
//   privateKey: require('fs').readFileSync('ibis.pem')
// });




