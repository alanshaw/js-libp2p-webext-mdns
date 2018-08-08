/* eslint-env webextensions */

'use strict'

const log = require('debug')('libp2p:webext-mdns')
const setImmediate = require('async/setImmediate')
const EventEmitter = require('events').EventEmitter
const WebExtMdns = require('./WebExtMdns')

class DummyMdns extends EventEmitter {
  start (cb) { setImmediate(cb) }
  stop (cb) { setImmediate(cb) }
}

if (typeof browser === 'undefined') {
  log('not in web extension')
  module.exports = DummyMdns
} else if (!browser.ServiceDiscovery) {
  log('browser.ServiceDiscovery unavailable')
  module.exports = DummyMdns
} else {
  module.exports = WebExtMdns
}
