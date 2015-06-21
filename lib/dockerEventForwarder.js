var DockerEvents = require('docker-events')
var SPM = require('spm-metrics-js')
var SpmAgent = require('spm-agent')

function DockerEventForwarder (docker) {
  var Docker = require('dockerode')
  this.docker = docker || new Docker({socketPath: '/var/run/docker.sock'})
  this.dockerEvents = new DockerEvents({docker: this.docker})

  var spm = new SPM(SpmAgent.Config.tokens.spm, 0)
  this.logger = spm.getEventLogger({
    type: 'docker',
    name: 'events',
    tags: ['docker', process.env.HOSTNAME],
    creator: 'spm-agent-docker'
  })
  var self = this
  this.forwardEvent = function (dockerEvent) {
    var msg = dockerEvent.status + ' ' + dockerEvent.from + ' ' + dockerEvent.id.substring(0, 12)
    console.log(msg)
    self.logger.log(msg, function (err, res) {
      if (err) {
        console.log('Error sending event to SPM ' + err)
      } else {
        if (res && res.statusCode > 299) {
          console.log('Error sending event to SPM ' + res.body)
        }
      }})
  }
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
