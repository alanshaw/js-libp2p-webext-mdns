/* eslint-env webextensions */

'use strict'

const log = require('debug')('libp2p:webext-mdns:announce')
const TCP = require('libp2p-tcp')
const tcp = new TCP()

module.exports = async function announce (peerInfo) {
  const multiaddrs = tcp.filter(peerInfo.multiaddrs.toArray())

  multiaddrs.push(fakeTcpAddr())
  log('announcing fake addr', multiaddrs[multiaddrs.length - 1])

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

function fakeTcpAddr () {
  const ip = Array.from(Array(4), () => randomInt(0, 255)).join('.')
  return `/ip4/${ip}/tcp/4002`
}

function randomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}
