'use strict'

const log = require('debug')('libp2p:webext-mdns')
const EventEmitter = require('events').EventEmitter
const setImmediate = require('async/setImmediate')
const discover = require('./discover')
const announce = require('./announce')

class WebExtMdns extends EventEmitter {
  constructor ({ peerInfo, ...options }) {
    super()
    if (!peerInfo) throw new Error('missing peer info')

    this._peerInfo = peerInfo

    options.announce = !(options.announce === false)
    this._options = options

    this._running = false
  }

  async start (callback) {
    if (this._running) {
      return setImmediate(() => callback(new Error('already started')))
    }

    log('starting')
    this._running = true

    if (this._options.announce) {
      try {
        this._service = await announce(this._peerInfo)
      } catch (err) {
        this._running = false
        return callback(err)
      }
    } else {
      log('not announcing')
    }

    this._discovery = discover(peerInfo => this.emit('peer', peerInfo))

    callback()
  }

  async stop (callback) {
    if (!this._running) {
      return setImmediate(() => callback(new Error('not started')))
    }

    log('stopping')
    this._running = false

    if (this._service) {
      this._service.expire()
      this._service = null
    }

    this._discovery.cancel()
    this._discovery = null
    setImmediate(callback)
  }
}

WebExtMdns.tag = 'webext-mdns'

module.exports = WebExtMdns
