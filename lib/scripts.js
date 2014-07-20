var fs = require('fs');
var path = require('path');

var generateUpstartScript = function(settings) {
  return 'description "' + settings.name + ' node process"\n\n'
       + 'start on runlevel [2]\n'
       + 'stop on runlevel [016]\n\n'
       + 'console owner\n'
       + 'chdir "' + settings.path + '/' + settings.name + '"\n'
       + 'env NODE_ENV=production\n'
       + 'exec ' + settings.start + ' >> /var/log/' + settings.name + '.log 2>&1\n'
       + 'respawn\n'
       + 'respawn limit 5 15\n';
};

var generateNginxScript = function(settings) {
  return 'upstream ' + settings.name + ' {\n'
       + '  server 127.0.0.1:' + settings.port + ';\n'
       + '}\n\n'
       + 'server {\n'
       + '  listen 80;\n'
       + '  client_max_body_size 4G;\n'
       + '  server_name ' + settings.appurl + ';\n\n'
       + '  keepalive_timeout 5;\n\n'
       + '  location / {\n'
       + '    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n'
       + '    proxy_set_header Host $http_host;\n'
       + '    proxy_redirect off;\n'
       + '    proxy_pass http://' + settings.name + ';\n'
       + '  }\n'
       + '}\n';
};

var generate = function(directory, settings) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  fs.writeFileSync(path.join(directory, settings.name + '.conf'), generateUpstartScript(settings));
  fs.writeFileSync(path.join(directory, settings.name), generateNginxScript(settings));
};

module.exports = {
  generate: generate
};
