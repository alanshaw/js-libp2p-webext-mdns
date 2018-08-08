# libp2p-webext-mdns

> libp2p MDNS discovery for web extensions

## Lead Maintainer

[Alan Shaw](https://github.com/alanshaw)

## Install

```sh
npm i libp2p-webext-mdns
```

## Usage

```js
const MDNS = require('libp2p-webext-mdns')

const mdns = new MDNS(config)

mdns.on('peer', peerInfo => console.log('Found peer', peerInfo.id.toB58String()))

// Broadcast for 20 seconds
mdns.start(() => setTimeout(() => mdns.stop(), 20 * 1000))
```

- `config`
  - `peerInfo` ([PeerInfo](https://www.npmjs.com/package/peer-info)) (required) PeerInfo to announce
  - `announce` (boolean) announce our presence through mDNS, default true
  - `discoveryInterval` (number) interval between discovery runs, default 10 seconds

  ## Contribute

  Feel free to dive in! [Open an issue](https://github.com/alanshaw/js-libp2p-webext-mdns/issues/new) or submit PRs.

  ## License

  [MIT](LICENSE) © Alan Shaw
