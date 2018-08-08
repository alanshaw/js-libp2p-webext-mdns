/* eslint-env webextensions */

'use strict'

const log = require('debug')('libp2p:webext-mdns:announce')
const TCP = require('libp2p-tcp')
const tcp = new TCP()

module.exports = async function announce (peerInfo) {
  const multiaddrs = tcp.filter(peerInfo.multiaddrs.toArray())

  if (!multiaddrs.length) {
    log('no tcp addrs to announce')
    return null
  }

  const port = multiaddrs[0].toString().split('/')[4]
  const peerId = peerInfo.id.toB58String()

  const attributes = multiaddrs.reduce((attrs, addr, i) => {
    attrs['dnsaddr' + (i || '')] = addr
    return attrs
  }, {})

  return browser.ServiceDiscovery.announce({
    name: peerId,
    type: 'p2p',
    protocol: 'udp',
    port,
    attributes
  })
}
