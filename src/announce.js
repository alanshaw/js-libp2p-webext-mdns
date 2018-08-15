/* eslint-env webextensions */

'use strict'

const debug = require('debug')
const TCP = require('libp2p-tcp')
const tcp = new TCP()

module.exports = async function announce (peerInfo, options) {
  options = options || {}
  options.type = options.type || 'p2p'
  options.protocol = options.protocol || 'udp'

  const log = debug(`libp2p:webext-mdns:announce:${options.type}:${options.protocol}`)

  const multiaddrs = tcp.filter(peerInfo.multiaddrs.toArray())

  if (!multiaddrs.length) {
    log('no tcp addrs to announce')
    return null
  }

  const port = parseInt(multiaddrs[0].nodeAddress().port)
  const peerId = peerInfo.id.toB58String()

  const attributes = multiaddrs.reduce((attrs, addr, i) => {
    attrs['dnsaddr' + (i || '')] = addr.toString()
    return attrs
  }, {})

  log('annoucing', peerId, attributes)

  return browser.ServiceDiscovery.announce({
    name: peerId,
    type: options.type,
    protocol: options.protocol,
    port,
    attributes
  })
}
