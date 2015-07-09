/**
 * @copyright Copyright (c) Sematext Group, Inc. - All Rights Reserved
 *
 * @licence SPM for Docker is free-to-use, proprietary software.
 * THIS IS PROPRIETARY SOURCE CODE OF Sematext Group, Inc. (Sematext)
 * This source code may not be copied, reverse engineered, or altered for any purpose.
 * This source code is to be used exclusively by users and customers of Sematext.
 * Please see the full license (found in LICENSE in this distribution) for details on its license and the licenses of its dependencies.
 */
'use strict'
var monitor = require('./dockerMonitor.js')
var Agent = require('spm-agent/lib/agent.js')
var SpmAgent = require('spm-agent')
var DockerEventForwarder = require('./dockerEventForwarder.js')
function dockerAgent () {
  var da = new Agent(
    {
      start: function (agent) {
        this.dockerLogsene = require('./dockerLogsene')
        this.dockerListener = function (stats) {
          if (!stats) {
            return
          }
          var containerName = stats.dockerId
          if (stats.name) {
            containerName = containerName + '-' + stats.name
          }
          var metric = {
            ts: new Date().getTime(),
            type: 'container',
            filters: [stats.image, containerName],
            name: 'docker',
            value: stats.value
          }
          console.log(agent.formatLine(metric))
          agent.addMetrics(metric)
        }
        if (SpmAgent.Config.tokens.spm) {
          monitor(this.dockerListener)
        } else {
          console.log('SPM_TOKEN is missing, no metrics will be collected')
        }
      },
      stop: function () {
        // TODO: stop streaming docker stats, terminate timer
      },
      eventForwarder: new DockerEventForwarder()
    }
  )
  return da
}

module.exports = dockerAgent
