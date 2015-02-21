var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var async = require('async');

var findGitUrl = function(callback) {
  exec('git config --get remote.origin.url', function(err, stdout) {
    return callback(null, !err && stdout.trim());
  });
};

var findUpstreamPort = function(callback) {
  var cmd = 'cat *.js | grep -Eho ".listen\\(.*)" | grep -Eho "\\d+[, ,) )]" | grep -Eho "\\d+"';

  exec(cmd, function(err, stdout) {
    return callback(null, !err && stdout.trim());
  });
};

var findStartCommand = function(callback) {
  fs.readFile('package.json', 'utf8', function(err, data) {
    if (err || !data) {
      return callback(null);
    }

    try {
      return callback(null, 'node ' + JSON.parse(data).main);
    } catch (err) {
      return callback(null);
    }
  });
};

var find = function(callback) {
  async.series([findGitUrl, findUpstreamPort, findStartCommand], function(err, results) {
    return callback({
      url: results[0],
      port: results[1],
      name: path.basename(process.cwd()),
      start: results[2],
      path: '/var/www',
      nginx: '/etc/nginx/sites-enabled'
    });
  });
};

module.exports = {
  find: find
};