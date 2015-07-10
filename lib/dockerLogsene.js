var loghose = require('docker-loghose')
var through = require('through2')
var Logsene = require('logsene-js')

function extend (origin, add) {
  // Don't do anything if add isn't an object
  if (!add || typeof add !== 'object') return origin

  var keys = Object.keys(add)
  var i = keys.length
  while (i--) {
    origin[keys[i]] = add[keys[i]]
  }
  return origin
}

function getLogObject (line) {
  var rv = {}
  if (/\{.*\}/i.test(line)) {
    try {
      rv.json = JSON.parse(line)
      // let's cover a few default cases like logstash, bunyan, journald format
      rv.message = rv.json.message || rv.json.msg || rv.json.MESSAGE || rv.json.MSG || line.toString()
      rv.ts = rv.json['@timestamp'] || rv.json['time']
    } catch (err) {
      rv.message = line.toString()
    }
  } else {
    rv = {line: line}
  }
  return rv
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
    var logObject = getLogObject(chunk.line)
    var msg = { container_id: chunk.id, image_name: chunk.image, container_name: chunk.name, message: logObject.line, '@source': chunk.id + '/' + chunk.image}
    if (logObject.json) {
      msg = extend(msg, logObject)
    }
    var level = 'info'
    if (/error|fail|exception/i.test(chunk.line || '')) {
      level = 'error'
    }
    logger.log(level, chunk.line, msg)
    cb()
  }))
}

module.exports = new DockerLogsene()
