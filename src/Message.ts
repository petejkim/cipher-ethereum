import { bnToBuffer, keccak256 } from './util'

import { Address } from './Address'
import { ec as EC } from 'elliptic'

const secp256k1 = new EC('secp256k1')

export class Message {
  private _message: Buffer
  private _hash: Buffer | null = null

  constructor (message: Buffer) {
    this._message = message
  }

  get message () {
    return this._message
  }

  get hash (): Buffer {
    if (this._hash) {
      return this._hash
    }
    const prefix = Buffer.from(
      `\x19Ethereum Signed Message:\n${this._message.length}`,
      'utf8'
    )
    const messageToSign = Buffer.concat([prefix, this._message])
    this._hash = keccak256(messageToSign)
    return this._hash
  }

  sign (privateKey: Buffer): Buffer {
    const sig = secp256k1
      .keyFromPrivate(privateKey)
      .sign(this.hash, { canonical: true })

    const sigBuf = Buffer.alloc(65)
    let offset = 0

    // copy r
    const r = bnToBuffer(sig.r)
    offset += 32 - r.length
    offset += r.copy(sigBuf, offset)

    // copy s
    const s = bnToBuffer(sig.s)
    offset += 32 - s.length
    offset += s.copy(sigBuf, offset)

    // copy v
    sigBuf.writeUInt8((sig.recoveryParam || 0) + 27, offset)
    return sigBuf
  }

  ecRecover (signature: Buffer): string {
    if (signature.length !== 65) {
      throw new Error('Invalid signature')
    }
    const recoveryParam = signature[signature.length - 1] - 27
    const sig = {
      r: signature.slice(0, 32),
      s: signature.slice(32, 64)
    }
    const point = secp256k1.recoverPubKey(this.hash, sig, recoveryParam)
    const pubKey = Buffer.from(point.encode('hex', true), 'hex')
    return Address.from(pubKey).address
  }
}
