/* eslint-env webextensions */

'use strict'

const debug = require('debug')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const Multiaddr = require('multiaddr')

module.exports = function discover (onPeer, options) {
  options = options || {}
  options.type = options.type || 'p2p'
  options.protocol = options.protocol || 'udp'

  const log = debug(`libp2p:webext-mdns:discover:${options.type}:${options.protocol}`)
  const handle = {}

  const doDiscover = async () => {
    log('started', options)

    const services = browser.ServiceDiscovery.discover(options)

    handle.cancel = () => {
      log('canceled', options)
      services.return()
    }

    try {
      for await (let service of services) {
        // TODO: report lost service
        if (service.lost) {
          log('lost service', service)
          continue
        }
        log('found service', service)
        onPeer(await serviceToPeerInfo(service))
      }
    } catch (err) {
      log(err)
    }

    log('ended')
  }

  doDiscover()

  return handle
}

async function serviceToPeerInfo (service) {
  const peerId = PeerId.createFromB58String(service.name)
  const peerInfo = await new Promise((resolve, reject) => {
    PeerInfo.create(peerId, (err, peerInfo) => {
      if (err) return reject(err)
      resolve(peerInfo)
    })
  })

  /* https://github.com/mozilla/libdweb/issues/48
  const multiaddrs = Object.keys(service.attributes).reduce((addrs, key) => {
    if (key.startsWith('dnsaddr')) {
      try {
        addrs.push(new Multiaddr(service.attributes[key]))
      } catch (err) {
        log('invalid multiaddr', service.attributes[key])
      }
    }
    return addrs
  }, [])
  */
  const multiaddrs = service.addresses.map(a => {
    return new Multiaddr(`/ip${a.includes(':') ? 6 : 4}/${a}/tcp/${service.port}`)
  })

  multiaddrs.forEach((addr) => peerInfo.multiaddrs.add(addr))

  return peerInfo
}
