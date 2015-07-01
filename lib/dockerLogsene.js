var loghose = require('docker-loghose')
var through = require('through2')
var Logsene = require('logsene-js')

function extend(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || typeof add !== 'object') return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}
function DockerLogsene () {
  var logger = new Logsene(process.env.LOGSENE_TOKEN, 'docker')
  var opts = {
    json: false,
    docker: null,
    events: null,
    // the following options limit the containers being matched
    // so we can avoid catching logs for unwanted containers
    matchByName: process.env.MATCH_BY_NAME,
    matchByImage: process.env.MATCH_BY_IMAGE,
    skipByName: process.env.SKIP_BY_NAME,
    skipByImage: process.env.SKIP_BY_IMAGE
  }
  loghose(opts).pipe(through.obj(function (chunk, enc, cb) {
	var msg = { container_id: chunk.id, image_name: chunk.image, container_name: chunk.name, message: chunk.line.toString(), '@source': chunk.id + '/' +chunk.image}
    var level = 'info'
    if (/error|fail|exception/i.test(chunk.line || '')) {
      level = 'error'
    }
    logger.log(level, chunk.line, msg)
    cb()
  }))
}

module.exports = new DockerLogsene()
