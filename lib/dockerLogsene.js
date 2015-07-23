var loghose = require('docker-loghose')
var through = require('through2')
var Logsene = require('logsene-js')
var SpmAgent = require('spm-agent')

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
  this.logger = new Logsene(process.env.LOGSENE_TOKEN, 'docker')
  this.logger.on('error', function (err) {
    SpmAgent.Logger.log('error', 'Error in logsene-js: ' + err, err)
  })
  this.opts = {
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
  var self = this
  setTimeout(function () {
    self.connect()
  }, 200)

}

DockerLogsene.prototype.connect = function () {
  var self = this
  var options = self.opts
  SpmAgent.Logger.log('debug', 'connect logStream to docker.sock')
  self.logStream = through.obj(function (chunk, enc, cb) {
    try {
      if (!chunk.line) {
        cb()
        return
      }
      var lines = chunk.line.split('\n')
      lines.forEach(function (line) {
        self.logLine(line, chunk)
      })
      cb()
    } catch (ex) {
      cb()
    }
  })
  self.logStream.once('error', this.reconnect)
  loghose(options).pipe(self.logStream)
}

DockerLogsene.prototype.logLine = function (line, chunk) {
  var self = this
  var logObject = getLogObject(line)
  var msg = { container_id: chunk.id, image_name: chunk.image, container_name: chunk.name, message: logObject.line, '@source': chunk.id + '/' + chunk.image}
  if (logObject.json) {
    msg = extend(msg, logObject)
  }
  var level = 'info'
  if (/error|fail|exception/i.test(line || '')) {
    level = 'error'
  }
  self.logger.log(level, line, msg)
}

DockerLogsene.prototype.reconnect = function (err) {
  var self = this
  SpmAgent.Logger.log('error', 'Error in log stream: ' + err)
  try {
    setTimeout(function () {
      self.connect()
      SpmAgent.Logger.log('debug', 'reconnect to docker.sock ')
    }, 15000)
    self.logStream.close()
  } catch (ex) {
    SpmAgent.Logger.log('error', ex)
  }
}

module.exports = new DockerLogsene()
