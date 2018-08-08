/* eslint-env webextensions */

'use strict'

const log = require('debug')('libp2p:webext-mdns:discover')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const { promisify } = require('utils')
const createPeerInfo = promisify(PeerInfo.create)
const Multiaddr = require('multiaddr')

module.exports = function discover (onPeer, options) {
  options = options || {}
  options.interval = options.interval || 10 * 1000

  const handle = {}

  const doDiscover = async () => {
    log('discovery started')

    const services = browser.ServiceDiscovery.discover({
      type: 'p2p',
      protocol: 'udp'
    })

    handle.canceled = false
    handle.cancel = () => {
      handle.canceled = true
      return handle.discovery
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
        if (handle.canceled) return
      }
    } catch (err) {
      log(err)
    }

    const rediscover = setTimeout(() => {
      log(`discovering again in ${options.interval}ms`)
      handle.discovery = doDiscover()
    }, options.interval)

    handle.cancel = async () => clearTimeout(rediscover)
    log('discovery ended')
  }

  handle.discovery = doDiscover()

  return handle
}

async function serviceToPeerInfo (service) {
  const peerId = PeerId.createFromB58String(service.name)
  const peerInfo = await createPeerInfo(peerId)

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

  multiaddrs.forEach((addr) => peerInfo.multiaddrs.add(addr))

  return peerInfo
}
