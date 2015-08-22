var loghose = require('docker-loghose')
var through = require('through2')
var Logsene = require('logsene-js')
var SpmAgent = require('spm-agent')
var Logagent = require('logagent-js')
var fs = require('fs')

function createLogAgent () {
  var patternFile = '/etc/logagent/patterns.yml'
  if (fs.existsSync(patternFile)) {
    return new Logagent(patternFile)
  } else {
    console.log('No pattern file for log parsing found ' + patternFile + ' -> using default patterns')
    console.log('Use -v /mypattern/patterns.yml:' + patternFile + ' for custom log parser definitions.')
    return new Logagent() // use default patterns
  }
}
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

function DockerLogsene () {
  this.logagent = createLogAgent()
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

DockerLogsene.prototype.getLogObject = function (line, container, cbf) {
  var lines = line.split('\n')
  for (var i = 0; i < lines.length; i++) {
    this.logagent.parseLine(line, container, function (err, parsed) {
      return cbf(err, parsed)
    })
  }
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
      console.log(typeof chunk.line)
      var lines = chunk.line.split('\n') // We can get multiple lines per chunk
      lines.forEach(function (line) {
        self.logLine(line, chunk)
      })
      cb()
    } catch (ex) {
      console.log(ex)
      cb()
    }
  })
  // self.logStream.once('error', this.reconnect)
  var lh = loghose(options)
  lh.pipe(self.logStream)
  lh.on('error', this.reconnect)
}

DockerLogsene.prototype.logLine = function (line, chunk, next) {
  var self = this
  self.getLogObject(
    line,
    chunk.image + '_' + chunk.name + '_' + chunk.id,
    function (err, logObject) {
      if (err && !logObject) {
        return
      }
      var msg = { container_id: chunk.id, image_name: chunk.image, container_name: chunk.name, message: logObject.message, '@source': chunk.id + '/' + chunk.image}
      if (logObject) {
        msg = extend(msg, logObject)
      }
      var level = 'info'
      if (/error|fail|exception/i.test(line || '')) {
        level = 'error'
      }
      console.log(JSON.stringify(msg,null,'\t'))
      self.logger.log(level, msg.message, msg)
    })
}

DockerLogsene.prototype.reconnect = function (err) {
  var self = this
  SpmAgent.Logger.log('error', 'Error in log stream: ' + err)
  try {
    self.logStream = null
    self.connect()
    SpmAgent.Logger.log('debug', 'reconnect to docker.sock ')
  } catch (ex) {
    SpmAgent.Logger.log('error', ex)
    setTimeout(function () {
      self.reconnect()
      SpmAgent.Logger.log('debug', 'reconnect to docker.sock ')
    }, 1000)
  }
}

module.exports = new DockerLogsene()
