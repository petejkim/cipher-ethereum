import * as rlp from 'rlp'

import {
  bigNumberToBuffer,
  bnToBuffer,
  hexToBuffer,
  keccak256,
  numberToBuffer
} from './util'

import { BigNumber } from 'bignumber.js'
import { ec as EC } from 'elliptic'

const secp256k1 = new EC('secp256k1')

export interface TransactionParams {
  nonce: number
  gasPriceWei: BigNumber
  gasLimit: BigNumber
  toAddress?: string | null
  valueWei: BigNumber
  data?: string | null
  chainId?: number
  v?: number
  r?: string
  s?: string
}

export class Transaction {
  private nonce: Buffer
  private gasPriceWei: Buffer
  private gasLimit: Buffer
  private toAddress: Buffer
  private valueWei: Buffer // in wei
  private data: Buffer
  private chainId?: number
  private v: number
  private r: Buffer
  private s: Buffer

  constructor (params: TransactionParams) {
    this.nonce = numberToBuffer(params.nonce)
    this.gasPriceWei = bigNumberToBuffer(params.gasPriceWei)
    this.gasLimit = bigNumberToBuffer(params.gasLimit)
    this.toAddress = params.toAddress
      ? hexToBuffer(params.toAddress)
      : Buffer.alloc(0)
    this.valueWei = bigNumberToBuffer(params.valueWei)
    this.data = params.data ? hexToBuffer(params.data) : Buffer.alloc(0)
    this.chainId = params.chainId ? params.chainId : undefined // disallow 0
    this.v = params.v || 28
    this.r = params.r ? hexToBuffer(params.r) : Buffer.alloc(0)
    this.s = params.s ? hexToBuffer(params.s) : Buffer.alloc(0)
  }

  get fields (): Buffer[] {
    return [
      this.nonce, // 0: nonce
      this.gasPriceWei, // 1: gas price
      this.gasLimit, // 2: gas limit
      this.toAddress, // 3: to
      this.valueWei, // 4: value
      this.data, // 5: data
      numberToBuffer(this.v), // 6: v
      this.r, // 7: r
      this.s // 8: s
    ]
  }

  get rlp (): Buffer {
    return rlp.encode(this.fields)
  }

  get hash (): Buffer {
    return keccak256(this.rlp)
  }

  get fieldsForSigning (): Buffer[] {
    const fields = this.fields.slice(0, 6)
    return this.chainId
      ? fields.concat([
          // EIP155
          numberToBuffer(this.chainId), // 6: v = chainID
          numberToBuffer(0), // 7: r = 0
          numberToBuffer(0) // 8: s = 0
        ])
      : fields
  }

  get hashForSigning (): Buffer {
    return keccak256(rlp.encode(this.fieldsForSigning))
  }

  sign (privateKey: Buffer): Buffer {
    const sig = secp256k1
      .keyFromPrivate(privateKey)
      .sign(this.hashForSigning, { canonical: true })

    this.v =
      (sig.recoveryParam || 0) + 27 + (this.chainId ? this.chainId * 2 + 8 : 0)
    this.r = bnToBuffer(sig.r)
    this.s = bnToBuffer(sig.s)

    return this.rlp
  }
}
