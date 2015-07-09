var TcpJsonReceiver = require('./tcpLogReceiver')
var tcpLdjServer = new TcpJsonReceiver(process.env.JOURNALD_RECEIVER_PORT)
var Logsene = require('logsene-js')
var logger = new Logsene(process.env.LOGSENE_TOKEN, 'journald')

function TcpJsonToLogsene () {
  
  logger.on('log', function (d) {
    console.log ('curl -XPOST ' +  d.url + ' -d \'' + d.request + '\'')
  })
  tcpLdjServer.on('data', processEvents)
}

var processEvents = function (data) {
  //console.log (data)
  var message = data.message || data.msg || data.MESSAGE || data.MSG || data.line.toString()
  if (data['__REALTIME_TIMESTAMP']) {
    data['@timestamp'] = new Date(data['__REALTIME_TIMESTAMP'] / 1000).toISOString()
    data['hostname'] = data ['_HOSTNAME']
  }
  // we might find sub fields in docker logs
  if (data['SYSLOG_IDENTIFIER'] === 'dockerd') {
    var fields = message.match(/time="(.+Z)" level=(.+) msg="(.+)"/)
    if (fields && fields.length > 3) {
      data['@timestamp'] = fields[1]
      data['level'] = fields[2]
      data['message'] = fields[3]
    }
  }
  logger.log('info', data['message'] || message, data)
}


module.export=TcpJsonToLogsene()