var TcpJsonReceiver = require('./tcpLogReceiver')
var tcpLdjServer = new TcpJsonReceiver(process.env.JOURNALD_RECEIVER_PORT || 9000)
var Logsene = require('logsene-js')
var logger = new Logsene(process.env.LOGSENE_TOKEN, 'journald')
var SpmAgent = require('spm-agent')
var spmLogger = SpmAgent.Logger
var _ = require ('lodash')
function TcpLogsene () {
  tcpLdjServer.on('data', processEvents)
  traceErrorStats() 
}

function traceErrorStats (res) 
{
  var fail = 0
  var success = 0
  logger.on('error', function () {
    fail++
    console.log('-!- failed bulk inserts: ' + fail)

  })
  logger.on('log', function (res) {
    //console.log(res)    
    try {
      var r = JSON.parse(res.response)
      if (r.errors === false && r.took>0)
      {
        success++
      }
      if (r && r.status > 202) {
        fail++
        success--
        spmLogger.debug('docs in bulk: ' + res.count + ' FAILED')
      // spmLogger.debug(res.request)
      // console.log(r.error)
      } else {
        spmLogger.debug('docs in bulk: ' + res.count + ' SUCCESS')
      }
    } catch (err) {
      fail++
    }
    spmLogger.debug('failed bulk inserts: ' + fail)
    spmLogger.debug('succesful bulk inserts: ' + success)
  })
}

function parseJournaldShort (line) {
  try {
    var fields = line.match(/^(\S+\s+\S+\s+\d+:\d+:\d+) (\S+) ([^:\[]+)\[?(\d*)\]?:\s+(.*)/i)
    if (fields && fields.length > 3) {
      var timestamp = new Date(fields[1])
      if (timestamp) {
        timestamp.setYear(new Date().getYear() + 1900) || new Date()
      } else {
        timestamp = new Date()
      }
      return {
        '@timestamp': timestamp.toISOString(),
        message: fields[5],
        host: fields[2],
        source: fields[3],
        tag: 'pid:' + fields[4]
      }
    }
    // check 'short-iso format'
    fields = line.match(/^(\d{4}\-\d+\-\d+T\d+:\d+:\d+).* (\S+) ([^:\[]+)\[?(\d*)\]?:\s+(.*)/i)
    if (fields && fields.length > 3) {
      return {
        '@timestamp': new Date(fields[1]).toISOString(),
        message: fields[5],
        host: fields[2],
        source: fields[3],
        tag: 'pid:' + fields[4]
      }
    }
  } catch (err) {
    return null
  }
}

var lowerObj = _.transform(obj, function (result, val, key) {
    result[key.toLowerCase()] = val;
});

var processEvents = function (data) {
  if (!data) {
    return
  }
  if (!data.line) {
    return
  }

  var log = data
  if (data.err && data.line) {
    // it's not JSON, try short format
    log = parseJournaldShort(data.line) || {message: data.line}
  } else {
    if (data && data['__REALTIME_TIMESTAMP']) {
      data['@timestamp'] = new Date(data['__REALTIME_TIMESTAMP'] / 1000).toISOString()
      data['hostname'] = data ['_HOSTNAME']
      data['message'] = data ['MESSAGE']
    }
  }
  var message = log.message || data.message || data.msg || data.MESSAGE || data.MSG || data.line.toString()
  // we might find sub fields in docker logs
  if ((data && data['SYSLOG_IDENTIFIER'] === 'dockerd') || data.source === 'dockerd') {
    var fields = (data['MESSAGE'] || message).match(/time="(.+Z)" level=(.+) msg="(.+)"/)
    if (fields && fields.length > 3) {
      data['@timestamp'] = fields[1]
      data['level'] = fields[2]
      data['message'] = fields[3]
    }
  }
  // console.log(log)
  logger.log('info', message, log)
}
module.export = TcpLogsene()
