#!/usr/bin/env node
/*
 * @copyright Copyright (c) Sematext Group, Inc. - All Rights Reserved
 *
 * @licence SPM for Docker is free-to-use, proprietary software.
 * THIS IS PROPRIETARY SOURCE CODE OF Sematext Group, Inc. (Sematext)
 * This source code may not be copied, reverse engineered, or altered for any purpose.
 * This source code is to be used exclusively by users and customers of Sematext.
 * Please see the full license (found in LICENSE in this distribution) for details on its license and the licenses of its dependencies.
 */
var SpmAgent = require('spm-agent')
process.env.spmagent_logger__console = 'true'

var config = SpmAgent.Config

config.useLinuxAgent = true

function DockerMonitor () {
  if (process.env.SPM_TOKEN && !SpmAgent.Config.tokens.spm) {
    SpmAgent.Config.tokens.spm = process.env.SPM_TOKEN
  }
  if (process.argv[2] && process.argv[2].length > 30) {
    SpmAgent.Config.tokens.spm = process.argv[2]
  }
  var njsAgent = new SpmAgent()
  njsAgent.on('metrics', console.log)
  var agentsToLoad = [
    './dockerAgent',
    './osAgent'
  ]
  agentsToLoad.forEach(function (a) {
    try {
      // console.log (a)
      var Monitor = require(a)
      // console.log (Monitor)
      njsAgent.createAgent(new Monitor())
    // console.log ('Loaded Agent: ' + a )
    } catch (err) {
      console.log(err)
      SpmAgent.Logger.error('Error loading agent ' + a + ' ' + err)
    }
  })
  return njsAgent
}

DockerMonitor()
