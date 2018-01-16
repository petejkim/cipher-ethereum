import createKeccakHash from 'keccak/js'
import { decompressPublicKey } from './util'

export class Address {
  private _publicKey: Buffer
  private _rawAddress?: Buffer
  private _address?: string

  private constructor (publicKey: Buffer) {
    this._publicKey = decompressPublicKey(publicKey)
  }

  static from (publicKey: Buffer): Address {
    return new Address(publicKey)
  }

  static checksumAddress (address: string): string {
    const addrLowerCase = address.toLowerCase()
    if (!Address.isValid(addrLowerCase)) {
      throw new Error('invalid address')
    }
    const addr = addrLowerCase.startsWith('0x')
      ? addrLowerCase.slice(2)
      : addrLowerCase
    const hash = createKeccakHash('keccak256')
      .update(addr, 'ascii')
      .digest('hex')
    let newAddr: string = '0x'

    for (let i = 0; i < addr.length; i++) {
      if (hash[i] >= '8') {
        newAddr += addr[i].toUpperCase()
      } else {
        newAddr += addr[i]
      }
    }

    return newAddr
  }

  static isValid (address: string): boolean {
    const addr = address.match(/^0[xX]/) ? address.slice(2) : address
    if (addr.length !== 40) {
      return false
    }

    if (addr.match(/[0-9a-f]{40}/) || addr.match(/[0-9A-F]{40}/)) {
      return true
    }

    let checksumAddress: string
    try {
      checksumAddress = Address.checksumAddress(addr)
    } catch (_err) {
      return false
    }

    return addr === checksumAddress.slice(2)
  }

  get publicKey (): Buffer {
    return this._publicKey
  }

  get rawAddress (): Buffer {
    if (!this._rawAddress) {
      this._rawAddress = createKeccakHash('keccak256')
        .update(this._publicKey.slice(1))
        .digest()
        .slice(-20)
    }
    return this._rawAddress
  }

  get address (): string {
    if (!this._address) {
      const rawAddress = this.rawAddress.toString('hex')
      this._address = Address.checksumAddress(rawAddress)
    }
    return this._address
  }
}
