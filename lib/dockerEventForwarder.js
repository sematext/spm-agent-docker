var DockerEvents = require('docker-events')
var SPM = require('spm-metrics-js')
var SpmAgent = require('spm-agent')
var os = require('os')

function DockerEventForwarder (docker) {
  var Docker = require('dockerode')
  this.docker = docker || new Docker({socketPath: '/var/run/docker.sock'})
  this.dockerEvents = new DockerEvents({docker: this.docker})

  this.spm = new SPM(SpmAgent.Config.tokens.spm, 0)
  var self = this
  this.sendEvent = function (type, msg) {
    msg.creator = process.env.HOSTNAME || os.hostname()
    self.spm.sendEvent(type, msg, function (err, res) {
      if (err) {
        console.log('Error sending event to SPM ' + err)
      } else {
        if (res && res.statusCode > 299) {
          console.log('Error sending event to SPM ' + res.body)
        }
      }})
  }
  this.forwardEvent = function (dockerEvent) {
    var msgStr = dockerEvent.status + ' ' + dockerEvent.from + ' ' + dockerEvent.id.substring(0, 12)
    console.log(msgStr)
    var msg = {
      name: dockerEvent.from,
      message: msgStr,
      tags: ['docker', process.env.HOSTNAME || os.hostname(), dockerEvent.status, dockerEvent.id ]
    }
    var type = (dockerEvent.status || 'docker')
    type = type.replace(/[^\w]/gi, '_')
    self.sendEvent(type, msg)
  }
  self.docker.version(function (err, data) {
    if (!err) {
      self.sendEvent('docker-info', {message: 'Docker: ' + data.Version + ' API: ' + data.ApiVersion + ' Kernel: ' + data.KernelVersion })
    }
  })

  this.dockerEvents.on('connect', function () {
    self.dockerEvents.on('_message', self.forwardEvent)
  })
  this.dockerEvents.on('disconnect', function () {
    self.dockerEvents.removeListener('_message', self.forwardEvent)
  })
  this.dockerEvents.start()
  return this
}

module.exports = DockerEventForwarder
