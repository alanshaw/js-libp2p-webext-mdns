'use strict'

const log = require('debug')('libp2p:webext-mdns:announce')
const EventEmitter = require('events').EventEmitter
const discover = require('./discover')
const announce = require('./announce')

class WebExtMdns extends EventEmitter {
  constructor ({ peerInfo, ...options }) {
    super()
    if (!peerInfo) throw new Error('missing peer info')

    this._peerInfo = peerInfo

    options.announce = !(options.announce === false)
    options.discoveryInterval = options.discoveryInterval == null
      ? 10 * 1000
      : options.discoveryInterval

    this._options = options
  }

  async start (callback) {
    if (this._discovery) {
      return setImmediate(() => callback(new Error('already started')))
    }

    log('starting')

    if (this._options.announce) {
      try {
        this._service = await announce(this._peerInfo)
      } catch (err) {
        return callback(err)
      }
    } else {
      log('not announcing')
    }

    this._discovery = discover(
      peerInfo => this.emit('peer', peerInfo),
      { interval: this._options.discoveryInterval }
    )

    callback()
  }

  async stop (callback) {
    if (!this._discovery) {
      return setImmediate(() => callback(new Error('not started')))
    }

    log('stopping')

    if (this._service) {
      this._service.expire()
      this._service = null
    }

    try {
      await this._discovery.cancel()
    } catch (err) {
      return callback(err)
    } finally {
      this._discovery = null
    }

    callback()
  }
}

WebExtMdns.tag = 'webext-mdns'

module.exports = WebExtMdns
